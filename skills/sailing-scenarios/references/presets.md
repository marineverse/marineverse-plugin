# Existing scenarios

Use these public links directly when the scene fits the user's question. Titles
describe teaching examples, not complete statements of the applicable rules.

| Preset | Useful starting point | Link |
| --- | --- | --- |
| port-starboard | Crossing boats on opposite tacks; ducking behind | [Open](https://www.marineverse.com/marineverse-cup/racing-rules/canvas?preset=port-starboard&view=all) |
| windward-leeward | Same-tack boats alongside each other | [Open](https://www.marineverse.com/marineverse-cup/racing-rules/canvas?preset=windward-leeward&view=all) |
| overtaking | One boat passing another | [Open](https://www.marineverse.com/marineverse-cup/racing-rules/canvas?preset=overtaking&step=last) |
| no-barging | Starting-line positioning | [Open](https://www.marineverse.com/marineverse-cup/racing-rules/canvas?preset=no-barging&autoplay=1) |
| mark-room | Multiple boats approaching and rounding a mark | [Open](https://www.marineverse.com/marineverse-cup/racing-rules/canvas?preset=mark-room&autoplay=1) |

A preset-only URL contains an identifier, not the underlying scene. For custom
changes to port-starboard or mark-room, start with the copied JSON in `examples/`.
For other presets, use Designer and Export JSON (or ask the user to provide that
export) before modifying exact geometry. Do not invent the missing frames.

The examples are exact serialized copies of the corresponding objects in
`marineverse-frontend/components/racing-rules-canvas/presets.js`. When the canvas
schema or preset changes, update the copies, scene reference and helper together.
