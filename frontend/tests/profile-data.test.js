const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const profilePath = path.join(__dirname, "../src/data/profile.json");

test("profile.json exists and matches required shape", () => {
  const raw = fs.readFileSync(profilePath, "utf8");
  const data = JSON.parse(raw);

  assert.ok(data.hero);
  assert.equal(typeof data.hero.name, "string");
  assert.equal(typeof data.hero.role, "string");
  assert.equal(typeof data.hero.intro, "string");
  assert.equal(typeof data.hero.status, "string");

  assert.ok(Array.isArray(data.education));
  assert.ok(Array.isArray(data.experience));
  assert.ok(Array.isArray(data.projects));
  assert.ok(Array.isArray(data.techStack));
});
