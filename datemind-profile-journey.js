/* DateMind — profile journey: presentation-only progressive disclosure. */
(function(){
'use strict';
const labels=['Essencial','Perfil','Conexão','Lazer','Gastronomia','Rotina','Comunicação','Extras'];
const icons=['✦','◈','♡','♫','☕','◷','✉','⋯'];
function setup(){
 const overlay=document.getElementById('modal'),modal=overlay?.querySelector('.modal'),dossier=document.getElementById('dossierFormFields');
 if(!modal||!dossier||modal.querySelector('.dm-journey'))return;
 const title=document.getElementById('modalTitle');
 const first=document.querySelector('label[for="in-nome"]');
 const voice=modal.querySelector('.voice-section');
 if(!first||!voice)return;
 const basic=document.createElement('section');basic.className='dm-journey-panel';basic.dataset.dmPanel='0';
 // Move existing inputs and labels, preserving their IDs, event handlers and autosave bindings.
 let node=first;
 while(node&&node!==dossier){const next=node.nextSibling;basic.appendChild(node);node=next;}
 const panels=[basic];
 const sections=Array.from(dossier.querySelectorAll('.dm-dossier-section'));
 sections.forEach((section,i)=>{const panel=document.createElement('section');panel.className='dm-journey-panel';panel.dataset.dmPanel=String(i+1);section.open=true;panel.appendChild(section);panels.push(panel);});
 const extra=document.createElement('section');extra.className='dm-journey-panel';extra.dataset.dmPanel='7';extra.appendChild(voice);panels.push(extra);
 const journey=document.createElement('div');journey.className='dm-journey';
 journey.innerHTML='<div class="dm-journey-top"><div><span class="dm-journey-eyebrow">FICHA INTERATIVA</span><strong id="dmJourneyHeading">Essencial</strong></div><span id="dmJourneyPercent">0% completo</span></div><div class="dm-journey-progress" role="progressbar" aria-label="Preenchimento do perfil" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><div class="dm-journey-tabs" role="tablist" aria-label="Etapas do perfil"></div><div class="dm-journey-panels"></div><div class="dm-journey-footer"><span id="dmJourneyStep">Etapa 1 de 8</span><div><button type="button" id="dmJourneyBack">Voltar</button><button type="button" id="dmJourneyNext">Próxima etapa →</button></div></div>';
 const tabs=journey.querySelector('.dm-journey-tabs'),holder=journey.querySelector('.dm-journey-panels');
 panels.forEach((panel,i)=>{
  panel.setAttribute('role','tabpanel');panel.id='dm-journey-panel-'+i;
  const tab=document.createElement('button');tab.type='button';tab.className='dm-journey-tab';tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel.id);tab.innerHTML='<span aria-hidden="true">'+icons[i]+'</span><span>'+labels[i]+'</span>';tab.addEventListener('click',()=>select(i));tabs.appendChild(tab);holder.appendChild(panel);
 });
 // Remove the original empty dossier mount point only after moving its live controls.
 dossier.replaceWith(journey);
 const inputs=Array.from(holder.querySelectorAll('input,select,textarea')).filter(el=>el.id!=='in-photo' || true);
 function filled(el){if(el.type==='checkbox')return el.checked;return String(el.value||'').trim()!=='';}
 function updateProgress(){
  const count=inputs.filter(filled).length;
  const percent=inputs.length?Math.round(count/inputs.length*100):0;
  journey.querySelector('#dmJourneyPercent').textContent=percent+'% completo';
  const bar=journey.querySelector('.dm-journey-progress');
  bar.setAttribute('aria-valuenow',String(percent));bar.querySelector('span').style.width=percent+'%';
  panels.forEach((p,i)=>{const fields=Array.from(p.querySelectorAll('input,select,textarea'));const done=fields.filter(filled).length;tabs.children[i].title=done+' de '+fields.length+' campos preenchidos';tabs.children[i].classList.toggle('dm-has-data',done>0);});
 }
 let current=0;
 function select(i){
  current=Math.max(0,Math.min(i,panels.length-1));
  panels.forEach((p,n)=>p.hidden=n!==current);
  Array.from(tabs.children).forEach((t,n)=>{t.setAttribute('aria-selected',String(n===current));t.tabIndex=n===current?0:-1;});
  journey.querySelector('#dmJourneyHeading').textContent=labels[current];
  journey.querySelector('#dmJourneyStep').textContent='Etapa '+(current+1)+' de '+panels.length;
  journey.querySelector('#dmJourneyBack').disabled=current===0;
  journey.querySelector('#dmJourneyNext').textContent=current===panels.length-1?'Voltar ao início':'Próxima etapa →';
  tabs.children[current].scrollIntoView({block:'nearest',inline:'nearest'});
 }
 journey.querySelector('#dmJourneyBack').addEventListener('click',()=>select(current-1));
 journey.querySelector('#dmJourneyNext').addEventListener('click',()=>select(current===panels.length-1?0:current+1));
 holder.addEventListener('input',updateProgress);holder.addEventListener('change',updateProgress);
 new MutationObserver(()=>{if(overlay.style.display==='flex'){select(0);updateProgress();}}).observe(overlay,{attributes:true,attributeFilter:['style']});
 select(0);updateProgress();
 // Existing form save/restore and dossier field IDs remain untouched.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
