import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PROTOCOL_HEADER, PROTOCOL_VERSION } from "../src/protocol/types.js";
import { parseSyncBatchRequest } from "../src/protocol/schemas.js";
import { stableHash } from "../src/proposals/contentHash.js";
import { CLAIM_LEASE_MS, validProposalDetail, validProposalPath } from "../src/proposals/types.js";
import type { ProposalDetail } from "../src/proposals/types.js";

interface Contract {
  protocolVersion: number; header: string; batch: unknown; proposal: ProposalDetail;
  hashes: { text: string; hash: string }[]; allowedPaths: string[]; deniedPaths: string[]; claimLeaseMs: number;
}
const fixture = JSON.parse(readFileSync(new URL("./fixtures/companion-protocol-v1.json", import.meta.url), "utf8")) as Contract;
describe("frozen plugin protocol v1", () => {
  it("accepts the independently frozen plugin wire batch", () => {
    expect(PROTOCOL_VERSION).toBe(fixture.protocolVersion);
    expect(PROTOCOL_HEADER).toBe(fixture.header);
    expect(parseSyncBatchRequest(fixture.batch)).toEqual(fixture.batch);
  });
  it("preserves proposal hashes, immutable content and path denylist", () => {
    expect(CLAIM_LEASE_MS).toBe(fixture.claimLeaseMs);
    for (const { text, hash } of fixture.hashes) expect(stableHash(text)).toBe(hash);
    for (const path of fixture.allowedPaths) expect(validProposalPath(path)).toBe(true);
    for (const path of fixture.deniedPaths) expect(validProposalPath(path)).toBe(false);
    expect(validProposalDetail(fixture.proposal)).toBe(true);
    expect(validProposalDetail({ ...fixture.proposal, proposedContent: "tampered" })).toBe(false);
  });
});
