import defaultContent from '../content.json' with {type:'json'};
const events = new Set(['page_view','menu_view','booking_open','reservation_sent','call_click','directions_click']);
const statuses = new Set(['new','contacted','confirmed','cancelled']);
const json = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const error = (message,status=400)=>{throw Object.assign(new Error(message),{status});};
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Dhaka'});
const text=(v,max=500)=>typeof v==='string'&&v.length<=max;
const safeUrl=(v)=>text(v,1000)&&((v.startsWith('/assets/')&&!v.includes('..')&&!v.includes('\\'))||/^https:\/\/[^\s]+$/i.test(v));
async function body(req){const raw=await req.text();if(raw.length>100000)error('Request is too large.',413);try{return JSON.parse(raw);}catch{error('Invalid request.');}}
function originCheck(req){const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)error('This action must be made from the website.',403);}
function admin(req,env){const id=req.headers.get('oai-authenticated-user-id');const email=req.headers.get('oai-authenticated-user-email')?.toLowerCase();const allow=(env.ADMIN_EMAILS||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);return Boolean(id&&email&&allow.includes(email));}
async function hash(session){if(!text(session,80)||!/^[\w-]{10,80}$/.test(session))error('Please refresh the page and try again.');const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(today()+':'+session));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function getContent(db){const row=await db.prepare('SELECT data, revision, updated_at FROM site_content WHERE id = 1').first();return row?{content:JSON.parse(row.data),revision:row.revision,updatedAt:row.updated_at}:{content:defaultContent,revision:0,updatedAt:null};}
export function validateContent(c){
 if(!c||typeof c!=='object'||Array.isArray(c))error('Invalid content.');
 const groups=['hero','about','buffet','menu','events','offersIntro','visit','contact'];
 for(const group of groups){if(!c[group]||typeof c[group]!=='object'||Array.isArray(c[group]))error(`Missing ${group} section.`);for(const [key,defaultValue]of Object.entries(defaultContent[group])){if(Array.isArray(defaultValue))continue;if(!text(c[group][key],key==='description'||key==='detail'?2000:1000))error(`Please check ${group}: ${key}.`);if(key==='image'&&!safeUrl(c[group][key]))error(`Please enter a valid image URL in ${group}.`);}}
 if(!c.hero.title.trim()||!c.hero.accent.trim())error('Please enter the homepage heading.');
 if(!/^[+0-9() \-]{7,24}$/.test(c.contact.phone))error('Please enter a valid primary phone number.');
 for(const key of ['mapUrl','facebook','instagram'])if(c.contact[key]&&!/^https:\/\/[^\s]+$/i.test(c.contact[key]))error(`Please enter an https URL for ${key}.`);
 if(!Array.isArray(c.menu.pages)||!c.menu.pages.length||c.menu.pages.length>60||c.menu.pages.some(v=>!safeUrl(v)))error('Add between 1 and 60 valid menu page image URLs.');
 if(!Array.isArray(c.events.occasions)||c.events.occasions.length>12||c.events.occasions.some(x=>!text(x,100)))error('Please check event occasions.');
 for(const key of ['menuItems','offers','gallery'])if(!Array.isArray(c[key])||c[key].length>100)error(`Please check ${key}.`);
 for(const item of c.menuItems){if(!text(item.name,150)||!item.name.trim()||!text(item.description,1000)||!text(item.category,100)||!text(item.price,20)||!/^\d*(\.\d{1,2})?$/.test(item.price)||typeof item.available!=='boolean')error('Please check dish names, descriptions and prices.');}
 for(const o of c.offers){if(!text(o.title,150)||!o.title.trim()||!text(o.description,1500)||!text(o.label,100)||!text(o.terms,1000)||typeof o.active!=='boolean')error('Please check offer details.');for(const key of ['startDate','endDate'])if(o[key]&&!/^\d{4}-\d{2}-\d{2}$/.test(o[key]))error('Please check offer dates.');if(o.startDate&&o.endDate&&o.startDate>o.endDate)error('Offer end date must be after its start date.');}
 for(const g of c.gallery)if(!safeUrl(g.image)||!text(g.caption,200))error('Please check gallery image URLs and captions.');
 return c;
}
export async function handleApi(req,env){
 try{
 const url=new URL(req.url),path=url.pathname;const db=env.DB;if(!db)return json({error:'The database is not connected. Please contact the website administrator.'},503);
 if(path==='/api/content'&&req.method==='GET')return json(await getContent(db));
 if(path==='/api/activity'&&req.method==='POST'){
  originCheck(req);if(req.headers.get('DNT')==='1'||req.headers.get('Sec-GPC')==='1')return json({ok:true});
  const data=await body(req);if(!events.has(data.event))error('Invalid activity.');const sessionHash=await hash(data.session);const device=data.device==='Mobile'?'Mobile':'Desktop';let ref='Direct';if(text(data.referrer,150)&&/^[a-z0-9.-]+$/i.test(data.referrer)&&data.referrer!=='Direct')ref=data.referrer.toLowerCase();
  await db.prepare('INSERT OR IGNORE INTO activity (day,event,session_hash,device,referrer) VALUES (?,?,?,?,?)').bind(today(),data.event,sessionHash,device,ref).run();return json({ok:true});
 }
 if(path==='/api/reservations'&&req.method==='POST'){
  originCheck(req);const data=await body(req);if(data.website)error('Unable to accept this request.');
  if(!text(data.name,100)||data.name.trim().length<2||!text(data.phone,24)||!/^[+0-9() \-]{7,24}$/.test(data.phone))error('Please enter your name and a valid phone number.');
  if(!text(data.email,150)||data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))error('Please enter a valid email address.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date||'')||isNaN(Date.parse(data.date))||data.date<today()||data.date>new Date(Date.now()+365*86400000).toLocaleDateString('en-CA',{timeZone:'Asia/Dhaka'}))error('Choose a date within the next year.');
  if(!/^(1[2-9]|2[0-2]):(00|30)$/.test(data.time||''))error('Choose a time between noon and 10:30 PM.');
  if(Date.parse(data.date+'T'+data.time+':00+06:00')<Date.now())error('Please choose a future time.');
  if(!Number.isInteger(data.guests)||data.guests<1||data.guests>100)error('Choose between 1 and 100 guests.');
  if(!text(data.occasion,100)||!data.occasion||!text(data.note,500))error('Please check the occasion and special requests.');
  const sessionHash=await hash(data.session);const count=await db.prepare('SELECT COUNT(*) AS count FROM reservations WHERE session_hash=? AND created_at>=?').bind(sessionHash,today()).first();if(count.count>=3)error('You’ve already sent several requests today. Please call us for further arrangements.',429);
  const id='FL-'+crypto.randomUUID().slice(0,8).toUpperCase();await db.prepare('INSERT INTO reservations (id,name,phone,email,visit_date,visit_time,guests,occasion,note,status,session_hash,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,data.name.trim(),data.phone.trim(),data.email.trim(),data.date,data.time,data.guests,data.occasion,data.note.trim(),'new',sessionHash,new Date().toISOString()).run();return json({reference:id},201);
 }
 if(path.startsWith('/api/admin/')){
  if(!admin(req,env))return json({error:'Sign in with an approved staff ChatGPT account to access the admin panel.'},403);
  if(req.method!=='GET')originCheck(req);
  if(path==='/api/admin/session')return json({name:req.headers.get('oai-authenticated-user-email'),authenticated:true});
  if(path==='/api/admin/content'&&req.method==='GET')return json(await getContent(db));
  if(path==='/api/admin/content'&&req.method==='PUT'){
   const data=await body(req);validateContent(data.content);if(!Number.isInteger(data.revision)||data.revision<0)error('Invalid content revision.');const now=new Date().toISOString();
   let result;if(data.revision===0)result=await db.prepare('INSERT OR IGNORE INTO site_content (id,data,revision,updated_at) VALUES (1,?,1,?)').bind(JSON.stringify(data.content),now).run();else result=await db.prepare('UPDATE site_content SET data=?,revision=revision+1,updated_at=? WHERE id=1 AND revision=?').bind(JSON.stringify(data.content),now,data.revision).run();
   if(!result.meta.changes)error('Someone else updated this content. Reload the page to get their changes before saving.',409);return json({revision:data.revision+1,updatedAt:now});
  }
  if(path==='/api/admin/reservations'&&req.method==='GET'){const {results}=await db.prepare('SELECT id,name,phone,email,visit_date,visit_time,guests,occasion,note,status,created_at FROM reservations ORDER BY created_at DESC LIMIT 1000').all();return json({reservations:results});}
  if(/^\/api\/admin\/reservations\/FL-[a-f0-9]{8}$/i.test(path)&&req.method==='PATCH'){const data=await body(req);if(!statuses.has(data.status))error('Invalid reservation status.');const result=await db.prepare('UPDATE reservations SET status=? WHERE id=?').bind(data.status,path.split('/').pop()).run();if(!result.meta.changes)error('Reservation not found.',404);return json({ok:true});}
  if(path==='/api/admin/analytics'&&req.method==='GET'){
   const days=[7,30,90].includes(Number(url.searchParams.get('days')))?Number(url.searchParams.get('days')):30;const since=new Date(Date.now()-(days-1)*86400000).toLocaleDateString('en-CA',{timeZone:'Asia/Dhaka'});
   const [daily,actions,devices,sources,bookingCount]=await Promise.all([
    db.prepare("SELECT day,COUNT(*) AS count FROM activity WHERE day>=? AND event='page_view' GROUP BY day ORDER BY day").bind(since).all(),
    db.prepare('SELECT event,COUNT(*) AS count FROM activity WHERE day>=? GROUP BY event ORDER BY count DESC').bind(since).all(),
    db.prepare("SELECT device,COUNT(*) AS count FROM activity WHERE day>=? AND event='page_view' GROUP BY device").bind(since).all(),
    db.prepare("SELECT referrer,COUNT(*) AS count FROM activity WHERE day>=? AND event='page_view' GROUP BY referrer ORDER BY count DESC LIMIT 8").bind(since).all(),
    db.prepare('SELECT COUNT(*) AS total,SUM(CASE WHEN status=\'new\' THEN 1 ELSE 0 END) AS pending FROM reservations WHERE created_at>=?').bind(since).first()
   ]);return json({days,since,daily:daily.results,actions:actions.results,devices:devices.results,sources:sources.results,bookings:bookingCount,today:today()});
  }
 }
 return json({error:'Not found.'},404);
 }catch(err){if(!err.status)console.error('Forest API failed:',err.message);return json({error:err.status?err.message:'We couldn’t complete this request. Please try again or call the restaurant.'},err.status||500);}
}
export { admin };
