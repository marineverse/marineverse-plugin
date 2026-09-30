# Release and discovery

Maintain the shared MCP skill here. The Rails server owns the tools and checked-in
FAQ/history content; the CLI owns its separate CLI skill. Keep manifest versions
in sync when releasing this package. Test the deployed server before submitting
metadata that describes new tools.

## Local checks

1. Confirm the root `plugin.json` and `mcp.json` use the portable Agent Plugins
   format. Keep identity, version and presentation synchronized with the
   compatibility manifests; keep both MCP configurations on the same endpoint.
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

Prepare publisher/domain verification, website/support/privacy/terms links,
reviewer-ready demo credentials, a demo recording, release notes, accurate boolean
`readOnlyHint`, `openWorldHint` and `destructiveHint` annotations on each tool,
and the five positive and three negative cases embedded in root `plugin.json`.
Annotation justifications are not required. Keep the additional consent, write
and injection scenarios in [acceptance.md](acceptance.md) as regression checks.
Run the cases and record actual responses before submitting. Submit for review, then publish
after approval. An imported skill is a release artifact: editing GitHub is not a
substitute for updating the submitted version.

Finish the listing and publication inputs and real demo recording described in
[submission preparation](submission-preparation.md) before uploading a final
bundle. Build a separate upload copy with the root manifests, both skill folders
and their references, icons, license and notices. Include compatibility manifests
if needed. Never include `.git`, credentials, root `.app.json`, or any non-null
`apps` declaration. Do not remove Portal-generated bindings from a finalized
release. ZIP the single `marineverse-plugin/` directory, then inspect the archive.

See [plugin packaging](https://developers.openai.com/plugins/build/plugins) and
[reusing a Claude plugin](https://developers.openai.com/plugins/guides/submit-claude-plugin)
for current import formats.

## Claude

The Claude manifest uses top-level `displayName` and `description`. Its
[manifest reference](https://code.claude.com/docs/en/plugins-reference) does not
define OpenAI's `interface`, category or image fields. The README displays the
shared brand image; keep directory-specific branding in Claude's submission form.

The remote **connector** listing makes the hosted MCP server discoverable in
Claude. Start at [directory submission](https://claude.ai/directory/manage/new)
and follow the [connector submission requirements](https://claude.com/docs/connectors/building/submission).
Submit the endpoint, authentication details, product metadata and test instructions.

A **plugin** packages the skill together with the MCP configuration for clients
that support plugins. This repository provides that package; follow
[Claude directory publication](https://claude.com/docs/directory/publish) for its
separate review/distribution flow. A connector listing and a plugin package are
related deliverables, not interchangeable registrations.

## OpenAI listing copy

**Name:** MarineVerse

**Short description:** Sailing: learn, relax, race

**Description:** MarineVerse helps people learn, practise and enjoy sailing through browser, VR and desktop simulation. Explore sailing lessons, racing practice, clubs and schools, or connect your account for progress, statistics, Globe boats and supported club actions.

**Category:** Education & Research. This is OpenAI-specific metadata; do not copy
provider-specific categories or interface fields into the Claude manifest.

Use the bundled MarineVerse brand assets. This MCP server has no custom UI;
do not submit UI screenshots unless a future server version supplies one.
See the [submission requirements](https://developers.openai.com/plugins/deploy/submission-errors).

## Optional later: import skills from MCP

Keep this GitHub repository as the source of truth. The server can vendor the
two skill folders from a pinned release, including their references, rather than
maintaining a second copy by hand or fetching a moving branch on each request.

OpenAI supports a static subset of the draft skills extension: advertise
`io.modelcontextprotocol/skills` under `capabilities.extensions`, implement
`skills/list` and `skills/get`, and serve every declared file through
`resources/read` with matching SHA-256 digests. This is not yet a stable MCP feature.
Preserve the sibling skill link when packaging and verify both skills import.

Imports are submission-time snapshots, not automatic runtime skill updates.
Re-scan and submit a new plugin version after changing them. Keep the existing
plugin bundle for clients without this extension. This is a future option,
not a capability of the current MarineVerse server.
See [OpenAI's skill import contract](https://developers.openai.com/plugins/build/mcp-server#import-skills-from-the-mcp-server).
