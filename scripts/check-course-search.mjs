// Exercise the shipped search handler with a minimal DOM, without a browser dependency.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const html=readFileSync('docs/index.html','utf8');
const app=readFileSync('docs/assets/app.js','utf8');
const listeners={};
const input={value:'',addEventListener:(name,fn)=>listeners[name]=fn,focus(){this.focused=true;}};
const form={querySelector:()=>input,addEventListener:(name,fn)=>listeners[name]=fn};
const result={},empty={};
const rows=[...html.matchAll(/<li class="chapter"([^>]+)>/g)].map(([,attributes])=>({hidden:false,dataset:{search:attributes.match(/data-search="([^"]+)"/)[1]},id:attributes.match(/data-lesson-id="([^"]+)"/)?.[1]}));
const modules=[...html.matchAll(/<section class="course-module"[^>]*>([\s\S]*?)<\/section>/g)].map(([,body])=>({hidden:false,querySelectorAll:()=>rows.filter(r=>r.id && body.includes(`data-lesson-id="${r.id}"`))}));
const groups=[rows.filter(r=>!r.id),rows.filter(r=>r.id && !r.id.startsWith('S')),rows.filter(r=>r.id?.startsWith('S'))].map(children=>({hidden:false,querySelectorAll:()=>children}));
const document={querySelector:selector=>({'.search-form':form,'.search-result':result,'.no-results':empty}[selector]??null),querySelectorAll:selector=>({'.chapter':rows,'.course-module':modules,'.curriculum-group':groups}[selector]??[])};
runInNewContext(app,{document});
function search(value,count,moduleCount){input.value=value;listeners.input();assert.equal(rows.filter(r=>!r.hidden).length,count);assert.equal(modules.filter(g=>!g.hidden).length,moduleCount);assert.equal(result.textContent,`${count}개의 강좌가 검색되었습니다`);assert.equal(empty.hidden,count!==0);}
for(let cycle=0;cycle<2;cycle++){
 search('시작과 검증 습관',3,1);
 search('  00-2  ',1,1);
 search('모듈과 코루틴',4,1);
 search('CONST',curriculumCount('const'),modules.filter(g=>g.querySelectorAll().some(r=>r.dataset.search.toLocaleLowerCase('ko').includes('const'))).length);
 search('03-3 준비 중',1,1);
 search('없는검색결과xyz',0,0);assert(groups.every(g=>g.hidden));
 listeners.reset();assert.equal(input.value,'');assert(input.focused);assert.equal(rows.filter(r=>!r.hidden).length,58);assert(modules.every(g=>!g.hidden));assert(groups.every(g=>!g.hidden));assert(result.hidden);
 search('   ',58,14);assert(result.hidden);
}
let prevented=false;listeners.submit({preventDefault(){prevented=true;}});assert(prevented);
console.log('PASS: real search handler, module/lesson/status/multiword/case/whitespace, empty result, repeated reset, focus and submit');
function curriculumCount(word){return rows.filter(r=>r.dataset.search.toLocaleLowerCase('ko').includes(word)).length;}
