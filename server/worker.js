import { handleApi } from './api.js';
import { assets } from './generated-assets.js';
const mime={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json',jpg:'image/jpeg',png:'image/png',svg:'image/svg+xml'};
const csp="default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests";
export default {
 async fetch(request,env){
  const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return handleApi(request,env);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  const path=url.pathname==='/'?'/index.html':url.pathname==='/admin'||url.pathname==='/admin/'?'/admin.html':url.pathname;
  const asset=assets[path];if(!asset)return new Response('Not found',{status:404,headers:{'Content-Type':'text/plain','X-Content-Type-Options':'nosniff'}});
  const ext=path.split('.').pop();const headers={'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':ext==='html'?'no-store':'public, max-age=3600','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':csp,'Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
  return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(asset),c=>c.charCodeAt(0)),{headers});
 }
};
