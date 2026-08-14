const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('Bloco script não encontrado');
const script = match[1];
new vm.Script(script, { filename: 'index.html:inline-script' });
for (const forbidden of ['CryptoJS', 'SECRET_KEY', 'API_URL', 'enc(', 'dec(', 'split(\'\\n\')']) {
  if (script.includes(forbidden)) throw new Error(`Referência antiga encontrada: ${forbidden}`);
}
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];
    if (char === '"') {
      if (quoted && next === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i++;
      row.push(field); field = '';
      if (row.some(value => value.trim() !== '')) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) row.push(field);
  if (row.length && row.some(value => value.trim() !== '')) rows.push(row);
  return rows;
}
const rows = parseCSV('nome,notes\r\nAna,"gosta de café,\ne de jazz"\r\n');
if (rows.length !== 2 || rows[1][1] !== 'gosta de café,\ne de jazz') throw new Error('Parser CSV não preservou campo quoted');
console.log(JSON.stringify({ syntax: 'ok', csv: 'ok', bytes: html.length }));
