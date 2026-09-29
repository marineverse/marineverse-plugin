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
  owned or crewed Globe boats and last-known backend state, not live telemetry.
- **Races:** `list_globe_races`, then `get_globe_race` with a returned public key.
  Preserve rankings, penalties and states. This covers open/active races and the
  latest ten finished Globe races, not Sailing Club daily time trials or a full
  race archive.
- **Knowledge base:** `search_knowledge` finds relevant sailing articles.
  Search and `get_knowledge_article` require an active MarineVerse membership.
  `get_knowledge_article` reads a returned article UUID;
  attribute its title and do not invent an article URL.
- **Feedback:** Find a board with `list_feedback_boards`, browse
  `list_feedback_posts`, and read `get_feedback_post`. Check
  `find_similar_feedback_posts` before proposing a new post.
