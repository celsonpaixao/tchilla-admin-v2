// Gera os ícones da PWA a partir do favicon (512×512, fundo navy).
// Rodar de novo sempre que o logo mudar:
//   node scripts/generate-pwa-icons.mjs
//
// Usa o `sharp`, que já vem instalado como dependência do Next.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SOURCE = "public/admin_favicon.png";
const OUT = "public/icons";
const NAVY = "#0E2A42"; // var(--navy)

await mkdir(OUT, { recursive: true });

// Ícones normais ("any"): o favicon já é full-bleed, basta redimensionar.
for (const size of [192, 512]) {
  await sharp(SOURCE).resize(size, size).png().toFile(`${OUT}/icon-${size}.png`);
}

// Apple touch icon (iOS aplica os cantos arredondados sozinho).
await sharp(SOURCE).resize(180, 180).png().toFile(`${OUT}/apple-touch-icon.png`);

// Maskable: o Android recorta o ícone (círculo, squircle…). A zona segura é um
// círculo com 80% do tamanho, por isso o símbolo é reduzido e centrado em navy.
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.78);
  const symbol = await sharp(SOURCE).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: NAVY },
  })
    .composite([{ input: symbol, gravity: "center" }])
    .png()
    .toFile(`${OUT}/icon-maskable-${size}.png`);
}

console.log(`✓ Ícones gerados em ${OUT}/`);
