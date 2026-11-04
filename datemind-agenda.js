/* DateMind Agenda — monthly calendar, local date arithmetic, no external dependencies. */
(function(){
'use strict';
let month=new Date();month.setDate(1);
let active=false;
const weekdays=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const pad=n=>String(n).padStart(2,'0');
const iso=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=()=>window.DateMindAgenda;
const contacts=()=>api()?.getContacts()||[];
function upcoming(){return contacts().filter(c=>c.status==='agendado'&&/^\d{4}-\d{2}-\d{2}$/.test(c.dateAt||''));}
function render(){
 const root=document.getElementById('dmAgenda');if(!root)return;
 const y=month.getFullYear(),m=month.getMonth(),today=new Date(),todayKey=iso(today.getFullYear(),today.getMonth(),today.getDate());
 const dates=new Map();upcoming().forEach(c=>{const k=c.dateAt;if(!dates.has(k))dates.set(k,[]);dates.get(k).push(c);});
 root.querySelector('#dmAgendaMonth').textContent=new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(month);
 const grid=root.querySelector('#dmAgendaGrid');grid.replaceChildren();
 weekdays.forEach(day=>{const el=document.createElement('span');el.className='dm-agenda-weekday';el.textContent=day;grid.appendChild(el);});
 const offset=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
 for(let n=0;n<offset;n++){const el=document.createElement('div');el.className='dm-agenda-empty';grid.appendChild(el);}
 for(let d=1;d<=days;d++){
  const key=iso(y,m,d),events=dates.get(key)||[];
  const cell=document.createElement('div');cell.className='dm-agenda-day'+(key===todayKey?' today':'');
  const heading=document.createElement('span');heading.className='dm-agenda-number';heading.textContent=d;cell.appendChild(heading);
  events.sort((a,b)=>(a.dateTime||'').localeCompare(b.dateTime||'')).forEach(c=>{
   const btn=document.createElement('button');btn.type='button';btn.className='dm-agenda-event';
   btn.textContent=(c.dateTime?c.dateTime+' · ':'')+c.nome;
   btn.title='Abrir ficha de '+c.nome;btn.addEventListener('click',()=>{window.DateMindAgenda.openContact(c.id);});cell.appendChild(btn);
  });
  grid.appendChild(cell);
 }
 const total=upcoming().filter(c=>c.dateAt.startsWith(y+'-'+pad(m+1))).length;
 root.querySelector('#dmAgendaCount').textContent=total+' date'+(total===1?'':'s')+' neste mês';
}
function show(){
 active=true;
 document.getElementById('dmAgenda').hidden=false;
 document.body.classList.add('dm-agenda-open');
 document.querySelector('.app-grid').style.display='none';
 document.getElementById('kanbanView').classList.remove('active');
 document.querySelectorAll('.dm-agenda-link').forEach(b=>{b.setAttribute('aria-current','page');b.classList.add('active');});
 document.querySelectorAll('#btn-list,#btn-kanban').forEach(b=>b.classList.remove('active'));
 render();window.scrollTo({top:0,behavior:'instant'});
}
function hide(){
 if(!active)return;active=false;
 document.getElementById('dmAgenda').hidden=true;
 document.body.classList.remove('dm-agenda-open');
 document.querySelector('.app-grid').style.display='';
 document.querySelectorAll('.dm-agenda-link').forEach(b=>{b.removeAttribute('aria-current');b.classList.remove('active');});
}
function setup(){
 const grid=document.querySelector('.app-grid');if(!grid)return;
 const root=document.createElement('section');root.id='dmAgenda';root.hidden=true;
 root.innerHTML='<div class="dm-agenda-header"><div><span class="dm-agenda-kicker">SEUS ENCONTROS</span><h1>Agenda</h1><p>Dates marcados, organizados por mês.</p></div><button type="button" id="dmAgendaToday">Hoje</button></div><div class="dm-agenda-controls"><button type="button" id="dmAgendaPrev" aria-label="Mês anterior">‹</button><h2 id="dmAgendaMonth"></h2><button type="button" id="dmAgendaNext" aria-label="Próximo mês">›</button></div><p id="dmAgendaCount" aria-live="polite"></p><div class="dm-agenda-grid" id="dmAgendaGrid" role="group" aria-label="Calendário mensal"></div><p class="dm-agenda-help">Para agendar: abra uma ficha, selecione <strong>Date marcado</strong> e informe a data do encontro. Toque no nome para abrir a ficha.</p>';
 grid.insertAdjacentElement('afterend',root);
 const link=document.createElement('button');link.type='button';link.className='v-btn dm-agenda-link';link.textContent='Agenda';link.addEventListener('click',show);
 document.querySelector('.view-switcher')?.appendChild(link);
 const mobile=document.querySelector('.dm-mobile-nav');if(mobile){
  const btn=document.createElement('button');btn.type='button';btn.className='dm-agenda-link';btn.innerHTML='<span class="dm-nav-icon" aria-hidden="true">▦</span>Agenda';btn.addEventListener('click',show);mobile.appendChild(btn);
 }
 root.querySelector('#dmAgendaPrev').addEventListener('click',()=>{month.setMonth(month.getMonth()-1);render();});
 root.querySelector('#dmAgendaNext').addEventListener('click',()=>{month.setMonth(month.getMonth()+1);render();});
 root.querySelector('#dmAgendaToday').addEventListener('click',()=>{month=new Date();month.setDate(1);render();});
 document.querySelectorAll('#btn-list,#btn-kanban,.dm-mobile-nav [data-dm-view]').forEach(b=>b.addEventListener('click',hide));
 const status=document.getElementById('in-status'),dateRow=document.getElementById('dmDateFields');
 function toggleDate(){if(dateRow)dateRow.hidden=status.value!=='agendado';}
 status?.addEventListener('change',toggleDate);
 new MutationObserver(()=>{if(document.getElementById('modal').style.display==='flex')toggleDate();}).observe(document.getElementById('modal'),{attributes:true,attributeFilter:['style']});
 document.addEventListener('datemind:contacts-changed',()=>{if(active)render();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
