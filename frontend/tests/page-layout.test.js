const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const requiredFiles = [
  "../src/app/page.tsx",
  "../src/components/CommandBar.tsx",
  "../src/components/ProfilePanel.tsx",
  "../src/components/SectionModule.tsx",
  "../src/components/TimelineList.tsx",
  "../src/components/ProjectGrid.tsx",
  "../src/components/TechStack.tsx",
];

test("command center layout component files exist", () => {
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    assert.ok(fs.existsSync(filePath), `${file} should exist`);
  }
});
