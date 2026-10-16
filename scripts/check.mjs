import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
const root='docs';const html=[];function walk(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())walk(p);else if(p.endsWith('.html'))html.push(p)}}walk(root);
for(const file of html){const text=readFileSync(file,'utf8');assert(text.includes('lang="ko"'));assert(text.includes('name="viewport"'));for(const m of text.matchAll(/(?:href|src)="([^"]+)"/g)){let url=m[1];if(url.startsWith('https://'))continue;if(url.startsWith('#')){assert(text.includes(`id="${url.slice(1)}"`),`${file}: ${url}`);continue;}assert(url.startsWith('/cpp-jeongseok/'),`${file}: invalid base ${url}`);const [p,hash]=url.slice('/cpp-jeongseok/'.length).split('#');let target=path.join(root,p.split('?')[0]);if(p.endsWith('/')||!p)target=path.join(target,'index.html');assert(existsSync(target),`${file}: missing ${target}`);if(hash)assert(readFileSync(target,'utf8').includes(`id="${hash}"`),`${file}: missing #${hash}`)}}
assert(readFileSync('docs/assets/style.css','utf8').includes('font-family:D2Coding'));
console.log(`PASS: ${html.length} HTML pages, local assets, base paths, and anchor targets`);

// Verify token coverage, escaping, text preservation, and theme contrast.
const { renderCode } = await import('./highlight.mjs');
const sample = '// Comment\nconst int count = 42;\nif (count) { return "<tag>&value"; }';
const highlighted = renderCode({text:sample,lang:'cpp'});
for (const token of ['comment','type','number','control','string']) {
  assert(highlighted.includes(`class="hljs-${token}"`), `Missing C++ ${token}`);
}
assert(!highlighted.includes('<tag>'), 'Code must be HTML-escaped');
assert(!renderCode({text:'<script>alert(1)</script>',lang:'unknown'}).includes('<script>'));
assert(renderCode({text:'int value = 1;',lang:'c++'}).includes('hljs-type'));
const decode = text => text.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const lessonSource = readFileSync('content/introduction.md','utf8').match(/```cpp\n([\s\S]*?)```/)[1].trimEnd();
const lessonHtml = readFileSync('docs/lessons/introduction/index.html','utf8');
const codeHtml = lessonHtml.match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/)[1];
assert.equal(decode(codeHtml.replace(/<[^>]*>/g,'' )).trimEnd(),lessonSource, 'Syntax highlighting must preserve code text');
assert(lessonHtml.includes('<code>topics</code>'), 'Inline code must remain unchanged');
const luminance = color => color.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
for(const color of ['569cd6','d8a0df','4ec9b0','9cdcfe','ce9178','b5cea8','57a64a','9a9a9a','c8c8c8','dcdcaa']){
  const ratio=(luminance(color)+.05)/(luminance('1e1e1e')+.05);
  assert(ratio>=4.5, `Low contrast token ${color}: ${ratio}`);
}
console.log('PASS: syntax token coverage, safe fallback, code preservation, inline code, all token contrast >= 4.5:1');

for(const name of ['vector','string']) assert(codeHtml.includes(`<span class="hljs-stl-type">${name}</span>`), `Missing STL type ${name}`);
for(const name of ['topic','topics']) assert.equal([...codeHtml.matchAll(new RegExp(`<span class="hljs-local">${name}</span>`, 'g'))].length,2, `Declaration/use coverage for ${name}`);
console.log('PASS: current lesson STL types and both declaration/use occurrences of topic/topics');

const homeHtml=readFileSync('docs/index.html','utf8');
assert(homeHtml.includes('<div class="cover-code" aria-hidden="true">C<span>++</span></div>'));
assert(!homeHtml.includes('class="cover-logo"'));
assert(homeHtml.includes('<img class="brand-icon"'));
assert(existsSync('docs/assets/fonts/NotoSans-Bold.woff'));
console.log('PASS: typographic cover, retained header logo, self-hosted cover font');

const {renderComments} = await import('./comments.mjs');
const commentsConfig = JSON.parse(readFileSync('content/comments.json','utf8'));
const commentsHtml = renderComments(commentsConfig);
assert(commentsHtml.includes('data-comments-category-id="DIC_kwDOVLkfG84DIkjH"'));
assert(commentsHtml.includes('aria-labelledby="comments-heading"'));
assert(lessonHtml.includes(commentsHtml));
assert(!homeHtml.includes('data-comments-repo='), 'Only lessons should load comments');
for (const config of [{}, {...commentsConfig,enabled:false}, {...commentsConfig,categoryId:''}]) {
  const fallback=renderComments(config);
  assert(fallback.includes('현재는 댓글을 작성할 수 없습니다'));
  assert(!fallback.includes('data-comments-repo='));
}
assert(renderComments({...commentsConfig,category:'<unsafe>"'}).includes('&lt;unsafe&gt;&quot;'));
const app=readFileSync('docs/assets/app.js','utf8');
assert(app.includes("script.src = 'https://giscus.app/client.js'"));
assert(app.includes("mapping: 'pathname', strict: '1'"));
assert(app.includes("theme: 'light', lang: 'ko'"));
assert(app.includes("event.source !== frame?.contentWindow"));
console.log('PASS: per-lesson giscus config, Korean UI, strict mapping, safe disabled/missing-config fallback, origin/source validation');
