/* DateMind — playful, privacy-conscious UX layer. No contact writes. */
(function(){
'use strict';
const stages=[{key:'conheci',label:'Primeiro contato',icon:'✦'},{key:'conversando',label:'Conversando',icon:'💬'},{key:'quase',label:'Planejando',icon:'✨'},{key:'agendado',label:'Date marcado',icon:'📅'},{key:'fiquei',label:'Conexão',icon:'♡'},{key:'intimidade',label:'Intimidade',icon:'◈'},{key:'recorrente',label:'Recorrente',icon:'∞'}];
const escapeHtml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setup(){
 const header=document.querySelector('.app-grid');if(!header)return;
 const strip=document.createElement('section');strip.className='dm-quest-strip';strip.setAttribute('aria-label','Resumo da jornada');
 strip.innerHTML='<div class="dm-quest-top"><div><span class="dm-quest-eyebrow">SEU PAINEL</span><h2>Visão da jornada <span aria-hidden="true">✦</span></h2><p>Organize suas conexões, sem pressa e sem rankings de pessoas.</p></div><button type="button" class="dm-quest-toggle" aria-expanded="true" aria-controls="dmQuestContent">Recolher</button></div><div id="dmQuestContent"><div class="dm-quest-metrics" aria-live="polite"></div><div class="dm-quest-track" aria-label="Distribuição de contatos por etapa"></div><p class="dm-quest-foot">Cada etapa é uma organização pessoal, não uma avaliação de ninguém.</p></div>';
 header.parentElement.insertBefore(strip,header);
 const content=strip.querySelector('#dmQuestContent'),toggle=strip.querySelector('.dm-quest-toggle');
 toggle.addEventListener('click',()=>{content.hidden=!content.hidden;toggle.setAttribute('aria-expanded',String(!content.hidden));toggle.textContent=content.hidden?'Expandir':'Recolher';});
 const count=()=>{const raw=document.getElementById('contactTotal')?.textContent||'';const n=parseInt(raw,10);return Number.isFinite(n)?n:0;};
 function render(){
  const total=count(),counts={};
  stages.forEach(s=>{const el=document.getElementById('list-'+s.key);counts[s.key]=el?.querySelectorAll('.list-item,.contact-card,.card').length||0;});
  // Existing app DOM may use other card selectors; read summary values when available.
  const stats=document.querySelectorAll('#statusStats .status-row');
  if(stats.length===stages.length)stats.forEach((el,i)=>{const n=parseInt(el.querySelector('strong')?.textContent||'',10);if(Number.isFinite(n))counts[stages[i].key]=n;});
  const marked=counts.agendado||0,active=(counts.conversando||0)+(counts.quase||0);
  strip.querySelector('.dm-quest-metrics').innerHTML='<div class="dm-quest-metric"><span aria-hidden="true">◉</span><strong>'+total+'</strong><small>Contatos registrados</small></div><div class="dm-quest-metric"><span aria-hidden="true">💬</span><strong>'+active+'</strong><small>Em conversa / planejamento</small></div><div class="dm-quest-metric"><span aria-hidden="true">📅</span><strong>'+marked+'</strong><small>Dates marcados</small></div>';
  strip.querySelector('.dm-quest-track').innerHTML=stages.map(s=>'<div class="dm-quest-stage" title="'+escapeHtml(s.label)+': '+counts[s.key]+'"><span class="dm-quest-stage-icon" aria-hidden="true">'+s.icon+'</span><span class="dm-quest-stage-label">'+escapeHtml(s.label)+'</span><strong>'+counts[s.key]+'</strong><span class="dm-quest-stage-bar"><span style="width:'+(total?Math.min(100,counts[s.key]/total*100):0)+'%"></span></span></div>').join('');
 }
 let pending=false;
 function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;render();});}
 const stats=document.getElementById('statusStats'),total=document.getElementById('contactTotal');
 if(stats)new MutationObserver(schedule).observe(stats,{childList:true,subtree:true,characterData:true});
 if(total)new MutationObserver(schedule).observe(total,{childList:true,subtree:true,characterData:true});
 document.addEventListener('datemind:contacts-changed',schedule);
 render();
 // Gamify the form experience by guiding completion, never inventing data or changing persistence.
 const modal=document.getElementById('modal'),name=document.getElementById('in-nome');
 if(modal&&name){
  const note=document.createElement('div');note.className='dm-quest-form-hint';note.setAttribute('aria-live','polite');
  const title=document.getElementById('modalTitle');title?.insertAdjacentElement('afterend',note);
  const fields=['in-nome','in-idade','in-bairro','in-profissao','in-status','in-whatsapp','in-instagram','in-notes','in-date-at'];
  function refresh(){const n=fields.filter(id=>{const el=document.getElementById(id);return el&&String(el.value||'').trim();}).length;note.innerHTML='<span aria-hidden="true">✦</span> '+(n<3?'Comece pelo essencial':n<6?'Perfil ganhando forma':'Ficha bem organizada')+' <span class="dm-quest-form-count">'+n+'/'+fields.length+' informações-chave</span>';}
  modal.addEventListener('input',refresh);modal.addEventListener('change',refresh);
  new MutationObserver(()=>{if(modal.style.display==='flex')refresh();}).observe(modal,{attributes:true,attributeFilter:['style']});
  refresh();
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
