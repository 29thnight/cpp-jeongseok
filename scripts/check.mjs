import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
const root='docs';const html=[];function walk(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())walk(p);else if(p.endsWith('.html'))html.push(p)}}walk(root);
for(const file of html){const text=readFileSync(file,'utf8');assert(text.includes('lang="ko"'));assert(text.includes('name="viewport"'));for(const m of text.matchAll(/(?:href|src)="([^"]+)"/g)){let url=m[1];if(url.startsWith('https://'))continue;if(url.startsWith('#')){assert(text.includes(`id="${url.slice(1)}"`),`${file}: ${url}`);continue;}assert(url.startsWith('/cpp-jeongseok/'),`${file}: invalid base ${url}`);const [p,hash]=url.slice('/cpp-jeongseok/'.length).split('#');let target=path.join(root,p);if(p.endsWith('/')||!p)target=path.join(target,'index.html');assert(existsSync(target),`${file}: missing ${target}`);if(hash)assert(readFileSync(target,'utf8').includes(`id="${hash}"`),`${file}: missing #${hash}`)}}
assert(readFileSync('docs/assets/style.css','utf8').includes('font-family:D2Coding'));
console.log(`PASS: ${html.length} HTML pages, local assets, base paths, and anchor targets`);
