/* DateMind · Dossiês e filtros avançados (sem dependências).
   Os dados são salvos como dossier dentro de cada contato e sincronizados pelo fluxo existente. */
const DateMindDossier = (() => {
  const groups = [
    { name: 'Perfil e formação', fields: [
      ['alias','Apelido'],['birthday','Aniversário','date'],['height','Altura (cm)','number'],
      ['childrenStatus','Tem filhos?','select',['','Sim','Não']],
      ['childrenCount','Quantidade de filhos','number'],
      ['city','Cidade'],['education','Formação acadêmica'],
      ['educationStatus','Situação acadêmica','select',['','Cursando','Concluída','Trancada','Não informado']],
      ['studies','Cursos / o que estuda','list']
    ]},
    { name: 'Relacionamento e expectativas', fields: [
      ['relationshipGoal','O que procura','select',['','Conhecer sem pressa','Relacionamento sério','Casual','Amizade','Não sabe','Não informado']],
      ['relationshipExpectations','Expectativas declaradas','textarea'],
      ['meetingStatus','Situação do encontro','select',['','Ainda não conversado','Em pauta','Marcado','Realizado','Cancelado']],
      ['boundaries','Limites e preferências compartilhados','list']
    ]},
    { name: 'Estilo de vida e lazer', fields: [
      ['music','Estilos musicais','list'],['lifeTags','Atividades de lazer','list'],
      ['interests','Hobbies e interesses','list'],['favoritePlaces','Lugares de que gosta','list']
    ]},
    { name: 'Gastronomia e bebidas', fields: [
      ['foods','Comidas preferidas','list'],['foodsAvoid','Comidas que evita','list'],
      ['drinks','Bebidas preferidas','list'],
      ['alcohol','Consumo de álcool','select',['','Sim','Não','Às vezes','Não informado']]
    ]},
    { name: 'Rotina e disponibilidade', fields: [
      ['workSchedule','Horários e turno de trabalho'],
      ['availability','Disponibilidade para encontros','list'],
      ['routineNotes','Observações de rotina','textarea']
    ]},
    { name: 'Comunicação e conexão', fields: [
      ['firstContact','Primeiro contato','date'],
      ['frequency','Frequência das conversas','select',['','Diária','Frequente','Ocasional','Rara','Não informado']],
      ['communicationStyle','Preferências de comunicação','textarea'],
      ['followupTopic','Assuntos para retomar','textarea'],
      ['summary','Resumo da pessoa','textarea'],
      ['personalNotes','Anotações pessoais','textarea'],
      ['evidenceNotes','Origem e confirmação das informações','textarea']
    ]}
  ];
  const schema = groups.flatMap(group => group.fields.map(f => ({key:f[0], label:f[1], kind:f[2]||'text', options:f[3]||[]})));
  const fieldByKey = Object.fromEntries(schema.map(f => [f.key,f]));
  const listFields = new Set(schema.filter(f=>f.kind==='list').map(f=>f.key));
  const STORAGE_KEY = 'datemind_dossier_filters_v1';
  let selected = {};
  let onChange = () => {};
  let getContacts = () => [];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = value => String(value ?? '').trim();
  const normalizeText = v => clean(v).toLocaleLowerCase('pt-BR');
  const makeList = value => Array.isArray(value) ? value.map(clean).filter(Boolean) : clean(value).split(/[,;\n|]+/).map(clean).filter(Boolean);
  const known = value => value !== undefined && value !== null && clean(value) !== '' && clean(value) !== 'Não informado';
  const parseInteger = v => /^-?\d+$/.test(clean(v)) ? Number(v) : '';
  const validDate = v => /^\d{4}-\d{2}-\d{2}$/.test(clean(v)) ? clean(v) : '';
  function normalize(input) {
    const source = input && typeof input === 'object' ? input : {};
    const result = {};
    schema.forEach(f => {
      const raw = source[f.key];
      result[f.key] = f.kind === 'list' ? makeList(raw) :
        f.kind === 'number' ? parseInteger(raw) :
        f.kind === 'date' ? validDate(raw) : clean(raw);
    });
    return result;
  }
  function fromRemote(contact) {
    const raw = contact || {};
    const base = raw.dossier && typeof raw.dossier === 'object' ? raw.dossier : {};
    const older = raw.legacyFields && typeof raw.legacyFields === 'object' ? raw.legacyFields : raw;
    const data = {...base};
    if (!known(data.education) && known(older.formacao)) data.education = older.formacao;
    if (!known(data.city) && known(older.cidade)) data.city = older.cidade;
    if (!known(data.childrenCount) && known(older.qtde_filhos)) data.childrenCount = older.qtde_filhos;
    if (!known(data.childrenStatus) && known(older.qtde_filhos)) {
      const qty = parseInteger(older.qtde_filhos);
      if (qty !== '') data.childrenStatus = qty > 0 ? 'Sim' : 'Não';
    }
    if (!known(data.alcohol) && ['sim','não','nao'].includes(normalizeText(older.bebe))) {
      data.alcohol = normalizeText(older.bebe)==='sim' ? 'Sim' : 'Não';
    }
    return normalize(data);
  }
  function fieldHTML(f) {
    const id = 'dm-d-' + f.key;
    let ctrl;
    if (f.kind === 'textarea') ctrl = '<textarea id="'+id+'" rows="2" placeholder="Não informado"></textarea>';
    else if (f.kind === 'select') ctrl = '<select id="'+id+'">'+f.options.map(v=>'<option value="'+esc(v)+'">'+esc(v||'Não informado')+'</option>').join('')+'</select>';
    else ctrl = '<input id="'+id+'" type="'+(f.kind==='date'?'date':f.kind==='number'?'number':'text')+'" '+(f.kind==='number'?'min="0" max="130" ':'')+'placeholder="'+(f.kind==='list'?'Separe por vírgula':f.kind==='text'?'Não informado':'')+'">';
    return '<label class="dm-dossier-field" for="'+id+'"><span>'+esc(f.label)+'</span>'+ctrl+'</label>';
  }
  function mount({contacts, changed}) {
    getContacts = contacts; onChange = changed;
    try { selected = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { selected = {}; }
    const form = document.getElementById('dossierFormFields');
    if (form) form.innerHTML = '<div class="dm-dossier-heading"><strong>Dossiê detalhado</strong><small>Registre apenas informações compartilhadas; deixe vazios os dados não confirmados.</small></div>' +
      groups.map((g,i) => '<details class="dm-dossier-section" '+(i===0?'open':'')+'><summary>'+esc(g.name)+'</summary><div class="dm-dossier-grid">'+g.fields.map(f => fieldHTML(fieldByKey[f[0]])).join('')+'</div></details>').join('');
    ['dossierFiltersList','dossierFiltersKanban'].forEach(id => {
      const box = document.getElementById(id);
      if (!box) return;
      box.addEventListener('change', filterEvent);
      box.addEventListener('input', filterEvent);
      box.addEventListener('click', e => {
        if (e.target.closest('[data-dm-clear]')) clearFilters();
      });
    });
    refreshOptions(getContacts());
  }
  function fillForm(raw) {
    const d = normalize(raw);
    schema.forEach(f => { const el=document.getElementById('dm-d-'+f.key);
      if (el) el.value = f.kind==='list'?d[f.key].join(', '):d[f.key];
    });
  }
  function clearForm() { fillForm({}); }
  function readForm(original) {
    const d = {...normalize(original)};
    schema.forEach(f => {const el=document.getElementById('dm-d-'+f.key);
      if (el) d[f.key]= f.kind==='list' ? makeList(el.value) :
        f.kind==='number' ? parseInteger(el.value) : clean(el.value);
    });
    return normalize(d);
  }
  function formIds() { return schema.map(f=>'dm-d-'+f.key); }
  const filterFields = [
    {key:'ageMin',label:'Idade mínima',kind:'number'},
    {key:'ageMax',label:'Idade máxima',kind:'number'},
    {key:'childrenStatus',label:'Filhos'},
    {key:'childrenCount',label:'Quantidade de filhos'},
    {key:'city',label:'Cidade'}, {key:'bairro',label:'Bairro'},
    {key:'profissao',label:'Profissão'}, {key:'education',label:'Formação'},
    {key:'educationStatus',label:'Situação acadêmica'}, {key:'studies',label:'Cursos'},
    {key:'music',label:'Estilo musical'}, {key:'relationshipGoal',label:'Objetivo de relacionamento'},
    {key:'meetingStatus',label:'Situação do encontro'}, {key:'lifeTags',label:'Lazer'},
    {key:'interests',label:'Interesses'}, {key:'favoritePlaces',label:'Lugares'},
    {key:'foods',label:'Comidas'}, {key:'drinks',label:'Bebidas'},
    {key:'alcohol',label:'Álcool'}, {key:'workSchedule',label:'Rotina de trabalho'},
    {key:'availability',label:'Disponibilidade'}, {key:'frequency',label:'Frequência de conversa'},
    {key:'origin',label:'Origem do match'}, {key:'lastContactAfter',label:'Último contato desde',kind:'date'}
  ];
  function valueOf(c,k) {
    if (['bairro','profissao','origin','idade','lastContactAt'].includes(k)) return c[k];
    return (c.dossier||{})[k];
  }
  function filterHTML(f,contacts) {
    const current=clean(selected[f.key]);
    let control;
    if (f.kind==='number' || f.kind==='date') {
      control='<input class="dm-filter-control" data-dm-key="'+esc(f.key)+'" type="'+f.kind+'" '+(f.kind==='number'?'min="0" max="130" ':'')+'value="'+esc(current)+'">';
    } else {
      const values=new Set();
      contacts.forEach(c => {
        const raw=valueOf(c,f.key);
        const parts=Array.isArray(raw)?raw:[raw];
        parts.forEach(v=>{if(known(v)) values.add(clean(v));});
      });
      const field=fieldByKey[f.key];
      if (field) field.options.forEach(v=>{if (known(v)) values.add(v);});
      const ordered=[...values].sort((a,b)=>a.localeCompare(b,'pt-BR',{sensitivity:'base'}));
      if (current && current!=='__empty__' && !ordered.includes(current)) ordered.unshift(current);
      control='<select class="dm-filter-control" data-dm-key="'+esc(f.key)+'"><option value="">Todos</option><option value="__empty__">Não informado</option>'+ordered.map(v=>'<option value="'+esc(v)+'" '+(current===v?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select>';
      if (current==='__empty__') control=control.replace('value="__empty__"','value="__empty__" selected');
    }
    return '<label class="dm-filter-field"><span>'+esc(f.label)+'</span>'+control+'</label>';
  }
  function refreshOptions(contacts) {
    ['dossierFiltersList','dossierFiltersKanban'].forEach(id=>{
      const el=document.getElementById(id); if(!el) return;
      el.innerHTML='<div class="dm-filter-grid">'+filterFields.map(f=>filterHTML(f,contacts)).join('')+'</div><div class="dm-filter-bottom"><span>Os filtros são combinados (E). Campos vazios não são presumidos.</span><button type="button" data-dm-clear>Limpar filtros avançados</button></div>';
    });
  }
  function filterEvent(e) {
    const el=e.target.closest('[data-dm-key]');if(!el)return;
    if(el.type==='number' && el.value && Number(el.value)<0) return;
    const key=el.dataset.dmKey;
    if(!el.value) delete selected[key]; else selected[key]=el.value;
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(selected)); } catch(_){}
    // Mantém os controles das duas vistas em sincronia.
    document.querySelectorAll('[data-dm-key="'+key+'"]').forEach(other=>{if(other!==el)other.value=el.value;});
    onChange();
  }
  function clearFilters() {
    selected={}; try {localStorage.removeItem(STORAGE_KEY);}catch(_){}
    refreshOptions(getContacts());onChange();
  }
  function match(c) {
    return Object.entries(selected).every(([key,criterion])=>{
      if (!criterion) return true;
      if (key==='ageMin' || key==='ageMax') {
        const age=Number(c.idade);
        return clean(c.idade)!=='' && Number.isFinite(age) && (key==='ageMin'?age>=Number(criterion):age<=Number(criterion));
      }
      if(key==='lastContactAfter') return !!c.lastContactAt && c.lastContactAt.slice(0,10)>=criterion;
      const value=valueOf(c,key);
      if(criterion==='__empty__') return Array.isArray(value)?value.length===0:!known(value);
      return Array.isArray(value) ? value.some(v=>normalizeText(v)===normalizeText(criterion)) : normalizeText(value)===normalizeText(criterion);
    });
  }
  function searchText(c) {
    const d=normalize(c.dossier);
    return schema.map(f=>Array.isArray(d[f.key])?d[f.key].join(' '):d[f.key]).join(' ');
  }
  function cardTags(c) {
    const d=normalize(c.dossier);
    const tags=[];
    if(d.childrenStatus==='Não') tags.push('Sem filhos');
    if(d.childrenStatus==='Sim') tags.push(d.childrenCount!==''?d.childrenCount+' filho(s)':'Tem filhos');
    if(d.city) tags.push(d.city);
    if(d.music.length) tags.push('♫ '+d.music[0]);
    return tags.length?'<div class="dm-card-tags">'+tags.slice(0,3).map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>':'';
  }
  function exportHeaders() { return schema.map(f=>'dossier_'+f.key); }
  function csvValue(c,key) {
    const v=normalize(c.dossier)[key.slice(8)];
    return Array.isArray(v)?v.join(' | '):v;
  }
  function importRow(row,previous) {
    const d={...normalize(previous)};
    schema.forEach(f=>{
      const col='dossier_'+f.key;
      if(Object.prototype.hasOwnProperty.call(row,col)) d[f.key]=row[col];
    });
    return normalize(d);
  }
  return {normalize,fromRemote,mount,fillForm,clearForm,readForm,formIds,refreshOptions,match,clearFilters,cardTags,searchText,exportHeaders,csvValue,importRow};
})();
