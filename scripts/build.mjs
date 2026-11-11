import {readFile,writeFile,mkdir,rm,readdir,cp} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const assets={};for(const name of ['homepage.css','homepage.js','reference.css','reference.js','menu.html','events.html','offers.html','theme.css','index.html','about.html','about.css','style.css','redesign.css','app.js','admin.html','admin.css','admin.js'])assets['/'+name]=(await readFile(name)).toString('base64');
for(const name of await readdir('assets'))assets['/assets/'+name]=(await readFile('assets/'+name)).toString('base64');
const content=JSON.parse(await readFile('content.json','utf8'));
let api=await readFile('server/api.js','utf8');api=api.replace(/^import .*\n/gm,'').replace(/export function /g,'function ').replace(/export async function /g,'async function ').replace(/export \{ admin \};/,'');
let worker=await readFile('server/worker.js','utf8');worker=worker.replace(/^import .*\n/gm,'');
await writeFile('dist/server/index.js',`const defaultContent=${JSON.stringify(content)};\nconst assets=${JSON.stringify(assets)};\n${api}\n${worker}`);
await cp('.openai/hosting.json','dist/.openai/hosting.json');await cp('drizzle','dist/drizzle',{recursive:true});
// Common deployment consumers also expect SQL migrations beside the Worker.
await cp('drizzle','dist/server/drizzle',{recursive:true});
console.log(`Built restaurant, admin, API, ${Object.keys(assets).length} embedded assets and D1 migrations.`);
