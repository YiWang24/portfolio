const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("terminal panel component file exists", () => {
  const componentPath = path.join(
    __dirname,
    "../src/components/TerminalPanel.tsx"
  );
  assert.ok(fs.existsSync(componentPath));
});
