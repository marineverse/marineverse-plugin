# Racing: explore, review, practise

Discover the host's available tool schemas before calling these names; prefixes
and deployed versions can differ. An unavailable tool is not a completed read.
Use returned canonical links as a useful destination when the requested data
cannot be read. Do not substitute the CLI to bypass a permission error.

## Public exploration

Choose the mode explicitly: `drp` is Daily Race Practice, `multiplayer` is
multiplayer racing, and `globe` is Globe racing. These are separate activities.

| Sailor's question | Tools and relevant arguments |
| --- | --- |
| Which leagues can I explore? | `list_racing_leagues`, then `get_racing_league` with a returned `league_key` |
| What races have taken place? | `list_racing_races` with `mode`, optional `boat`, DRP `league_key`, and `page` |
| What were the results and how did they sail? | `get_racing_race` with `mode`, `race_key`, optional `page`; `get_racing_entry` with a returned `entry_key` |
| Who leads the standings? | `get_racing_rankings` with `mode` and an appropriate `type` |
| What current or past series can I explore? | `list_racing_series` with `league_key`, `type`, `status`, `page`; `get_racing_series` with `series_key` |
| What tournaments are available? | `list_racing_tournaments`, then `get_racing_tournament` with `tournament_key` |
| When do regular community sessions start? | `get_racing_schedule` |

Public exploration needs no account. A connected session can add the sailor's
own context where permitted. Use `public_key`, never internal database IDs or
replay-storage keys. Follow returned pagination only when more results are
needed; one recent page is not a complete archive. The older `list_globe_races`
and `get_globe_race` tools cover open/active and latest ten finished Globe races;
prefer the paged racing tools when the question needs broader history.
`get_globe_race` returns a 25-entry leaderboard page with `entries_pagination`;
entries keep their race-wide `position`. Pass `page` to read further pages only
when needed.

DRP rankings support `type: rating|wins|streaks`, optional `league_key` (global
by default), and an exact `date` for rating snapshots. Multiplayer supports
`rating|participation`, `boat`, and `days` for participation. Geographic filters
are `country`, `region`, `subregion`, `state` and `city`; use the discovered schema
and do not invent a region or unsupported filter combination.

Series `type` is `weekly|monthly|seasonal`; `status` is
`current|past|upcoming`, determined by start/end dates. Detail includes revealed
race contributions, points/formulas, qualification thresholds, unqualified
sailors, and connected `my_*` progress. Preserve `revealed_races_only`,
`threshold_basis` and `calculated_through`; an unfinished race does not justify
claiming a final series standing.

## My activity and rating

Link the account through the host for protected tools:

- `get_racing_day` with `day: today|yesterday` provides a single daily brief.
  Its date and activity use the sailor's actual account-local calendar day,
  rather than each league's latest race. Today also combines available DRP
  practice, upcoming community sessions and Globe opportunities. Preserve
  unavailable optional sections and their explanations. Current owned/crewed
  Globe participation is labelled separately; it does not prove past ownership
  or boat activity on yesterday's date.
  Each mode has at most 100 attempt summaries, plus `total_entries` and
  `truncated`. For complete activity, paginate `list_my_racing_entries` for
  that mode, compare `created_at` in the returned account `time_zone`, and stop
  when entries are older than the brief's date. Follow individual entries or
  races for full analytics, ranked results and points. Today's DRP opportunities
  contain only `can_race: true`; blocked reasons remain in the dashboard.
- `get_racing_dashboard` combines current DRP opportunities, previous results,
  dated rating and geographic positions, series progress, multiplayer and Globe
  participation, podium totals and league streaks. This is the starting read for
  "how am I doing?"; request detail only where the question needs it.
- `list_racing_races` with `mine: true` returns DRP and multiplayer races the
  sailor participated in, ordered by their latest attempt. Globe returns races
  entered by boats they currently own or crew, newest race first by creation
  date. `list_my_racing_entries` returns individual
  attempts, newest first, with optional inclusive ISO timestamp `since` and
  `page`. Optional `race_key` limits history to one visible race, so all of the
  sailor's attempts remain reachable beyond the first page. A race summary and
  an individual attempt are different records.
- `get_racing_activity` returns a calendar with `type: marineverse|drp|multiplayer`
  and optional inclusive date-only `since`/`until`. Preserve the returned account
  `time_zone`, date range and every day's `count`/`level`, including actual zero
  days. It also gives current/longest streak and active-day totals. `marineverse`
  counts sailing days; DRP/multiplayer count races. This calendar differs from
  per-league participation streaks and lifetime sailing-distance totals.
- `get_racing_rating` with `mode` reads the connected sailor by default. DRP
  defaults to global; `league_key` selects a league and `date` an exact snapshot.
  `explain_racing_rating` uses the same DRP selectors and returns previous points,
  saved change, per-race calculator logs and `reconciled`/calculated change.
  Optional `profile` selects a public sailor, while the tool still needs linking.
- `list_racing_leagues` or `list_racing_tournaments` with `mine: true` reads
  personal memberships or tournament participation. Tournament
  detail contains registration state, participants and scheduled bracket matches.

Keep `requested_date` separate from the actual snapshot `date` and
`previous_date`: the latest stored snapshot can be older than today. Explain a
change using returned race contributions rather than attributing it to practice
or an inferred result. Preserve `change_unavailable_reason` when the baseline is
missing. Multiplayer returns its stored boat rating; `previous_rating` and delta
can be null with `history_available: false`. Do not invent a rating trend.
Tournament sailor ratings carry `rating_boat_model`; label that boat rather than
assuming it is the tournament's boat.

## What can I do today?

For a connected sailor asking for today's plan, start with `get_racing_day` using
`day: today`. Use `get_racing_dashboard` for deeper DRP opportunity context:
`can_race`, `availability_reasons`, attempts used/limit and reveal times. Explain
the returned restriction when a race is unavailable. Do not promise eligibility
from the league name or a public race listing alone.

Read `get_racing_schedule` for the MarineVerse server-owned community calendar,
sessions, their local weekly time,
IANA `time_zone`, volunteers and concrete UTC `next_start`. Preserve `as_of` and
sort/choose the relevant next occurrence; daylight saving can change the UTC
time. This published regular schedule is separate from personalized DRP races.
Use the returned live-sailing or external events-calendar link for the user's
next step. A calendar link alone does not establish a specific event, availability
or registration. Tournament match times come from tournament detail.

Reads do not start the simulator, join a room, register for a race or tournament,
or contact volunteers. Present relevant destinations; perform only an explicitly
requested action supported by an available tool.

## Performance, visibility and visuals

Race detail returns server-ranked `entries`, points, handicaps, penalties, an
existing `ai_summary` when visible, course/wind and `links`. Connected data can
include `my_result` and a first-page `my_attempts` preview outside the displayed
leaderboard. For full own-attempt history, use `list_my_racing_entries` with the
same `mode` and `race_key`, paginating with `page`.
Entry detail gives total time, start/mark/finish `stats`, course `legs` and
`maneuvers`. `compare_racing_entries` needs two different visible entries from the
same race and returns numeric differences plus aligned leg comparisons and a
visual comparison link, not a stored AI comparison. Existing AI summaries belong
to race detail. Differences are first minus second. Missing measurements remain null. Reading
results or explaining ratings never generates AI text or changes stored ratings.

Premium unrevealed DRP opponents' results/AI remain hidden. Intro races can expose
basic live standings while opponents' detailed analytics/replay remain restricted
until reveal. The sailor can inspect their own available entry when connected.
Private races, event entries and tournaments follow membership/participant
policies; a public key is not permission. Respect `results_available`,
`replay_available`, reveal times and unavailable errors. An empty or hidden result
is not a zero, DNF or absent measurement to reconstruct from another surface.

Race times, penalties and leg start/end times are seconds; derive leg duration
from numeric `end_time - start_time`. A raw `duration` without declared units is
not a basis for conversion. Speeds and average
VMG are knots; leg `distance_traveled` is meters. Preserve timestamps and label
conversions. Globe positions are signed degrees and course-distance fields are
nautical miles; public course-control IDs identify geometry, not database rows.
Course geometry is not a safe route around land.

Share returned `links.web`, `map_2d`, `map_3d` and `chart` when available, including
the comparison URL. Preserve canonical paths and query parameters; do not guess
an unavailable view or replay URL. Only open a browser when requested and the
host provides that action. Merely returning a link does not open it.
