import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to convert simple Markdown to clean HTML
function markdownToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Horizontal Rule
    if (line === '---' || line === '***') {
      if (inList) { html += '</ul>\n'; inList = false; }
      if (inTable) { html += '</tbody></table></div>\n'; inTable = false; }
      html += '<hr />\n';
      continue;
    }

    // Tables
    if (line.startsWith('|') && line.endsWith('|')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      
      // Separator line (|:---|:---|)
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        html += '<div class="table-container"><table><thead><tr>';
        cells.forEach(cell => {
          html += `<th>${formatInline(cell)}</th>`;
        });
        html += '</tr></thead><tbody>\n';
      } else {
        html += '<tr>';
        cells.forEach(cell => {
          html += `<td>${formatInline(cell)}</td>`;
        });
        html += '</tr>\n';
      }
      continue;
    } else if (inTable) {
      html += '</tbody></table></div>\n';
      inTable = false;
    }

    // Headings
    if (line.startsWith('# ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h1>${formatInline(line.slice(2))}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h2>${formatInline(line.slice(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h3>${formatInline(line.slice(4))}</h3>\n`;
      continue;
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += `<li>${formatInline(line.slice(2))}</li>\n`;
      continue;
    } else if (inList && !line.startsWith('  ')) {
      html += '</ul>\n';
      inList = false;
    }

    // Empty line
    if (!line) {
      if (inList) { html += '</ul>\n'; inList = false; }
      continue;
    }

    // Paragraph
    html += `<p>${formatInline(line)}</p>\n`;
  }

  if (inList) html += '</ul>\n';
  if (inTable) html += '</tbody></table></div>\n';

  return html;
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

function buildDocumentHtml(title, bodyHtml, logoBase64) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 22mm 18mm 24mm 18mm;
      @top-left {
        content: "EXPOJUY 2026 — Desafío Digital";
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        font-weight: 700;
        color: #820cd0;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      @top-right {
        content: "Primera Etapa · Documento Oficial";
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        color: #555555;
      }
      @bottom-left {
        content: "Cámara de Comercio Exterior de Jujuy · Min. de Desarrollo Económico y Producción";
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 7.5pt;
        color: #777777;
      }
      @bottom-right {
        content: "Página " counter(page) " de " counter(pages);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        color: #555555;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #820cd0;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }

    .doc-header-logo img {
      height: 48px;
      width: auto;
    }

    .doc-header-org {
      text-align: right;
      font-size: 8pt;
      line-height: 1.35;
      color: #444444;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #07121e;
      margin: 0 0 6px 0;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #820cd0;
      border-bottom: 1px solid #ece3d4;
      padding-bottom: 4px;
      margin: 22px 0 10px 0;
      letter-spacing: -0.01em;
      page-break-after: avoid;
    }

    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #07121e;
      margin: 16px 0 6px 0;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 10px 0;
      text-align: justify;
      hyphens: auto;
    }

    strong {
      color: #07121e;
      font-weight: 700;
    }

    ul {
      margin: 0 0 12px 0;
      padding-left: 20px;
    }

    li {
      margin-bottom: 5px;
      line-height: 1.5;
    }

    hr {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 18px 0;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.5pt;
      background-color: #f1f5f9;
      color: #820cd0;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }

    .table-container {
      width: 100%;
      margin: 14px 0 18px 0;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      line-height: 1.45;
    }

    th {
      background-color: #07121e;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    td {
      padding: 6px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    a {
      color: #820cd0;
      text-decoration: none;
      font-weight: 600;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="doc-header-logo">
      <img src="data:image/png;base64,${logoBase64}" alt="ExpoJuy 2026 Logo" />
    </div>
    <div class="doc-header-org">
      Ministerio de Desarrollo Económico y Producción<br>
      Cámara de Comercio Exterior de Jujuy<br>
      <span style="color: #820cd0;">Desafío Digital ExpoJuy 2026</span>
    </div>
  </div>

  <div class="doc-content">
    ${bodyHtml}
  </div>
</body>
</html>`;
}

async function main() {
  console.log('🚀 Iniciando generación de PDFs oficiales de ExpoJuy 2026...');

  const logoPath = path.join(rootDir, 'src/assets/expojuy-isologotipo.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');

  const docsDir = path.join(rootDir, 'docs');
  const publicDocsDir = path.join(rootDir, 'public/docs');
  if (!fs.existsSync(publicDocsDir)) {
    fs.mkdirSync(publicDocsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const documents = [
    {
      sourceFile: path.join(docsDir, 'memoria-descriptiva.md'),
      outputName: 'Memoria-Descriptiva-ExpoJuy-2026.pdf',
      title: 'Memoria Descriptiva — ExpoJuy 2026',
    },
    {
      sourceFile: path.join(docsDir, 'declaracion-uso-ia.md'),
      outputName: 'Declaracion-Uso-IA-ExpoJuy-2026.pdf',
      title: 'Declaración de Uso de IA — ExpoJuy 2026',
    },
  ];

  for (const doc of documents) {
    console.log(`📄 Procesando ${path.basename(doc.sourceFile)}...`);
    const mdContent = fs.readFileSync(doc.sourceFile, 'utf8');
    const bodyHtml = markdownToHtml(mdContent);
    const fullHtml = buildDocumentHtml(doc.title, bodyHtml, logoBase64);

    await page.setContent(fullHtml, { waitUntil: 'networkidle' });

    const targetDocPath = path.join(docsDir, doc.outputName);
    const targetPublicPath = path.join(publicDocsDir, doc.outputName);

    await page.pdf({
      path: targetDocPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5pt; width: 100%; display: flex; justify-content: space-between; padding: 0 18mm; color: #666666;">
          <span>ExpoJuy 2026 · Desafío Digital</span>
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>
      `,
      margin: {
        top: '22mm',
        bottom: '22mm',
        left: '18mm',
        right: '18mm',
      },
    });

    // Copy to public/docs for direct link / download on site
    fs.copyFileSync(targetDocPath, targetPublicPath);

    const stats = fs.statSync(targetDocPath);
    console.log(`✅ Creado: ${doc.outputName} (${Math.round(stats.size / 1024)} KB)`);
  }

  await browser.close();
  console.log('🎉 Todos los PDFs oficiales fueron generados con éxito.');
}

main().catch(err => {
  console.error('❌ Error generando PDFs:', err);
  process.exit(1);
});
