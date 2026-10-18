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

const aiHtml=readFileSync('docs/lessons/ai-era-cpp/index.html','utf8');
const aiSource=readFileSync('content/ai-era-cpp.md','utf8');
assert(aiHtml.includes(commentsHtml));
assert(homeHtml.includes('/cpp-jeongseok/lessons/ai-era-cpp/'));
assert(lessonHtml.includes('/cpp-jeongseok/lessons/ai-era-cpp/'));
assert(aiHtml.includes('/cpp-jeongseok/lessons/first-execution/'));
for(const n of [1,2,3,4]) assert(aiSource.includes(`연습 ${n} 해설`));
for(const privateMarker of ['docs.google.com','drive.google.com','비공개 검토본','CalpicoFile_','Sentinel_']) assert(!aiHtml.includes(privateMarker));
assert.equal([...aiHtml.matchAll(/<h1[ >]/g)].length,1);
console.log('PASS: 00-1 navigation, four exercises/answers, comments, private marker exclusion, one article h1');

const figures=[...aiHtml.matchAll(/<figure class="concept-figure">([\s\S]*?)<\/figure>/g)];
assert.equal(figures.length,2);
for(const [,figure] of figures){
  assert(figure.includes('<figcaption>') && figure.includes('AI로 생성한'));
  assert(/alt="[^"]{20,}"/.test(figure));
  assert(figure.includes('loading="lazy"') && figure.includes('decoding="async"'));
  assert(figure.includes('width="1672" height="941"'));
  const src=figure.match(/src="([^"]+)"/)[1];
  assert(src.startsWith('/cpp-jeongseok/assets/illustrations/'));
  assert(existsSync('docs/'+src.slice('/cpp-jeongseok/'.length)));
  assert(figure.includes(`href="${src}"`));
}
assert(figures[1][1].includes('측정해야 합니다'));
const css=readFileSync('assets/style.css','utf8');
assert(css.includes('.prose .concept-figure img{display:block;width:100%;max-width:100%;height:auto}'));
console.log('PASS: two original illustrations, accessible descriptions, captions, intrinsic aspect ratio, responsive sizing, full-size links, explicit measurement caveat');

const firstHtml=readFileSync('docs/lessons/first-execution/index.html','utf8');
const firstSource=readFileSync('content/first-execution.md','utf8');
assert(firstHtml.includes(commentsHtml));
assert(homeHtml.includes('/cpp-jeongseok/lessons/first-execution/'));
assert(firstHtml.includes('/cpp-jeongseok/lessons/ai-era-cpp/'));
const firstBlocks=[...firstSource.matchAll(/```cpp\n([\s\S]*?)```/g)];
const firstRendered=[...firstHtml.matchAll(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)];
assert.equal(firstBlocks.length,3);assert.equal(firstRendered.length,3);
for(let i=0;i<3;i++)assert.equal(decode(firstRendered[i][1].replace(/<[^>]*>/g,'')).trimEnd(),firstBlocks[i][1].trimEnd());
assert(firstBlocks[0][1].includes('"Hello World!" << std::endl;'));
assert(firstBlocks[2][1].includes('"Start." << std::endl;'));
assert(firstHtml.includes('AI로 생성한 개념 그림'));
assert(firstHtml.includes('00-2-source-build-run.webp'));
assert(firstHtml.includes('width="1672" height="941"'));
for(const marker of ['docs.google.com','drive.google.com','비공개 검토본','CalpicoFile_','Sentinel_','CHECKPOINT','검토 묶음'])assert(!firstHtml.includes(marker));
assert.equal([...firstHtml.matchAll(/<h1[ >]/g)].length,1);
assert(firstHtml.includes('&lt;iostream&gt;'));
console.log('PASS: 00-2 approved endl examples, source preservation, illustration, privacy, navigation, comments');

// Standard stream objects and function manipulators are different categories,
// even when a manipulator is passed to operator<< without call parentheses.
const hello = 'std::cout << "Hello World!" << std::endl;';
const helloHtml = renderCode({text:hello,lang:'cpp'});
assert(helloHtml.includes('<span class="hljs-global">cout</span>'));
assert(helloHtml.includes('<span class="hljs-title function_">endl</span>'));
assert.equal(decode(helloHtml.replace(/<[^>]*>/g,'')).trimEnd(),hello);
for(const name of ['cin','cout','cerr','clog','wcin','wcout','wcerr','wclog']) {
  for(const separator of ['::',' :: ']) {
    assert(renderCode({text:`std${separator}${name};`,lang:'cpp'}).includes(`<span class="hljs-global">${name}</span>`));
  }
}
for(const name of ['endl','ends','flush','ws','boolalpha','noboolalpha','showbase','noshowbase','showpoint','noshowpoint','showpos','noshowpos','skipws','noskipws','uppercase','nouppercase','unitbuf','nounitbuf','internal','left','right','dec','hex','oct','fixed','scientific','hexfloat','defaultfloat']) {
  for(const suffix of [';', '(std::cout);']) {
    const output=renderCode({text:`std :: ${name}${suffix}`,lang:'cpp'});
    assert(output.includes(`<span class="hljs-title function_">${name}</span>`),`Manipulator ${name}${suffix}`);
  }
}
const shadowed=renderCode({text:'int cout = 1; int endl = 2; std::cout << cout << std::endl;',lang:'cpp'});
assert.equal([...shadowed.matchAll(/class="hljs-local">cout</g)].length,2);
assert(shadowed.includes('class="hljs-local">endl</span>'));
assert(shadowed.includes('class="hljs-global">cout</span>'));
assert(shadowed.includes('class="hljs-title function_">endl</span>'));
const protectedTokens=renderCode({text:'// std::cout std::endl\n"std::cout std::endl"; custom::endl; std::unknown;',lang:'cpp'});
assert(!protectedTokens.includes('hljs-global'));
assert(!protectedTokens.includes('hljs-title function_'));
assert(css.includes('.prose pre .hljs-global{color:#d4d4d4}'));
assert(css.includes('.prose pre .hljs-title.function_,.prose pre .hljs-title{color:#dcdcaa}'));
assert((luminance('d4d4d4')+.05)/(luminance('1e1e1e')+.05)>=4.5);
for(const [,block] of firstRendered) {
  assert(block.includes('class="hljs-global">cout</span>'));
  assert(block.includes('class="hljs-title function_">endl</span>'));
}
console.log('PASS: stream globals, no-parenthesis/explicit manipulators, whitespace, local-name collisions, protected literals/comments, exact Hello World text and deployed lesson token categories');

const readingHtml=readFileSync('docs/lessons/reading-execution/index.html','utf8');
const readingSource=readFileSync('content/reading-execution.md','utf8');
assert(readingHtml.includes(commentsHtml));
assert(homeHtml.includes('/cpp-jeongseok/lessons/reading-execution/'));
assert(firstHtml.includes('/cpp-jeongseok/lessons/reading-execution/'));
assert(readingHtml.includes('/cpp-jeongseok/lessons/first-execution/'));
assert(homeHtml.includes('본편 6수업'));
assert.equal([...readingHtml.matchAll(/<h1[ >]/g)].length,1);
const readingBlocks=[...readingSource.matchAll(/```cpp\n([\s\S]*?)```/g)];
const readingRendered=[...readingHtml.matchAll(/<pre><code class="[^"]*language-cpp[^"]*">([\s\S]*?)<\/code><\/pre>/g)];
assert.equal(readingBlocks.length,9);assert.equal(readingRendered.length,9);
for(let i=0;i<readingBlocks.length;i++) {
 assert.equal(decode(readingRendered[i][1].replace(/<[^>]*>/g,'')).trimEnd(),readingBlocks[i][1].trimEnd());
 assert(readingRendered[i][1].includes('class="hljs-global">cout</span>'));
 assert(readingRendered[i][1].includes('class="hljs-title function_">endl</span>'));
}
for(const marker of ['docs.google.com','drive.google.com','비공개','검토본','CalpicoFile_','Sentinel_','[실행 추적 표]','[개념 일러스트 삽입]'])assert(!readingHtml.includes(marker));
assert(readingHtml.includes('<code>#include &lt;iostream&gt;</code>'));
assert(readingHtml.includes('<table>'));
assert(readingHtml.includes('MSVC 빌드와 Visual Studio GUI 실습은 실행하지 않았습니다.'));
assert(readingHtml.includes('width="1536" height="1024"'));
assert(readingHtml.includes('00-3-read-follow-output.webp'));
assert(readingHtml.includes('AI로 생성한 개념 일러스트'));
console.log('PASS: 00-3 exact 9 code blocks, stream/manipulator syntax colors, illustration, trace table, privacy, navigation, comments, tool-test caveat');

const variablesHtml=readFileSync('docs/lessons/variables-initialization/index.html','utf8');
const variablesSource=readFileSync('content/variables-initialization.md','utf8');
assert.equal([...variablesHtml.matchAll(/<h1[ >]/g)].length,1);
assert(variablesHtml.includes(commentsHtml));
assert(homeHtml.includes('/cpp-jeongseok/lessons/variables-initialization/'));
assert(readingHtml.includes('/cpp-jeongseok/lessons/variables-initialization/'));
assert(variablesHtml.includes('/cpp-jeongseok/lessons/reading-execution/'));
const vBlocks=[...variablesSource.matchAll(/```cpp\n([\s\S]*?)```/g)];
const vRendered=[...variablesHtml.matchAll(/<pre><code class="[^"]*language-cpp[^"]*">([\s\S]*?)<\/code><\/pre>/g)];
assert.equal(vBlocks.length,vRendered.length);
for(let i=0;i<vBlocks.length;i++) assert.equal(decode(vRendered[i][1].replace(/<[^>]*>/g,'')).trimEnd(),vBlocks[i][1].trimEnd());
for(const n of [1,2,3,4,5])assert(variablesHtml.includes(`문제 ${n} 정답`));
for(const marker of ['docs.google.com','drive.google.com','비공개','검토본','CalpicoFile_','Sentinel_','[ILLUSTRATION]'])assert(!variablesHtml.includes(marker));
assert(variablesHtml.includes('width="1200" height="800"'));
assert(variablesHtml.includes('AI 생성 개념 일러스트'));
assert(variablesHtml.includes('hljs-local">remainingAttempts</span>'));
assert(variablesHtml.includes('hljs-global">cout</span>'));
assert(variablesHtml.includes('hljs-title function_">endl</span>'));
console.log('PASS: 01-1 approved code preservation, five exercise answers, navigation, illustration, privacy, comments and syntax colors');


const calculationHtml=readFileSync('docs/lessons/calculation-conversion/index.html','utf8');
const calculationSource=readFileSync('content/calculation-conversion.md','utf8');
const publishedChapters=JSON.parse(readFileSync('content/chapters.json','utf8')).filter(c=>c.status==='published');
assert.equal(publishedChapters.length,7, 'Introduction plus six published lessons');
assert(publishedChapters.some(c=>c.number==='01-2'&&c.slug==='calculation-conversion'&&c.title==='계산과 변환'));
assert.equal([...calculationHtml.matchAll(/<h1[ >]/g)].length,1);
assert(calculationHtml.includes(commentsHtml));
assert(homeHtml.includes('/cpp-jeongseok/lessons/calculation-conversion/'));
assert(variablesHtml.includes('/cpp-jeongseok/lessons/calculation-conversion/'));
assert(calculationHtml.includes('/cpp-jeongseok/lessons/variables-initialization/'));
assert(!variablesHtml.includes('다음 수업은 준비 중입니다.'));
assert(calculationHtml.includes('01-3 분기와 반복 →'));
assert(homeHtml.includes(`본편 ${publishedChapters.length-1}수업`));
assert(readFileSync('README.md','utf8').includes(`본편 ${publishedChapters.length-1}수업`));
const calculationBlocks=[...calculationSource.matchAll(/```(cpp|text)\n([\s\S]*?)```/g)];
const calculationRendered=[...calculationHtml.matchAll(/<pre><code class="[^"]*language-(cpp|plaintext)[^"]*">([\s\S]*?)<\/code><\/pre>/g)];
assert.equal(calculationBlocks.length,9);
assert.equal(calculationRendered.length,9);
for(let i=0;i<calculationBlocks.length;i++){
  assert.equal(calculationRendered[i][1],calculationBlocks[i][1]==='cpp'?'cpp':'plaintext');
  assert.equal(decode(calculationRendered[i][2].replace(/<[^>]*>/g,'')).trimEnd(),calculationBlocks[i][2].trimEnd(),`01-2 block ${i+1} text preservation`);
}
for(const n of [1,2,3,4,5,6]) assert(calculationSource.includes(`문제 ${n} 정답`));
for(const marker of ['docs.google.com','drive.google.com','비공개','검토본','CalpicoFile_','Sentinel_','[ILLUSTRATION]','CHECKPOINT','manifest.json','/workspace/']){
  assert(!calculationSource.includes(marker));
  assert(!calculationHtml.includes(marker));
}
assert(calculationHtml.includes('GCC 14.2.0'));
assert(calculationHtml.includes('MSVC와 Visual Studio의 실행 화면은 확인하지 않았습니다.'));
assert(calculationHtml.includes('static_cast&lt;double&gt;(total)'));
assert(calculationHtml.includes('static_cast&lt;int&gt;(4.8)'));
assert(calculationHtml.includes('&lt;limits&gt;의 std::numeric_limits'));
assert(!/<(?:double|int|limits)>/.test(calculationHtml), 'C++ template arguments and headers must not become HTML tags');
const calculationFigures=[...calculationHtml.matchAll(/<figure class="concept-figure">([\s\S]*?)<\/figure>/g)];
assert.equal(calculationFigures.length,1);
const calculationFigure=calculationFigures[0][1];
assert(calculationFigure.includes('width="1200" height="800"'));
assert(calculationFigure.includes('loading="lazy"')&&calculationFigure.includes('decoding="async"'));
assert(calculationFigure.includes('AI 생성 개념 일러스트'));
assert(calculationFigure.includes('실제 메모리 구조나 부동소수점의 정확한 표현 방식을 나타내지는 않습니다.'));
assert(/alt="[^"]{20,}"/.test(calculationFigure));
const calculationImage='/cpp-jeongseok/assets/illustrations/01-2-counting-measuring.webp';
assert(calculationFigure.includes(`href="${calculationImage}"`));
assert(calculationFigure.includes(`src="${calculationImage}"`));
assert(readFileSync('assets/illustrations/01-2-counting-measuring.webp').equals(readFileSync('docs/assets/illustrations/01-2-counting-measuring.webp')));
const calculationFiles=['01-integer-division.cpp','02-conversion-timing.cpp','03-boolean-conditions.cpp','04-integer-limits.cpp'];
assert.deepEqual(readdirSync('assets/examples/01-2').sort(),[...calculationFiles].sort(), 'Publish only standalone study examples');
assert.deepEqual(readdirSync('docs/assets/examples/01-2').sort(),[...calculationFiles].sort());
const runnableCalculationBlocks=calculationBlocks.filter(b=>b[1]==='cpp'&&b[2].includes('int main()'));
assert.equal(runnableCalculationBlocks.length,4);
for(let i=0;i<calculationFiles.length;i++){
  const file=calculationFiles[i];
  assert.equal(readFileSync(`assets/examples/01-2/${file}`,'utf8'),runnableCalculationBlocks[i][2]);
  assert.equal(readFileSync(`docs/assets/examples/01-2/${file}`,'utf8'),runnableCalculationBlocks[i][2]);
  assert(calculationHtml.includes(`/cpp-jeongseok/assets/examples/01-2/${file}`));
}
assert(calculationHtml.includes('hljs-global">cout</span>'));
assert(calculationHtml.includes('hljs-title function_">boolalpha</span>'));
assert(calculationHtml.includes('hljs-title function_">endl</span>'));
console.log('PASS: 01-2 nine exact code/output blocks, six answers, escaped prose, original responsive figure, four exact downloadable examples, privacy, navigation, published count, comments and syntax colors');


const branchSource=readFileSync('content/branch-loop.md','utf8');
const branchHtml=readFileSync('docs/lessons/branch-loop/index.html','utf8');
assert.equal((branchHtml.match(/<h1>/g)||[]).length,1);
assert(branchHtml.includes('concept-figure') && branchHtml.includes('AI 생성 개념 일러스트'));
assert(branchHtml.includes('width="1200" height="800"'));
assert(branchHtml.includes('&lt;iostream&gt;'));
assert(!branchHtml.includes('[개념 일러스트 삽입]'));
assert(!/drive.google|docs.google|private\/|CalpicoFile|검토본/.test(branchHtml));
const branchBlocks=[...branchSource.matchAll(/^```cpp\n([\s\S]*?)^```/gm)];
assert.equal(branchBlocks.length,10);
for (let i=0;i<6;i++) {
 const file=['01_if','02_else_if','03_switch','04_for','05_while','06_break_continue'][i]+'.cpp';
 assert.equal(readFileSync('assets/examples/01-3/'+file,'utf8'),branchBlocks[i][1]);
 assert(branchHtml.includes('/cpp-jeongseok/assets/examples/01-3/'+file));
}
assert(branchHtml.includes('giscus'));
assert(branchHtml.includes('lessons/calculation-conversion/'));
assert(calculationHtml.includes('lessons/branch-loop/'));
console.log('PASS: 01-3 code preservation, six downloads, accessible original figure, privacy, navigation and comments');