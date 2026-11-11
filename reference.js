// Reference-specific motion, implemented without the theme's proprietary runtime.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const page=document.body;
 if(!page.classList.contains('reference-site'))return;
 const legacyRoutes={menu:'/fine-dine/',events:'/events/',offers:'/offers/',home:'/',about:'/about/'};
 if(location.pathname==='/'&&legacyRoutes[location.hash.slice(1)]){location.replace(legacyRoutes[location.hash.slice(1)]);return;}
 const ghosts=[...document.querySelectorAll('[data-letters]')];
 ghosts.forEach(ghost=>{const text=ghost.textContent;ghost.textContent='';[...text].forEach((letter,index)=>{const span=document.createElement('span');span.className='letter';span.style.setProperty('--letter-index',index);span.textContent=letter===' '?'\u00a0':letter;ghost.append(span);});});
 const images=[...document.querySelectorAll('.reference-reveal')];
 const fades=[...document.querySelectorAll('.reference-signature,.reference-script-link,.footer-contact-grid')];
 let observer;
 function configureMotion(){
  observer?.disconnect();
  images.forEach(image=>image.classList.remove('animate-image','appeared'));
  fades.forEach(el=>el.classList.remove('reference-fade','appeared'));
  ghosts.forEach(el=>el.classList.remove('appeared'));
  if(reduced.matches||!('IntersectionObserver'in window)){ghosts.forEach(el=>el.classList.add('appeared'));return;}
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('appeared');observer.unobserve(entry.target);}}),{rootMargin:'0px 0px -20px 0px',threshold:0});
  [...images,...fades,...ghosts].forEach(el=>{
   if(images.includes(el))el.classList.add('animate-image');
   if(fades.includes(el))el.classList.add('reference-fade');
   observer.observe(el);
  });
 }
 configureMotion();reduced.addEventListener('change',configureMotion);
 const header=document.querySelector('.site-header'),top=document.querySelector('.reference-top'),banner=document.querySelector('.reference-banner>img');
 let queued=false;
 function update(){
  const y=scrollY;
  top?.classList.toggle('visible',y>400);
  header.classList.remove('sticky-return','sticky-hidden');header.classList.toggle('is-scrolled',y>25);
  if(!reduced.matches){
   if(banner&&y<800)banner.style.transform=`translateY(${Math.min(y*.18,95)}px)`;
   ghosts.forEach(ghost=>{const box=ghost.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)ghost.style.transform=`translateX(${Math.max(-35,Math.min(35,(innerHeight*.5-box.top)*.08))}px)`;});
  }else{if(banner)banner.style.transform='';ghosts.forEach(g=>g.style.transform='');}
  queued=false;
 }
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
 reduced.addEventListener('change',update);update();
})();

// Extend section reveals to every public page and asynchronously rendered cards.
(() => {
 if(!document.body.classList.contains('reference-site'))return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const selector='.reference-chef-copy,.reference-experience-copy,.reference-story-copy,.reference-offers-intro,.home-section-heading,.event-card,.visit-map-panel,.visit-details-panel,.home-contact,.reference-event-cta';
 let observer;
 function watch(root){if(preference.matches||!observer)return;const items=[];if(root.matches?.(selector))items.push(root);items.push(...(root.querySelectorAll?.(selector)||[]));items.forEach(el=>{if(el.classList.contains('site-motion-ready'))return;if(el.getBoundingClientRect().top<innerHeight*.95)return;el.classList.add('site-motion-ready');observer.observe(el);});}
 function configure(){observer?.disconnect();document.querySelectorAll('.site-motion-ready').forEach(el=>el.classList.remove('site-motion-ready','site-motion-visible'));if(preference.matches||!('IntersectionObserver'in window)){observer=null;return;}observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('site-motion-visible');observer.unobserve(entry.target);}}),{threshold:0,rootMargin:'0px 0px -25px 0px'});watch(document);}
 configure();preference.addEventListener('change',configure);
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)watch(node);}))).observe(document.querySelector('#main'),{childList:true,subtree:true});
})();
