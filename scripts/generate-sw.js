const fs = require("fs");
const path = require("path");

const templatePath = path.join(__dirname, "..", "sw-src", "sw.template.js");
const outPath = path.join(__dirname, "..", "public", "sw.js");
const version = process.env.SOURCE_COMMIT || String(Date.now());

const template = fs.readFileSync(templatePath, "utf8");
fs.writeFileSync(outPath, template.replace("__CACHE_VERSION__", version));
