// Retained Stage 11 probes for this repository; no sibling checkout required.
// All mutations and their evidence stay in a disposable directory outside the repository.
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import process from "node:process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scratch = await mkdtemp(join(tmpdir(), "vault-proposal-mutations-"));
const protocol = "tests/proposalProtocol.test.ts";
const zero = "CREATE UPDATE DELETE and reject produce zero embeddings";
const capability = 'createMcpProposalCapability(storage.getProposalStore(), config.mcp.vaultId)';
const cases = [
  { id: "A", name: "proposal writes mirrored note", file: "src/proposals/storage.ts",
    from: 'const id = randomUUID(); const now = this.now();',
    to: 'this.database.prepare("UPDATE notes SET content = ? WHERE vault_id = ? AND path = ?").run(input.proposedContent ?? "", vaultId, input.path); const id = randomUUID(); const now = this.now();', test: protocol, pattern: zero },
  { id: "C", name: "MCP token can acknowledge APPLIED", file: "src/server.ts",
    from: 'if (!isAuthorized(request.headers.authorization, config.token))',
    to: 'if (!(isAuthorized(request.headers.authorization, config.token) || isAuthorized(request.headers.authorization, config.mcp.token)))', test: protocol, pattern: "MCP token cannot claim" },
  { id: "G", name: "Companion gains direct filesystem capability", file: "src/proposals/storage.ts",
    from: 'import { randomUUID } from "node:crypto";', to: 'import { writeFileSync } from "node:fs";\nimport { randomUUID } from "node:crypto";\nexport const directVaultWrite = writeFileSync;', test: protocol, pattern: "proposal modules have no filesystem" },
  { id: "I", name: "proposal triggers embedding provider", file: "src/server.ts", from: capability,
    to: `(() => { const cap = ${capability}; return { ...cap, create(input) { void queryEmbeddingProvider?.embedQuery({} as never, input.proposedContent ?? ""); return cap.create(input); } }; })()`, test: protocol, pattern: zero },
  { id: "J", name: "proposal touches Qdrant", file: "src/server.ts", from: capability,
    to: `(() => { const cap = ${capability}; return { ...cap, create(input) { void qdrantIndex?.ensureCollection({ collection: "proposal", owner: "mutation", dimensions: 3 } as never); return cap.create(input); } }; })()`, test: protocol, pattern: zero },
  { id: "K", name: "crashed claims never expire", file: "src/proposals/storage.ts",
    from: "claim_expires_at <= ?", to: "claim_expires_at > ?", test: "tests/proposals.test.ts", pattern: "expired claims recover after crashed plugin" },
];
function run(item) {
  const cwd = scratch;
  return spawnSync(process.execPath, [join(cwd, "node_modules/vitest/vitest.mjs"), "run", item.test, "-t", item.pattern],
    { cwd, encoding: "utf8", timeout: 30000 });
}
function passes(result) { assert.equal(result.status, 0, result.stdout + result.stderr); assert.match(result.stdout, /[1-9][0-9]* passed/); }
try {
  for (const path of ["package.json", "tsconfig.json", "tsconfig.test.json", "src", "tests"]) {
    await cp(join(root, path), join(scratch, path), { recursive: true });
  }
  await symlink(join(root, "node_modules"), join(scratch, "node_modules"), "dir");
  for (const item of cases) {
    const path = join(scratch, item.file); const original = await readFile(path, "utf8");
    assert.equal(original.split(item.from).length, 2, `Ambiguous mutation ${item.id}`);
    passes(run(item));
    try {
      await writeFile(path, original.replace(item.from, item.to)); const result = run(item);
      assert.notEqual(result.status, 0, `SURVIVED ${item.id}`);
      assert.match(result.stdout + result.stderr, /AssertionError/, `Non-assertion failure ${item.id}: ${result.stdout}${result.stderr}`);
      process.stdout.write(`${item.id}: KILLED — ${item.name}\n`);
    } finally { await writeFile(path, original); }
    passes(run(item));
  }
  process.stdout.write(`${cases.length}/${cases.length} Stage 11 mutations killed; every restored test passed.\n`);
} finally { await rm(scratch, { recursive: true, force: true }); }
