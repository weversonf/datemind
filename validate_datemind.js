const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const html = fs.readFileSync('index.html', 'utf8');
const dossierJS = fs.readFileSync('datemind-dossier.js', 'utf8');
const dossierCSS = fs.readFileSync('datemind-dossier.css', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('Bloco principal script não encontrado');
new vm.Script(match[1], {filename:'index.html:inline-script'});
new vm.Script(dossierJS, {filename:'datemind-dossier.js'});
for (const old of ['CryptoJS', 'SECRET_KEY', 'API_URL', 'enc(', 'dec(', 'split(\'\\n\')']) {
  if (match[1].includes(old)) throw new Error('Referência legada: '+old);
}
assert(html.includes('src="datemind-dossier.js"'), 'Dossiê não carregado');
assert(html.includes('class="kanban-filter-bar glass-box dm-compact-toolbar"'), 'Barra compacta ausente');
assert(html.includes('href="datemind-toolbar.css"'), 'Estilos da barra compacta ausentes');
assert(html.includes('function setCompactFilter(kind,value)'), 'Selects compactos sem lógica');
assert(html.includes('function refreshCompactToolbar()'), 'Contagem e estado da barra não atualizados');
assert(dossierJS.includes('function activeCount()'), 'Indicador de filtros avançados ausente');

assert(html.includes('href="datemind-dossier.css"'), 'Estilos do dossiê não carregados');
assert(dossierCSS.includes('.dm-dossier-section'), 'Layout do dossiê ausente');
assert(html.includes('dossier: DateMindDossier.fromRemote(source)'), 'Falta leitura do Firestore');
assert(html.includes('dossier: DateMindDossier.normalize(c.dossier)'), 'Falta sync do Firestore');
assert(html.includes('DateMindDossier.readForm(existing?.dossier)'), 'Falta escrita dos campos');
assert(html.includes('...(existing || {}), // Preserve legacy fields'), 'Metadados antigos não preservados');
assert(html.includes('DateMindDossier.importRow(row, old?.dossier)'), 'Falta importação dos campos');
assert(html.includes('DateMindDossier.match(c)'), 'Filtros não conectados');
const columns = [...html.matchAll(/class="kanban-col" data-status="([^"]+)"/g)].map(m=>m[1]);
assert.deepStrictEqual(columns,['conheci','conversando','quase','agendado','fiquei','intimidade','recorrente']);
const fakeStorage = { getItem(k) { return k==='datemind_dossier_filters_v1' ? JSON.stringify({childrenStatus:'Não',music:'Rock',ageMin:'25',ageMax:'40'}) : null; },setItem(){},removeItem(){} };
const context = vm.createContext({document:{getElementById:()=>null},localStorage:fakeStorage});
vm.runInContext(dossierJS+';this.DossierUnderTest=DateMindDossier;', context);
const D = context.DossierUnderTest;
const p = D.normalize({ageNumber:27,childrenStatus:'Não',music:'Rock, MPB',education:'Marketing'});
assert.strictEqual(p.childrenStatus,'Não');
assert.strictEqual(p.music.length,2);
assert.strictEqual(p.education,'Marketing');
assert.strictEqual(D.exportHeaders().length,31);
const legacy = D.fromRemote({formacao:'História',cidade:'Fortaleza',qtde_filhos:0,bebe:'sim'});
assert.strictEqual(legacy.childrenStatus,'Não');
assert.strictEqual(legacy.childrenCount,0);
assert.strictEqual(legacy.education,'História');
assert.strictEqual(legacy.city,'Fortaleza');
assert.strictEqual(legacy.alcohol,'Sim');
const merged = D.importRow({dossier_music:'Rock | MPB',dossier_childrenStatus:'Sim'}, {education:'Enfermagem'});
assert.strictEqual(merged.education,'Enfermagem');
assert.strictEqual(merged.music.length,2);
assert.strictEqual(merged.childrenStatus,'Sim');
D.mount({contacts:()=>[],changed:()=>{}});
const base = {idade:'30',bairro:'Centro',profissao:'Designer',dossier:D.normalize({childrenStatus:'Não',music:['Rock','Jazz']})};
assert.strictEqual(D.match(base),true);
assert.strictEqual(D.match({...base,idade:'20'}),false);
assert.strictEqual(D.match({...base,dossier:D.normalize({childrenStatus:'Sim',music:['Rock']})}),false);
function parseCSV(text) {
  const rows=[]; let row=[],field='',quoted=false;
  const source=text.replace(/^\uFEFF/,'');
  for(let i=0;i<source.length;i++){
    const char=source[i],next=source[i+1];
    if(char==='"') { if(quoted && next==='"'){field+='"';i++;} else quoted=!quoted; }
    else if(char===',' && !quoted){row.push(field);field='';}
    else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&next==='\n')i++;row.push(field);field='';if(row.some(s=>s.trim()))rows.push(row);row=[];}
    else field+=char;
  }
  if(field||row.length)row.push(field);
  if(row.some(s=>s.trim()))rows.push(row);
  return rows;
}
const csv=parseCSV('nome,notes\r\nAna,"gosta de café,\ne de jazz"\r\n');
assert.strictEqual(csv[1][1],'gosta de café,\ne de jazz');
console.log(JSON.stringify({syntax:'ok',schemaFields:D.exportHeaders().length,advancedFilters:'ok',columns:columns.length,legacyMap:'ok',csv:'ok',bytes:html.length}));
