const $ = (s, root = document) => root.querySelector(s);
let content, menuPage = 0;
let session = '';
try {session = sessionStorage.getItem('fl-session') || crypto.randomUUID(); sessionStorage.setItem('fl-session', session);} catch {session = crypto.randomUUID();}
const trackingAllowed = navigator.doNotTrack !== '1' && !navigator.globalPrivacyControl;
exportedInit();
async function api(path, options = {}) {
 const response = await fetch(path, {headers:{'Content-Type':'application/json'}, ...options});
 const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.'); return data;
}
function track(event) {
 if (!trackingAllowed) return;
 let referrer = 'Direct'; try {const ref = document.referrer && new URL(document.referrer); if(ref && ref.origin !== location.origin) referrer = ref.hostname;}catch{}
 fetch('/api/activity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,session,device:matchMedia('(max-width: 800px)').matches?'Mobile':'Desktop',referrer}),keepalive:true}).catch(()=>{});
}
function value(path) {return path.split('.').reduce((o,k)=>o?.[k],content);}
function node(tag, cls, text) {const n=document.createElement(tag); if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function render() {
 document.querySelectorAll('[data-text]').forEach(e=>{const v=value(e.dataset.text);if(typeof v==='string')e.textContent=v;});
 document.querySelectorAll('[data-image]').forEach(e=>{const v=value(e.dataset.image);if(v)e.src=v;});
 document.querySelectorAll('[data-phone]').forEach(e=>e.href='tel:'+content.contact.phone.replace(/[^+0-9]/g,''));
 document.querySelectorAll('[data-secondary-phone]').forEach(e=>e.href='tel:'+content.contact.phoneSecondary.replace(/[^+0-9]/g,''));
 document.querySelectorAll('[data-map]').forEach(e=>e.href=content.contact.mapUrl);
 $('#occasions').replaceChildren(...content.events.occasions.map(x=>node('span','',x)));
 $('#gallery').replaceChildren(...content.gallery.map(item=>{const figure=node('figure');const img=node('img');img.src=item.image;img.alt=item.caption;img.loading='lazy';figure.append(img,node('figcaption','',item.caption));return figure;}));
 const now = new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Dhaka'});
 const offers=content.offers.filter(o=>o.active&&(!o.endDate||o.endDate>=now)&&(!o.startDate||o.startDate<=now));
 $('#offer-empty').hidden=offers.length>0;
 $('#offers-list').replaceChildren(...offers.map(o=>{const card=node('article','offer-card glass');card.append(node('p','eyebrow',o.label||'AT FOREST LOUNGE'),node('h3','',o.title),node('p','',o.description));const b=node('button','button outline','Enquire about this offer ↗');b.onclick=()=>openBooking('À la carte dining',o.title);card.append(b);if(o.terms)card.append(node('small','',o.terms));if(o.endDate)card.append(node('small','','Available until '+new Date(o.endDate+'T12:00:00+06:00').toLocaleDateString('en-GB',{timeZone:'Asia/Dhaka',day:'numeric',month:'long',year:'numeric'})));return card;}));
 const items=content.menuItems.filter(x=>x.available);$('#menu-item-section').hidden=!items.length;
 const categories=['All',...new Set(items.map(x=>x.category||'Favourites'))];
 function filter(category){$('#menu-filters').querySelectorAll('button').forEach(b=>{const selected=b.textContent===category;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});$('#menu-items').replaceChildren(...items.filter(x=>category==='All'||(x.category||'Favourites')===category).map(x=>{const dish=node('article','dish');const copy=node('div');copy.append(node('h3','',x.name),node('p','',x.description));dish.append(copy,node('span','dish-price',x.price?'৳ '+x.price:'Ask our team'));return dish;}));}
 $('#menu-filters').replaceChildren(...categories.map(c=>{const b=node('button','',c);b.onclick=()=>filter(c);return b;}));filter('All');
 $('#social-links').replaceChildren(...['facebook','instagram'].filter(k=>content.contact[k]).map(k=>{const a=node('a','',k[0].toUpperCase()+k.slice(1)+' ↗');a.href=content.contact[k];a.target='_blank';a.rel='noopener noreferrer';return a;}));
}
const navToggle=$('.nav-toggle'),nav=$('#nav');
navToggle.onclick=()=>{const open=navToggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close menu':'Open menu');navToggle.textContent=open?'×':'☰';};
nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open menu');navToggle.textContent='☰';}});
window.addEventListener('scroll',()=>$('.site-header').classList.toggle('scrolled',scrollY>50),{passive:true});
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-20% 0px -60% 0px'});
['home','about','events','menu','offers'].forEach(id=>observer.observe(document.getElementById(id)));
function showDialog(dialog){dialog.showModal();document.body.classList.add('modal-open');}
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>document.body.classList.remove('modal-open'));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
const form=$('#booking-form');
const timeSelect=form.elements.time;for(let h=12;h<=22;h++)for(const m of [0,30]){const opt=node('option','',`${h>12?h-12:h}:${m?'30':'00'} PM`);opt.value=`${h}:${m?'30':'00'}`;timeSelect.append(opt);}
function openBooking(occasion,note){form.hidden=false;$('#booking-success').hidden=true;$('#booking-message').textContent='';form.elements.date.min=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Dhaka'});if(occasion)form.elements.occasion.value=occasion;if(note)form.elements.note.value=note;showDialog($('#booking-dialog'));track('booking_open');}
document.addEventListener('click',e=>{const b=e.target.closest('[data-book]');if(b)openBooking(b.dataset.occasion||'À la carte dining');const t=e.target.closest('[data-track]');if(t)track(t.dataset.track);});
form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;$('#booking-message').textContent='Sending your request…';try{const data=Object.fromEntries(new FormData(form));data.session=session;data.guests=Number(data.guests);const result=await api('/api/reservations',{method:'POST',body:JSON.stringify(data)});$('#success-message').textContent=`Thank you, ${data.name}. Your request for ${data.guests} guest${data.guests>1?'s':''} has been received. Reference: ${result.reference}.`;form.hidden=true;$('#booking-success').hidden=false;form.reset();track('reservation_sent');}catch(error){$('#booking-message').textContent=error.message;}finally{button.disabled=false;}};
function changePage(direction){if(!content?.menu.pages.length)return;menuPage=Math.max(0,Math.min(content.menu.pages.length-1,menuPage+direction));$('#menu-page').src=content.menu.pages[menuPage];$('#menu-page').alt=`Forest Lounge printed menu, page ${menuPage+1}`;$('#page-count').textContent=`${menuPage+1} / ${content.menu.pages.length}`;$('#prev-page').disabled=menuPage===0;$('#next-page').disabled=menuPage===content.menu.pages.length-1;$('.menu-viewer').scrollTop=0;}
function openMenu(){if(!content){$('#toast').textContent='The menu is loading. Please try again in a moment.';$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3500);return;}if(!content.menu.pages.length)return;changePage(0);showDialog($('#menu-dialog'));track('menu_view');}
$('#full-menu').onclick=openMenu;$('#browse-menu').onclick=openMenu;$('#prev-page').onclick=()=>changePage(-1);$('#next-page').onclick=()=>changePage(1);$('#menu-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight')changePage(1);if(e.key==='ArrowLeft')changePage(-1);});
async function exportedInit(){try{content=(await api('/api/content')).content;render();track('page_view');}catch{const t=$('#toast');t.textContent='Live information is temporarily unavailable. Please call +8801322853811 for assistance.';t.style.display='block';setTimeout(()=>t.style.display='none',8000);}}
$('#year').textContent=new Date().getFullYear();

// A wide, scroll-snap photo sequence, with keyboard and touch navigation.
const gallery=$('#gallery');
function updateGalleryCounter(){const figures=[...gallery.querySelectorAll('figure')];const count=$('#gallery-count');if(!count)return;if(!figures.length){count.textContent='';return;}const position=gallery.scrollLeft;let nearest=0;let distance=Infinity;figures.forEach((figure,index)=>{const d=Math.abs((figure.offsetLeft-figures[0].offsetLeft)-position);if(d<distance){distance=d;nearest=index;}});count.textContent=String(nearest+1).padStart(2,'0')+' / '+String(figures.length).padStart(2,'0');}
function moveGallery(direction){const figure=gallery.querySelector('figure');if(!figure)return;const gap=parseFloat(getComputedStyle(gallery).gap)||0;gallery.scrollBy({left:direction*(figure.getBoundingClientRect().width+gap),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('#gallery-prev').onclick=()=>moveGallery(-1);$('#gallery-next').onclick=()=>moveGallery(1);gallery.addEventListener('scroll',updateGalleryCounter,{passive:true});gallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveGallery(e.key==='ArrowRight'?1:-1);}});new MutationObserver(updateGalleryCounter).observe(gallery,{childList:true});
