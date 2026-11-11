import { handleApi } from './api.js';
import { assets } from './generated-assets.js';
const mime={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json',jpg:'image/jpeg',png:'image/png',svg:'image/svg+xml',mp4:'video/mp4'};
const csp="default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self'; media-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests";
export default {
 async fetch(request,env){
  const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return handleApi(request,env);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  const routes={'/':'/index.html','/about':'/about.html','/about/':'/about.html','/meet-the-chef/':'/about.html','/menu':'/menu.html','/menu/':'/menu.html','/events':'/events.html','/events/':'/events.html','/offers':'/offers.html','/offers/':'/offers.html','/admin':'/admin.html','/admin/':'/admin.html'};
  const path=routes[url.pathname]||url.pathname;
  const asset=assets[path];if(!asset)return new Response('Not found',{status:404,headers:{'Content-Type':'text/plain','X-Content-Type-Options':'nosniff'}});
  const ext=path.split('.').pop();const headers={'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':ext==='html'?'no-store':'public, max-age=3600','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':csp,'Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
  const bytes=Uint8Array.from(atob(asset),c=>c.charCodeAt(0));
  headers['Content-Length']=String(bytes.length);
  if(ext==='mp4'){
   headers['Accept-Ranges']='bytes';const range=request.headers.get('Range');
   if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);let start=0,end=bytes.length-1;
    if(!match||!match[1]&&!match[2])return new Response(null,{status:416,headers:{...headers,'Content-Length':'0','Content-Range':`bytes */${bytes.length}`}});
    if(!match[1]){const suffix=Number(match[2]);if(suffix<1)return new Response(null,{status:416,headers:{...headers,'Content-Length':'0','Content-Range':`bytes */${bytes.length}`}});start=Math.max(0,bytes.length-suffix);}else{start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=bytes.length||end<start)return new Response(null,{status:416,headers:{...headers,'Content-Length':'0','Content-Range':`bytes */${bytes.length}`}});
    headers['Content-Range']=`bytes ${start}-${end}/${bytes.length}`;headers['Content-Length']=String(end-start+1);
    return new Response(request.method==='HEAD'?null:bytes.slice(start,end+1),{status:206,headers});
   }
  }
  return new Response(request.method==='HEAD'?null:bytes,{headers});
 }
};
