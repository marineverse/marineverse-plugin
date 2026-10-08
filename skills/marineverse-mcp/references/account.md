## Connected account workflows

Use account linking only for protected tools. If authorization is missing or
expired, direct the user to connect or reconnect MarineVerse in the host's
connection settings. Never request passwords, access tokens or client secrets.
Respect permission, authentication and membership errors without
retry loops or attempts to bypass them through another surface.

- **Progress:** `get_sailing_progress` can guide a practice plan. Distinguish
  completed and unfinished lessons; the connection cannot launch the app or
  mark a lesson complete.
- **Statistics:** `get_sailing_statistics` returns lifetime totals by boat type,
  not a daily or weekly activity history. One snapshot does not establish a trend.
- **Identity:** Use `get_profile` when identifying the connected sailor matters.
- **Boats:** `list_my_boats`, then `get_boat` with a returned UUID. These are
  owned or crewed Globe boats and last-known backend state, not live telemetry;
  `time_since_last_update_seconds` shows how fresh it is. `get_boat` answers
  "how is my boat doing now" in one call: state, `weather` (hourly forecast
  arrays), `weather_now` (forecast interpolated to now; null when unavailable),
  `weather_units` and `last_port_call`. Describe weather as a forecast, not an
  observation. Pass `include_weather: true` to `list_my_boats` only when weather
  for several boats is needed.
- **Boat history:** `get_boat_history` only when the user asks what happened:
  `type` `logs` (kept for only about a day; see `oldest_available_at`),
  `port-calls` or `passages`, newest first. Follow `next_cursor` only when more
  records are needed. Arrivals and departures come from port calls.
- **Other boats:** `get_boat_profile` reads a visible public boat (for example
  from a leaderboard): position, forecast, last port call, distance statistics,
  recent passages, seas visited and races. Private boats are unavailable.
- **Followed boats:** `list_followed_boats` lists the active boats the sailor
  follows, newest activity first (up to 100), with owner and `profile_url`.
  `follow_boat` and `unfollow_boat` take a returned `boat_uuid`, for example
  from a leaderboard; confirm with the user first. Only public boats can be
  followed through the tool; a private owner's boat is followed on the website
  through the owner's invite link, and the sailor's own boats cannot be followed.
- **Racing:** For results, personal activity, ratings, comparisons and today's
  opportunities, read the [racing workflow](racing.md). It covers DRP,
  multiplayer and Globe, keeping calendar history distinct from lifetime totals.
- **Maps and Windy:** use the returned website links; there is no map tool.
- **Knowledge base:** `search_knowledge` finds relevant sailing articles.
  Search and `get_knowledge_article` require an active MarineVerse membership.
  Search consumes knowledge-search quota; use it for relevant requests and do
  not automatically retry an uncertain result.
  `get_knowledge_article` reads a returned article UUID;
  attribute its title and do not invent an article URL.
- **Feedback:** Find a board with `list_feedback_boards`, browse
  `list_feedback_posts`, and read `get_feedback_post`. Check
  `find_similar_feedback_posts` before proposing a new post.
  Creating posts or comments publishes as the connected sailor and may notify
  the MarineVerse community on Discord.
