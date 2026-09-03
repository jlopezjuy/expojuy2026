import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetDir = path.join(rootDir, 'public/images/photos');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 17 unique photos from src/data/photos.ts
const photoIds = [
  '1765042764074-2dd6bd291899', // heroBackdrop
  '1749835521236-d29d0004162d', // collageArtisan
  '1709207517323-a8fd737c5498', // collageField & prodHierbas
  '1763110804142-7e8e14d16e92', // collageSalt
  '1774082313811-f9852bd53d00', // expoGate
  '1650970327761-4ebbd90b88bd', // regionPuna
  '1765567972885-9b63d0f6c7db', // regionQuebrada
  '1666967931985-2a75defef638', // regionValles
  '1662810902727-14106382a202', // regionYungas
  '1587049352851-8d4e89133924', // prodMiel
  '1562869929-bda0650edb1f', // prodTextil
  '1751210769268-85d43ecfcdd8', // prodHuerta
  '1422246358533-95dcd3d48961', // prodCeramica
  '1595351298020-038700609878', // prodDiseno
  '1772722185174-4f1b62c9c4a7', // prodTurismo
  '1749584550329-12f3252202f1', // prodTelar
  '1762631383815-784c04533802', // sabores
  '1773613927259-a1f954d1671e', // personas
  '1536257104079-aa99c6460a5a', // agenda
  '1510218129079-74e00c5a90ea', // ctaSunset
];

const uniqueIds = Array.from(new Set(photoIds));

async function downloadPhoto(id) {
  const filePath = path.join(targetDir, `${id}.jpg`);
  if (fs.existsSync(filePath)) {
    console.log(`⏩ Ya existe: ${id}.jpg`);
    return;
  }

  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1280`;
  console.log(`⬇️ Descargando ${id}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Guardado: ${id}.jpg (${Math.round(buffer.length / 1024)} KB)`);
  } catch (err) {
    console.error(`⚠️ Error al descargar ${id}:`, err.message);
  }
}

async function main() {
  console.log(`📸 Descargando ${uniqueIds.length} assets fotográficos a public/images/photos/...`);
  for (const id of uniqueIds) {
    await downloadPhoto(id);
  }
  console.log('🎉 Finalizada la localización de assets.');
}

main();
