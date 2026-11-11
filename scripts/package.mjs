import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const archive=resolve(process.argv[2]||'/workspace/forest-lounge-deploy.tar');
const result=spawnSync('tar',['-cf',archive,'.openai','dist','drizzle'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
console.log('Deployment archive:',archive);
