/**
 * Regenerates the platform icons from the wordmark: "f." in
 * Instrument Serif, ink on paper with a vermilion full stop. The glyphs are
 * baked in as outlines, so the SVG doesn't depend on a web font.
 *
 *   npm i --no-save opentype.js@1.3.4 sharp@0.33.5 png-to-ico@2.1.8
 *   node scripts/generate-icons.mjs
 *
 * Writes src/app/icon.svg (tabs), src/app/apple-icon.png (180, full-bleed:
 * iOS rounds the corners itself) and public/favicon.ico (16/32/48, for
 * clients that only ask for /favicon.ico).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const OUT = "src/app";
const PAPER = "#F3F0E8", INK = "#16150F", VERMILION = "#C63D1B";
const BOX = 64, SIZE = 66;

const font = opentype.loadSync("src/assets/fonts/InstrumentSerif-Regular.ttf");
const f = font.charToGlyph("f"), dot = font.charToGlyph(".");

// "f." on the font's own advance, pulled in slightly, centred in the box
const dotX = (f.advanceWidth * SIZE) / font.unitsPerEm - 1.5;
const fbb = f.getPath(0, 0, SIZE).getBoundingBox();
const dbb = dot.getPath(dotX, 0, SIZE).getBoundingBox();
const tx = (BOX - (dbb.x2 - fbb.x1)) / 2 - fbb.x1;
const ty = (BOX - (fbb.y2 - fbb.y1)) / 2 - fbb.y1;
const fD = f.getPath(tx, ty, SIZE).toPathData(2);
const dD = dot.getPath(dotX + tx, ty, SIZE).toPathData(2);

/** `weight` thickens the hairlines so the serif survives at 16px. */
function svg({ radius, weight = 0 }) {
  const stroke = (color) => (weight ? ` stroke="${color}" stroke-width="${weight}" stroke-linejoin="round"` : "");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">` +
    `<rect width="${BOX}" height="${BOX}"${radius ? ` rx="${radius}"` : ""} fill="${PAPER}"/>` +
    `<path fill="${INK}"${stroke(INK)} d="${fD}"/>` +
    `<path fill="${VERMILION}"${stroke(VERMILION)} d="${dD}"/>` +
    `</svg>\n`
  );
}

const small = svg({ radius: 14, weight: 2.2 });
fs.writeFileSync(path.join(OUT, "icon.svg"), small);

const render = (source, px) =>
  sharp(Buffer.from(source), { density: ((72 * px) / BOX) * 4 }).resize(px, px).png();

await render(svg({ radius: 0 }), 180).toFile(path.join(OUT, "apple-icon.png"));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "folio-icons-"));
const pngs = [];
for (const px of [16, 32, 48]) {
  const file = path.join(tmp, `${px}.png`);
  await render(small, px).toFile(file);
  pngs.push(file);
}
// In public/, not app/: an app/favicon.ico is linked from every page, tenant portfolios included
fs.writeFileSync(path.join("public", "favicon.ico"), await pngToIco(pngs));
fs.rmSync(tmp, { recursive: true });
