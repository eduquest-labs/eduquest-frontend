import { copyFile, cp, mkdir, readFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const metadata = JSON.parse(await readFile(new URL("node_modules/pdfjs-dist/package.json", root), "utf8"));
await mkdir(new URL("public/document-import/", root), { recursive: true });
await copyFile(new URL("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", root), new URL(`public/document-import/pdf.worker-${metadata.version}.min.mjs`, root));
for (const directory of ["cmaps", "standard_fonts"]) {
  await cp(new URL(`node_modules/pdfjs-dist/${directory}/`, root), new URL(`public/document-import/${metadata.version}/${directory}/`, root), { recursive: true });
}
await import("./generate-sw.js");
