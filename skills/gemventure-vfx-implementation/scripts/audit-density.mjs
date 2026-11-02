import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

// Read-only accounting of the current generic atlas pipeline. No browser claims.
const help = 'node audit-density.mjs --game-root PATH --css-scale NUMBER --render-dpr NUMBER [--sheet ID] [--logical-size NUMBER]';
const allowed = new Set(['--game-root', '--css-scale', '--render-dpr', '--sheet', '--logical-size']);
try {
  const args = new Map();
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i], value = process.argv[i + 1];
    if (!allowed.has(key) || !value || value.startsWith('--') || args.has(key)) throw new Error(help);
    args.set(key, value);
  }
  const positive = key => {
    const n = Number(args.get(key));
    if (!Number.isFinite(n) || n <= 0) throw new Error(`${key} deve ser um número positivo. ${help}`);
    return n;
  };
  if (!args.get('--game-root')) throw new Error(help);
  const cssScale = positive('--css-scale'), renderDpr = positive('--render-dpr');
  const logicalOverride = args.has('--logical-size') ? positive('--logical-size') : null;
  const manifest = path.resolve(args.get('--game-root'), 'dist', 'vfx-manifest.js');
  const raw = await readFile(manifest);
  const {VFX_SHEETS, VFX_LIMITS} = await import(pathToFileURL(manifest).href);
  const variantsPerSheet = VFX_LIMITS.variants / Object.keys(VFX_SHEETS).length;
  if (!Number.isInteger(variantsPerSheet) || !Number.isFinite(VFX_LIMITS.frame) || VFX_LIMITS.frame <= 0) {
    throw new Error('Manifesto incompatível com a conta do loader genérico; inspecione o loader atual.');
  }
  const sheetId = args.get('--sheet');
  if (sheetId && !Object.hasOwn(VFX_SHEETS, sheetId)) throw new Error(`Folha desconhecida: ${sheetId}`);
  const selected = Object.entries(VFX_SHEETS).filter(([id]) => !sheetId || id === sheetId);
  const sheets = selected.map(([id, spec]) => {
    const logicalSize = logicalOverride ?? spec.size;
    const cssPixels = logicalSize * cssScale, renderPixels = cssPixels * renderDpr;
    const cacheWidth = VFX_LIMITS.frame * spec.columns;
    const cacheHeight = VFX_LIMITS.frame * Math.ceil(spec.frames / spec.columns);
    return {
      id, sourceFrame: [spec.width, spec.height], cachedFrame: VFX_LIMITS.frame,
      logicalSize, cssPixels, renderPixels,
      rasterUpscale: renderPixels / VFX_LIMITS.frame,
      oneTexelPerRenderPixelSide: Math.ceil(renderPixels),
      cacheRgbaBytes: cacheWidth * cacheHeight * 4 * variantsPerSheet,
      note: id === 'explosion'
        ? 'Explosão laranja/vermelha desvia para geometria na baseline auditada; conferir consumidor atual.'
        : 'Conta do caminho genérico; overrides de evento/tamanho/flatten e margens não são amostrados.'
    };
  });
  const output = {
    kind: 'analytical-atlas-density-not-visual-qa',
    manifest, sha256: createHash('sha256').update(raw).digest('hex'),
    assumptions: {cssScale, renderDpr, variantsPerSheet, logicalOverride},
    sheets,
    selectedResidentRgbaBytes: sheets.reduce((n, s) => n + s.cacheRgbaBytes, 0),
    limitations: [
      'Escala/DPR são entradas fornecidas, sem leitura de viewport ou monitor.',
      'O cálculo de cache assume o loader genérico auditado: célula fixa e seis tons; revalidar se o loader mudar.',
      'Não mede blur, pixels úteis, GPU, temporários de decode, frame time, CRT ou satisfação.',
      'A dimensão calculada por texel é diagnóstico, não prescrição de export ou autorização de elevar o cache.'
    ]
  };
  console.log(JSON.stringify(output, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
