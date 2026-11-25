// Entry for make.fun "Your Week in One Line" (u-boge-your-week-in-one-line-d1c14ced).
// Deterministic, stdlib-only, Node 22. Writes one line to /output/entry.txt
// (or $OUTPUT_DIR/entry.txt for local runs). No randomness, no wall-clock,
// no network, no file reads outside this program.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line: 80 characters, one line, no trailing newline.
// A week of 122 make.fun entries, zero wins so far, and the punchline is
// the constraint itself — the whole week squeezed into the 100-char limit.
export const ENTRY =
  "122 entries, zero wins, one line left \u2014 at least the week fit in 100 characters.";

// Gate mirror: the sealed scorer requires UTF-8 text of 1-100 characters,
// a single line, and not whitespace-only. Returns an error string, or null.
export function validateEntry(text: string): string | null {
  if (text.length === 0) return "entry is empty";
  if (text.length > 100) return `entry is ${text.length} characters, over the 100 limit`;
  if (text.trim().length === 0) return "entry is whitespace-only";
  if (/[\r\n]/.test(text)) return "entry must be a single line";
  return null;
}

// --self-test: the shipped ENTRY must pass, and each invalid variant
// the gate would refuse must fail validation. Exits 1 on any surprise.
function runSelfTest(): void {
  const failures: string[] = [];

  if (validateEntry(ENTRY) !== null) {
    failures.push(`shipped ENTRY rejected: ${validateEntry(ENTRY)}`);
  }

  const invalid: Array<[string, string]> = [
    ["101 characters", "x".repeat(101)],
    ["multi-line", "first line\nsecond line"],
    ["carriage return", "first line\rsecond line"],
    ["whitespace-only", "   \t  "],
    ["empty", ""],
  ];
  for (const [label, text] of invalid) {
    if (validateEntry(text) === null) {
      failures.push(`invalid variant accepted: ${label}`);
    }
  }

  if (failures.length > 0) {
    for (const f of failures) console.error(`self-test FAIL: ${f}`);
    process.exit(1);
  }
  console.log(
    `self-test OK: shipped entry valid (${ENTRY.length} chars), ${invalid.length} invalid variants rejected`,
  );
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) {
    runSelfTest();
    return;
  }

  const error = validateEntry(ENTRY);
  if (error !== null) {
    console.error(`invalid entry: ${error}`);
    process.exit(1);
  }

  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
  console.log(`wrote ${ENTRY.length}-character entry to ${join(outDir, "entry.txt")}`);
}

main();
