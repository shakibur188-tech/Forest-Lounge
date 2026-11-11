// Reference-specific motion, implemented without the theme's proprietary runtime.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const page=document.body;
 if(!page.classList.contains('reference-site'))return;
 const legacyRoutes={menu:'/menu/',events:'/events/',offers:'/offers/',home:'/',about:'/about/'};
 if(location.pathname==='/'&&legacyRoutes[location.hash.slice(1)]){location.replace(legacyRoutes[location.hash.slice(1)]);return;}
 const ghosts=[...document.querySelectorAll('[data-letters]')];
 ghosts.forEach(ghost=>{const text=ghost.textContent;ghost.textContent='';[...text].forEach((letter,index)=>{const span=document.createElement('span');span.className='letter';span.style.setProperty('--letter-index',index);span.textContent=letter===' '?'\u00a0':letter;ghost.append(span);});});
 const images=[...document.querySelectorAll('.reference-reveal')];
 const fades=[...document.querySelectorAll('.reference-signature,.reference-script-link')];
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
 let lastScroll=scrollY,queued=false;
 function update(){
  const y=scrollY,delta=y-lastScroll;
  top?.classList.toggle('visible',y>400);
  if(y<130){header.classList.remove('sticky-return','sticky-hidden');}
  else if(delta<-3){header.classList.add('sticky-return');header.classList.remove('sticky-hidden');}
  else if(delta>3){header.classList.add('sticky-hidden');}
  if(!reduced.matches){
   if(banner&&y<800)banner.style.transform=`translateY(${Math.min(y*.18,95)}px)`;
   ghosts.forEach(ghost=>{const box=ghost.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)ghost.style.transform=`translateX(${Math.max(-35,Math.min(35,(innerHeight*.5-box.top)*.08))}px)`;});
  }else{if(banner)banner.style.transform='';ghosts.forEach(g=>g.style.transform='');}
  lastScroll=y;queued=false;
 }
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
 reduced.addEventListener('change',update);update();
})();
