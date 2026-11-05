/* DateMind 2.0 — mobile navigation adapter. No contact or persistence mutations. */
(function () {
  'use strict';
  const markup = '<nav class="dm-mobile-nav" aria-label="Navegação principal">' +
    '<button type="button" data-dm-view="list" aria-label="Ver contatos"><span class="dm-nav-icon" aria-hidden="true">☷</span>Contatos</button>' +
    '<button type="button" data-dm-view="kanban" aria-label="Ver funil"><span class="dm-nav-icon" aria-hidden="true">▥</span>Funil</button>' +
    '<button type="button" data-dm-action="new" aria-label="Novo contato"><span class="dm-nav-icon" aria-hidden="true">＋</span>Novo</button></nav>';
  function activeView() {
    return document.getElementById('kanbanView')?.classList.contains('active') ? 'kanban' : 'list';
  }
  function syncNav() {
    const view=activeView();
    document.querySelectorAll('.dm-mobile-nav [data-dm-view]').forEach(button=>{
      if(button.dataset.dmView===view) button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
  }
  function setup() {
    if(document.querySelector('.dm-mobile-nav')) return;
    document.body.insertAdjacentHTML('beforeend',markup);
    const nav=document.querySelector('.dm-mobile-nav');
    nav.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(!button) return;
      if(button.dataset.dmView) {
        if(typeof window.setView==='function') window.setView(button.dataset.dmView);
        syncNav(); return;
      }
      if(button.dataset.dmAction==='new') { if(typeof window.openModal==='function') window.openModal(); return; }
    });
    const kanban=document.getElementById('kanbanView');
    if(kanban) new MutationObserver(syncNav).observe(kanban,{attributes:true,attributeFilter:['class']});
    syncNav();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
