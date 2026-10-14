import {execFileSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';

// Only filenames and findings are printed; never echo a matched credential.
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const patterns=[/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{40,}/,/sk-(?:proj-)?[A-Za-z0-9_-]{32,}/,/AKIA[0-9A-Z]{16}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
const problems=[];let total=0;
for(const file of files){
 const size=(await stat(file)).size;total+=size;if(size>20*1024*1024)problems.push(file+': large binary/source; review before publishing');
 if(/(^|\/)(?:\.env(?:\.|$)|node_modules\/|asset-work\/|\.openai\/|\.codex\/)|\.(?:pem|p12|pfx|key)$/.test(file))problems.push(file+': local/private file in index');
 if(/\.(?:js|mjs|json|md|txt|html|css|yml|yaml|svg)$/.test(file)){const body=await readFile(file,'utf8');if(patterns.some(p=>p.test(body)))problems.push(file+': potential credential; value suppressed');}
}
console.log(JSON.stringify({files:files.length,megabytes:+(total/1024/1024).toFixed(2),findings:problems.length}));
if(problems.length){problems.forEach(p=>console.error(p));process.exitCode=1;}
