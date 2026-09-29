# Release and discovery

Maintain the shared MCP skill here. The Rails server owns the tools and checked-in
FAQ/history content; the CLI owns its separate CLI skill. Keep manifest versions
in sync when releasing this package. Test the deployed server before submitting
metadata that describes new tools.

## Local checks

1. Confirm both manifests point to the existing shared skill and `.mcp.json`.
2. Load the plugin in an assistant with a fresh, disconnected MarineVerse session.
3. Run the scenarios in [acceptance.md](acceptance.md), then repeat the protected
   cases with a test account. Do not publish account data in test evidence.
4. Confirm the endpoint is deployed, public tools work without OAuth, account
   linking succeeds, and writes require the expected permissions and consent.
5. Review listing text against the actual tools. Skills improve workflows after
   installation; they do not guarantee search ranking or directory acceptance.

## OpenAI: ChatGPT and Codex

Use the [OpenAI plugin portal](https://platform.openai.com/plugins) and current
[submission guide](https://developers.openai.com/plugins/deploy/submission).
The package contains an OpenAI-compatible manifest and the same skill used by
Claude. For a hosted MCP submission, supply the production endpoint and include
the skill through the portal's supported import/upload flow.

Prepare publisher/domain verification, privacy and terms links, accurate metadata,
and reproducible positive and negative test cases. Submit for review, then publish
after approval. An imported skill is a release artifact: editing GitHub is not a
substitute for updating the submitted version.

See [plugin packaging](https://developers.openai.com/plugins/build/plugins) and
[reusing a Claude plugin](https://developers.openai.com/plugins/guides/submit-claude-plugin)
for current import formats.

## Claude

The remote **connector** listing makes the hosted MCP server discoverable in
Claude. Start at [directory submission](https://claude.ai/directory/manage/new)
and follow the [connector submission requirements](https://claude.com/docs/connectors/building/submission).
Submit the endpoint, authentication details, product metadata and test instructions.

A **plugin** packages the skill together with the MCP configuration for clients
that support plugins. This repository provides that package; follow
[Claude directory publication](https://claude.com/docs/directory/publish) for its
separate review/distribution flow. A connector listing and a plugin package are
related deliverables, not interchangeable registrations.

## Suggested listing copy

**Name:** MarineVerse

**Short description:** Sail more often. Learn, relax and race.

**Description:** Find your next step in sailing with MarineVerse. Explore ways
to learn how to sail, enjoy relaxing virtual sailing and practise racing with a
sailing simulator. Read FAQs, release notes and learning links without a
MarineVerse account. Connect your account for your sailing progress, statistics,
Globe boats and supported races.

Use screenshots of real workflows and the MarineVerse brand assets selected for
the submission. Do not advertise future general sailing knowledge tools as live.
