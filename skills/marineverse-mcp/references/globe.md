# Globe boat state and controls

Discover the connected server's tool schemas first. A package update does not
deploy MCP tools. If `send_boat_command` or the new state fields are absent,
explain that limitation; do not emulate anchoring by lowering sails or change
another API to bypass it. The optional CLI has its own skill and release.

## Read the boat

Use `list_my_boats` to identify an owned or crewed boat, then `get_boat` with
its returned UUID for current state. Set `include_anchor_eligibility: true` only
when checking where to anchor; ordinary reads and lists omit that calculation.
Returned public profile links are the
right way to open the boat on the website. These MCP reads are backend snapshots,
not a continuous live connection. State freshness comes from the returned time
and `time_since_last_update_seconds`; unknown or missing fields stay unknown.

Summarize only what matters for the request:

- `anchor.state`, `bottom_contact`, `secured` and `securing`: dropping, contact
  with the bottom, and securing are separate steps. A successful drop starts
  `deploying`; it does not mean the boat is held. The saved attachment appears
  after bottom contact. `legacy_hold` is the older hold mode, not a physical anchor.
- `rode_m`, `target_rode_m`, `recommended_rode_m` and `total_rode_m`: chain/rope
  currently out, requested payout, recommended length and total available, in
  metres. Payout and retrieval take time. `retrieving` is not yet `stowed`.
- `eligibility.eligible` and `eligibility.reason`: use the server's reason to
  explain a rejected drop, such as moving too fast, being too far from shore,
  insufficient depth/rode or swing room, an active race, or unavailable data.
  Do not invent a safe depth or override a refusal. Depth is simulated, not
  surveyed bathymetry; this is game guidance, not real navigation advice.
- `anchor.can_control` and `anchor.can_trim_sails`, plus `crew_role`: login is
  separate from permission. Owners, skippers and boat admins can control the
  anchor and helm; a sail-trim role may change sails/sheets but cannot steer or
  anchor. Public/followed viewing does not confer a crew role.

MCP reads saved state and sends authorized commands; it never runs boat physics.
Logged-in website viewers may receive live state but can never become master.

Treat `dataset_warning` as a warning about changed shoreline data; do not move
an existing anchor attachment. Ignore unfamiliar optional fields and explain an
unknown state/reason as returned rather than treating it as success or crashing.

Offline stowed boats with both sails down retain the ordinary parked position
and wind-vane heading behavior, including in port. There is no separate “Start
drifting” action. Active attachments use the anchor simulation and its existing
port/collision assist. Lowering sails does not drop or secure a physical anchor.

## Make the requested change

Use `send_boat_command` for the exact authorized action, following the live
schema. Read `get_boat` first and use `anchor.revision` as `expected_revision`.
Create one fresh UUID `command_id` and a current UTC ISO 8601 `issued_at` for
that intent. Retain the complete arguments until the outcome is known.

| Intent | Command and fields |
| --- | --- |
| Lower the anchor | `anchor_drop` |
| Pay out or take in rode | `anchor_set_rode` with `rode_m`, or `recommended: true` |
| Secure at the requested length | `anchor_secure`; `recommended: true` also requests recommended payout |
| Retrieve the anchor | `anchor_retrieve` |
| Change heading, hoists or sheets | `boat_set_controls` with only the requested fields: `heading`, `mainsail_hoist_level`, `jib_hoist_level`, `mainsheet`, `jibsheet` |

Heading is degrees; hoists and sheets are fractions from 0 to 1. Hoist 0 lowers
the sail and 1 raises it; sheet 0 is in and 1 is eased. Do not add
unrequested sail or heading changes. Do not automatically secure just because
the user asked to drop, or retrieve just because they asked to lower sails.
If the user asked for the whole anchoring operation, execute each necessary
command in order using the preceding result's revision and report progress.
Taking in or retrieving may require bringing the boat nearer the anchor and
reducing load; report the returned reason instead of repeatedly issuing commands.
`update_boat` also supports ordinary heading/hoist changes and renaming when
permitted by the deployed schema and current boat state. Use `send_boat_command`
for active anchors or explicit ordered/idempotent retries.

The tool returns `receipt`, the unchanged `envelope`, and `http_status`. Report
an action as accepted only when its receipt says `applied: true`.
Describe deployment, payout and retrieval as in progress until a later snapshot
confirms completion. Avoid rapid polling; a later status read is enough when the
user requests confirmation. Do not call a saved receipt a fresh boat snapshot.

## Resolve command results

An exact retry reuses the same boat, command UUID, timestamp, expected revision
and intent fields. Changing any of these creates a different operation. Never
silently update the revision or issue a new UUID after a timeout/conflict.

- Network timeout or uncertain delivery: report the uncertainty. An exact retry
  within `retry_horizon_seconds` can recover the receipt without a second action;
  do not substitute a new command. Never retry indefinitely or after expiry.
- `stale_revision`: another command has changed the boat. Read current state and
  explain the conflict. A new command must be a deliberate decision using the
  new revision, never an automatic replay of older intent.
- `simulation_catching_up`, `command_expired` or an
  eligibility/permission refusal: report the reason and suggested next action.
  Some refusals are durable receipts; repeating them does not make them apply.
- `idempotency_conflict`: the command identity was reused with different intent.
  Stop and inspect the retained arguments rather than making up a replacement.

Authentication errors go through host account reconnection. Respect `globe_read`
and `globe_write` access and the server's boat role policy. Never request tokens,
the Rails/Go shared secret, and never use a WebSocket
to bypass the ordered control API.
