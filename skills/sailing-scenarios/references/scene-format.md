# Canvas scene format

Read only when authoring or decoding custom scenes. The two JSON examples are
copied from frontend presets; no frontend checkout is needed to use this skill.

## Coordinates and sequence

- `name`: scene metadata, up to 200 characters. The current frontend rewrites
  custom names to "Custom situation" when synchronizing its URL. Use a `text`
  object for a visible title that survives editing.
- `windDirection`: degrees wind comes **from**, 0 is top, clockwise, [0, 360).
- `stepCount`: integer 1–50. Object `frames` keys are zero-based: `"0"` is Step 1.
- `objects`: at most 40 boats, marks, start lines or text objects.
- `viewport` optional: `{ "cx": 0, "cy": 0, "w": 600, "h": 400 }` in world
  units. Positive width/height frame a region responsively. Legacy
  `{ "cx": 0, "cy": 0, "scale": 1 }` is supported (scale 0.05–10).

World x increases right; y increases down. Coordinates are diagram units, not
GPS, metres or seconds. Boat hulls are 60 units long. A boat's `bearing` is bow
direction: 0 up, 90 right, 180 down, 270 left. Wind and bearing are different.
Sails are drawn automatically from their relative angle.

Each frame contains finite `x`, `y`, and optional `bearing` or `rotation`.
The most recent defined frame carries forward **as a whole** to later steps;
fields do not merge across frames. Include full x/y/bearing when changing a boat.
Editing an inherited frame may affect following steps until the next explicit
frame: add a restoring frame if the user meant to change only one moment.
Playback advances authored steps, not simulated motion or elapsed race time.
All-step view groups repeated positions even when the bearing changed; use
single-step view to explain a turn in place.

| Object type | Static fields | Frame |
| --- | --- | --- |
| `boat` | `label`, `hullColor` | x, y, bearing |
| `mark` | `label`, `fill`, `showZone` | x, y |
| `startLine` | `label`, `length` | x, y, rotation (0 horizontal, clockwise) |
| `text` | `text`, `fontSize`, `width` | x, y |

Start-line x/y is its center; at rotation 0, the pin is left and committee boat
right. A mark's `showZone` draws a radius of 180 units (three drawn hull lengths),
not an automatic determination of which rules or real-world distances apply.

Labels max 200 characters, text max 1000. Colors use hex (#RGB, #RRGGBB or
#RRGGBBAA). Length/width 10–4000; fontSize 6–200. Static labels, text and wind
apply to the whole scene; per-step prose belongs in the accompanying explanation.
Do not add IDs, visibility flags, timestamps or other unsupported fields.

## Helper

Run from the skill directory, or use its absolute script path:

```sh
node scripts/scene-link.mjs validate scene.json
node scripts/scene-link.mjs encode scene.json --step 3
node scripts/scene-link.mjs encode scene.json --view all
node scripts/scene-link.mjs encode scene.json --autoplay 1
node scripts/scene-link.mjs decode 'CANVAS_URL'
node scripts/scene-link.mjs encode revised.json --from 'CANVAS_URL' --step 2
```

`decode` prints `{ "scene": {...}, "presentation": {...} }`. Save only `.scene`
as the input file for validate/encode, not the entire wrapper. A preset-only link
returns `{ "preset": "key", "presentation": {...} }` with no scene: use the
matching example or Designer export. Preserve the original link for `--from`.
`--from` preserves only `step`, `view` and `autoplay` from the original URL,
replacing its old state/preset with the supplied scene. Explicit flags override
those options. `--view single` clears all-step view; `--autoplay 0` clears play.
Steps in URLs are **one-based** or `last`. Autoplay takes precedence over all-step
view in the frontend. The helper rejects an out-of-range step after an edit.

The canonical URL is
`https://www.marineverse.com/marineverse-cup/racing-rules/canvas`.
Serialization is deliberately two layers: first
`encodeURIComponent(JSON.stringify(scene))`, then set that value using
`URLSearchParams.set('state', value)`. Decode `searchParams.get('state')` once
with `decodeURIComponent`, then JSON.parse. Do not hand-escape or concatenate it.
Unicode and literal percent signs in labels are supported; keep them as normal
JSON strings and let the helper handle encoding.

The helper rejects unsupported fields and invalid bounds instead of silently
dropping/clamping data as the browser sanitizer can. It enforces the frontend's
100 KiB encoded-state limit; long links can still exceed a host's practical
limits. Prefer fewer objects/steps and shorter text if sharing fails. It only
parses official canvas URLs and never fetches them or executes scene content.
