#!/usr/bin/env node
/**
 * Temporarily renames the package to @coldbydefaultt/next-seo-lite for npm,
 * publishes, then restores the original name (@coldbydefault/next-seo-lite).
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const pkgPath = path.join(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const originalName = pkg.name;
const npmName = "@coldbydefaultt/next-seo-lite";

const write = (name) => {
  pkg.name = name;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
};

try {
  console.log(`\nSetting name → ${npmName}`);
  write(npmName);
  execSync(
    "npm publish --access public --registry https://registry.npmjs.org",
    {
      stdio: "inherit",
    },
  );
} finally {
  console.log(`\nRestoring name → ${originalName}`);
  write(originalName);
}
