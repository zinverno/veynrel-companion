# Veynrel Companion branding and compatibility

This maintenance change renames the product from **Vault Audit AI Companion** to **Veynrel Companion**. The parent plugin is **Veynrel**, with canonical repository [zinverno/veynrel](https://github.com/zinverno/veynrel).

## Compatibility contract

Existing users need no environment variable migration, token changes, database migration, Vault resync, protocol changes, or MCP reconfiguration. HTTP protocol v1, `x-companion-protocol-version`, HTTP/MCP routes and tool names, SQLite schemas and storage, Qdrant semantics, hashes, proposal rules, token privileges, and `DATA_DIR` resolution are unchanged. Obsidian is the only writer to the Vault; proposals still require explicit human approval in Obsidian.

The only runtime text changes are the startup log, OpenRouter's `x-title` display value, and the optional MCP display `title`. MCP's technical `name` and version stay unchanged. OpenRouter's header name, `http-referer`, authorization, model, endpoint, and query payload stay unchanged. See [OpenRouter's attribution documentation](https://openrouter.ai/docs/app-attribution) for the distinction between display title and app identity.

## Package identity decision

| Field | Before | After |
| --- | --- | --- |
| Private package name | `vault-audit-ai-companion` | `veynrel-companion` |
| Package version | `0.1.0` | `0.1.0` |
| `private` | `true` | `true` |

The name is local package metadata: no self-import, package-name lookup, workspace selector, published package dependency, or `npm_package_name` consumer exists in this repository. Scripts and CI use `npm run` and file paths; `npm start` launches `dist/server.js`. The plugin's sibling smoke helper resolves a checkout path and dependencies from `package.json`, without checking its name. The package and lockfile root names change together; scripts, engines, dependency versions, and the dependency graph stay unchanged. npm's displayed package label changes, with no runtime or tooling configuration migration. No version bump is needed for this branding-only change.

## Technical identifier inventory

Scope: all tracked files, including hidden configuration, scripts, tests, fixtures, and documentation. Audit patterns: `Vault Audit AI`, `vault_audit`, `VAULT_AUDIT`, `vault-audit`, and the additional camel-case `vaultAudit` form. References repeated in this document describe the same identifiers below.

| Identifier / text | Files / usage | Classification | Decision |
| --- | --- | --- | --- |
| `Vault Audit AI Companion`, `Vault Audit AI` | `README.md`, `package.json`, `src/server.ts`, `src/mcp/queryEmbedding.ts` | branding-only | Current product text becomes Veynrel Companion / Veynrel. Historical names remain explicitly labelled in the extraction history and this record. |
| `vault-audit-ai-companion` as private package name | `package.json`; top-level and root-package names in `package-lock.json` | internal-only | Rename to `veynrel-companion`; independent of MCP identity and checkout directory. |
| `vault-audit-ai-companion` as MCP server `name` | `src/mcp/mcpServer.ts`, `tests/mcpProtocol.test.ts`, `README.md` | compatibility-sensitive | Retain technical name and `0.1.0`; use `title: "Veynrel Companion"` for display. Tests check modern and legacy clients. |
| `zinverno/vault-audit-ai-companion`, clone URL and `cd vault-audit-ai-companion` | `README.md`, current repository link below | branding-only | Keep current address and clone directory until the separate repository rename. |
| `zinverno/vault-audit-AI`, `../vault-audit-AI` | `README.md` | branding-only | Current plugin links and sibling directory use `zinverno/veynrel` / `../veynrel`. Keep the old repository name only as extraction provenance; historical commit/path links use the canonical host repository. |
| `VAULT_AUDIT_COMPANION_DIR` | `README.md`; consumed by the plugin's sibling smoke helper | compatibility-sensitive | Retain the development checkout override, including after repository rename. |
| `vault_audit` as an MCP client key | `README.md` Codex, Claude Code and Cursor examples | compatibility-sensitive | Retain existing client configuration and tool namespace. |
| `VAULT_AUDIT_MCP_TOKEN` | `README.md` Codex and Claude Code examples | compatibility-sensitive | Retain the client environment name that supplies the unchanged server `MCP_TOKEN`. |
| `/var/lib/vault-audit-companion` | `README.md` VPS `DATA_DIR` example | compatibility-sensitive | Keep the existing data location; renaming it could select an empty database. |
| `vault_audit`, `vault_audit_vps`, generated `vault_audit_<hash>_<hash>` | `src/config.ts`, `tests/qdrantIndex.test.ts`, `README.md` Qdrant default/examples | compatibility-sensitive | Preserve collection prefixes, default and generated collection identities. |
| `vault-audit-ai:1` | `src/search/qdrantIndex.ts` ownership hash input | compatibility-sensitive | Preserve exact hash preimage to recognize existing owned collections. |
| `vaultAuditOwner` | `src/search/qdrantIndex.ts`, `tests/qdrantIndex.test.ts` | compatibility-sensitive | Preserve persisted Qdrant metadata key and its ownership checks. |

Other configuration names, including `COMPANION_TOKEN`, `MCP_TOKEN`, `MCP_VAULT_ID`, all `MCP_*` / `QDRANT_*` variables and `DATA_DIR`, remain unchanged. No additional matching internal-only identifiers were found beyond private package metadata.

## Separate repository rename after merge

Current repository: [zinverno/vault-audit-ai-companion](https://github.com/zinverno/vault-audit-ai-companion).

Planned rename, **after this PR merges**: `zinverno/vault-audit-ai-companion` → `zinverno/veynrel-companion`. The future address will be `https://github.com/zinverno/veynrel-companion`; it is intentionally not an active install link yet. This PR does not rename the GitHub repository, create a release, or tag a version.

Immediately after the GitHub rename, update these files in this Companion repository:

| File | Required follow-up |
| --- | --- |
| `README.md` | Replace the current clone URL with `https://github.com/zinverno/veynrel-companion.git`; change the new-clone command to `cd veynrel-companion`; replace the pending-rename paragraph with the canonical repository address. |
| `REBRANDING.md` | Update the current repository link above to `https://github.com/zinverno/veynrel-companion`, mark this checklist completed, and describe the address transition as history in the inventory. Keep historical before/after values and compatibility identifiers. |

No other tracked Companion file contains a repository-address dependency: CI uses local checkout, and package metadata has no repository URL, badge, registry, or deployment-image reference to update. In particular, do not change the retained MCP name in source/tests or Qdrant/storage/environment identifiers during the repository rename.

Outside this repository, update Git remotes to the new URL when convenient. Existing local checkout paths, service working directories, environment files and `DATA_DIR` can stay as they are. Renaming the checkout directory is optional; preserve the resolved data location if moving it.

The plugin repository also needs follow-up in **`README.md`** (Companion repository link and new-clone directory examples) and **`scripts/companion-smoke-sibling.mjs`** (default `../vault-audit-ai-companion` sibling path). Keep `VAULT_AUDIT_COMPANION_DIR` supported for existing checkout locations. Those plugin files are outside this PR.
