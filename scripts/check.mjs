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
assert(homeHtml.includes('본편 12수업'));
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
assert.equal(publishedChapters.length,13, 'Introduction plus twelve published lessons');
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
assert(calculationHtml.includes('<code>&lt;limits&gt;</code>의 <code>std::numeric_limits</code>'));
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
const consoleSource=readFileSync('content/console-program.md','utf8');
const consoleHtml=readFileSync('docs/lessons/console-program/index.html','utf8');
assert.equal((consoleHtml.match(/<h1>/g)||[]).length,1);
assert(consoleHtml.includes(commentsHtml));
assert(consoleHtml.includes('lessons/branch-loop/'));
assert(branchHtml.includes('lessons/console-program/'));
assert(homeHtml.includes('lessons/console-program/'));
const consoleBlocks=[...consoleSource.matchAll(/^```cpp\n([\s\S]*?)^```/gm)];
const consoleRendered=[...consoleHtml.matchAll(/<pre><code class="[^"]*language-cpp[^"]*">([\s\S]*?)<\/code><\/pre>/g)];
assert.equal(consoleBlocks.length,2);assert.equal(consoleRendered.length,2);
for(let i=0;i<2;i++){
 assert.equal(decode(consoleRendered[i][1].replace(/<[^>]*>/g,'')).trimEnd(),consoleBlocks[i][1].trimEnd());
 assert.equal(readFileSync('assets/examples/01-4/'+['extraction_demo.cpp','order_counter.cpp'][i],'utf8'),consoleBlocks[i][1]);
}
for(const f of ['extraction_demo.cpp','order_counter.cpp','exercise6_price150.cpp']) {
 assert(consoleHtml.includes('/cpp-jeongseok/assets/examples/01-4/'+f));
 assert(readFileSync('assets/examples/01-4/'+f).equals(readFileSync('docs/assets/examples/01-4/'+f)));
}
for(const marker of ['docs.google.com','drive.google.com','비공개','검토본','CalpicoFile_','Sentinel_','[ILLUSTRATION]','/workspace/','CHECKPOINT'])assert(!consoleHtml.includes(marker));
assert(consoleHtml.includes('&lt;limits&gt;'));
assert(!/<(?:limits|iostream|std::streamsize)>/.test(consoleHtml));
assert(consoleHtml.includes('width="1200" height="800"'));
assert(consoleHtml.includes('AI 생성 개념 일러스트'));
assert(consoleHtml.includes('loading="lazy"')&&consoleHtml.includes('decoding="async"'));
assert(consoleHtml.includes('hljs-global">cin</span>'));
assert(consoleHtml.includes('hljs-global">cout</span>'));
assert(consoleHtml.includes('hljs-local">quantity</span>'));
assert(consoleHtml.includes('GCC 14.2.0'));
assert(consoleHtml.includes('MSVC 및 Visual Studio'));
console.log('PASS: 01-4 exact code/downloads, escaped prose, original illustration, privacy, navigation, comments, syntax colors and test limits');

const functionsSource=readFileSync('content/functions-basics.md','utf8');
const functionsHtml=readFileSync('docs/lessons/functions-basics/index.html','utf8');
assert(publishedChapters.some(c=>c.number==='02-1'&&c.slug==='functions-basics'&&c.title==='함수를 나누는 기준'));
assert.equal([...functionsHtml.matchAll(/<h1[ >]/g)].length,1);
assert(functionsHtml.includes(commentsHtml));
assert(homeHtml.includes('/cpp-jeongseok/lessons/functions-basics/'));
assert(consoleHtml.includes('/cpp-jeongseok/lessons/functions-basics/'));
assert(!consoleHtml.includes('다음 수업은 준비 중입니다.'));
assert(functionsHtml.includes('/cpp-jeongseok/lessons/console-program/'));
const functionsBlocks=[...functionsSource.matchAll(/^```(cpp|text)\n([\s\S]*?)^```/gm)];
const functionsRendered=[...functionsHtml.matchAll(/<pre><code class="[^"]*language-(cpp|plaintext)[^"]*">([\s\S]*?)<\/code><\/pre>/g)];
assert.equal(functionsBlocks.length,20);
assert.equal(functionsBlocks.filter(b=>b[1]==='cpp').length,17);
assert.equal(functionsBlocks.length,functionsRendered.length);
for(let i=0;i<functionsBlocks.length;i++){
 assert.equal(functionsRendered[i][1],functionsBlocks[i][1]==='cpp'?'cpp':'plaintext');
 assert.equal(decode(functionsRendered[i][2].replace(/<[^>]*>/g,'')).trimEnd(),functionsBlocks[i][2].trimEnd(),`02-1 block ${i+1} exact text`);
}
for(const n of [1,2,3,4,5,6]){
 assert(functionsSource.includes(`### 문제 ${n}.`));
 assert(functionsSource.includes(`### 정답 ${n}.`));
}
const functionsFiles=['01_card_area.cpp','02_local_copy.cpp','03_declaration_definition.cpp','04_checked_layout.cpp','ex02_practice_minutes.cpp','ex03_return_instead_of_output.cpp','ex05_scope_error.cpp','ex05_scope_fixed.cpp','ex06_missing_definition.cpp','ex06_definition_added.cpp'];
const functionsPrograms=functionsBlocks.filter(b=>b[1]==='cpp'&&b[2].includes('int main()'));
assert.equal(functionsPrograms.length,10);
for(const dir of ['assets/examples/02-1','docs/assets/examples/02-1']){
 assert.deepEqual(readdirSync(dir).sort(),[...functionsFiles].sort(),'Only the ten educational C++ source files may be published');
 for(const file of functionsFiles){
  const program=readFileSync(`${dir}/${file}`,'utf8');
  assert(functionsPrograms.some(b=>b[2]===program),`02-1 ${file} must match a complete source block exactly`);
  assert(functionsHtml.includes(`/cpp-jeongseok/assets/examples/02-1/${file}`));
 }
}
assert(functionsHtml.includes('컴파일 실패 예제'));
assert(functionsHtml.includes('링크 실패 예제'));
assert(functionsHtml.includes('의도적으로 빌드에 실패하는 연습 예제'));
const functionsFigures=[...functionsHtml.matchAll(/<figure class="concept-figure">([\s\S]*?)<\/figure>/g)];
assert.equal(functionsFigures.length,1);
const functionsFigure=functionsFigures[0][1];
const functionsImage='/cpp-jeongseok/assets/illustrations/02-1-function-workbench.webp';
assert(functionsFigure.includes(`href="${functionsImage}"`));
assert(functionsFigure.includes(`src="${functionsImage}"`));
assert(functionsFigure.includes('width="1200" height="800"'));
assert(functionsFigure.includes('loading="lazy"')&&functionsFigure.includes('decoding="async"'));
assert(/alt="[^"]{20,}"/.test(functionsFigure));
assert(functionsFigure.includes('AI 생성 개념 일러스트'));
assert(functionsFigure.includes('실제 메모리 구조나 실행 장치를 나타내는 그림은 아닙니다.'));
assert(readFileSync('assets/illustrations/02-1-function-workbench.webp').equals(readFileSync('docs/assets/illustrations/02-1-function-workbench.webp')));
for(const marker of ['docs.google.com','drive.google.com','비공개','검토본','CalpicoFile_','Sentinel_','[ILLUSTRATION]','/workspace/','CHECKPOINT','manifest.json']){
 assert(!functionsSource.includes(marker),`02-1 source: unexpected private marker ${marker}`);
 assert(!functionsHtml.includes(marker),`02-1 HTML: unexpected private marker ${marker}`);
}
assert(functionsSource.includes('Visual Studio의 MSVC와 C++20'));
assert(functionsSource.includes('ISO C++20 표준(/std:c++20)'));
assert(functionsSource.includes('x64 Native Tools Command Prompt'));
for(const command of ['cl /nologo /std:c++20 /EHsc /utf-8 /c ex06_missing_definition.cpp /Fomissing.obj','cl /nologo missing.obj /Femissing.exe']){
 assert(functionsSource.includes('`'+command+'`'));
 assert(functionsHtml.includes('<code>'+command+'</code>'));
}
assert(!/GCC|g\+\+|Clang|clang\+\+|UBSan/.test(functionsSource),'02-1 must retain the approved MSVC lesson baseline');
assert(functionsHtml.includes('hljs-global">cout</span>'));
assert(functionsHtml.includes('hljs-global">cin</span>'));
assert(functionsHtml.includes('hljs-local">sideLength</span>'));
assert(functionsHtml.includes('hljs-title function_">calculateCardArea</span>'));
assert(functionsHtml.includes('&lt;iostream&gt;'));
assert(!/<(?:iostream|limits)>/.test(functionsHtml));
console.log('PASS: 02-1 exact 17 C++ blocks and outputs, six exercises/answers, ten source-only downloads, original figure, privacy, MSVC baseline/commands, navigation, comments and syntax colors');

// Course policy: no strikethrough; range tildes must survive Markdown parsing.
for (const file of html) {
 const page = readFileSync(file, 'utf8');
 assert(!/<(?:del|s|strike)\b/i.test(page), `${file}: forbidden strikethrough`);
}
for (const word of ['if', 'continue', 'while', 'break']) {
 assert(consoleHtml.includes(`<code>${word}</code>`), `01-4: missing inline ${word}`);
}
assert(consoleHtml.includes('<code>quantity</code>는 1부터 9까지이고'));
assert(consoleHtml.includes('<code>amount</code>는 100부터 900까지입니다'));
assert(consoleHtml.includes('<code>!(std::cin &gt;&gt; quantity)</code>'));
assert(consoleHtml.includes('<code>std::cin.clear()</code>'));
console.log('PASS: course-wide no strikethrough, preserved numeric ranges and complete inline C++ expressions');
const numericStreamExample=renderCode({lang:'cpp',text:'std::cin.bad(); std::cin.eof(); std::cin.clear(); std::cin.ignore(std::numeric_limits<std::streamsize>::max(), 10); std::numeric_limits<int>::lowest();'});
for(const name of ['numeric_limits','streamsize'])assert(numericStreamExample.includes(`class="hljs-stl-type">${name}</span>`));
for(const name of ['bad','eof','clear','ignore','max','lowest'])assert(numericStreamExample.includes(`class="hljs-title function_">${name}</span>`));
console.log('PASS: numeric_limits/streamsize types and stream/numeric-limit function colors');
for(const file of readdirSync('content').filter(f=>f.endsWith('.md'))) {
 const source=readFileSync(path.join('content',file),'utf8');
 const prose=source.replace(/```[\s\S]*?```|`[^`]*`|https?:\/\/\S+/g,'');
 assert(!/(?<![A-Za-z_])(if|continue|break|while|std::|int|double|bool)(?![A-Za-z_])/.test(prose),`${file}: unformatted C++ prose token`);
}
console.log('PASS: all published sources format core C++ prose tokens as inline code');

// 02-2 publication: preserve every reviewed word and code/output block.
const stringsSource=readFileSync('content/string-values.md','utf8');
const stringsHtml=readFileSync('docs/lessons/string-values/index.html','utf8');
assert(publishedChapters.some(c=>c.number==='02-2'&&c.slug==='string-values'&&c.title==='문자열을 값으로 다루기'));
assert.equal([...stringsHtml.matchAll(/<h1[ >]/g)].length,1);
assert(stringsHtml.includes(commentsHtml));
assert(homeHtml.includes('/cpp-jeongseok/lessons/string-values/'));
assert(functionsHtml.includes('/cpp-jeongseok/lessons/string-values/'));
assert(stringsHtml.includes('/cpp-jeongseok/lessons/functions-basics/'));
const stringsBlocks=[...stringsSource.matchAll(/^```(cpp|text)\n([\s\S]*?)^```/gm)];
const stringsRendered=[...stringsHtml.matchAll(/<pre><code class="[^"]*language-(cpp|plaintext)[^"]*">([\s\S]*?)<\/code><\/pre>/g)];
assert.equal(stringsBlocks.length,stringsRendered.length);
for(let i=0;i<stringsBlocks.length;i++) {
 assert.equal(stringsRendered[i][1],stringsBlocks[i][1]==='cpp'?'cpp':'plaintext');
 assert.equal(decode(stringsRendered[i][2].replace(/<[^>]*>/g,'')).trimEnd(),stringsBlocks[i][2].trimEnd(),`02-2 block ${i+1} exact text`);
}
const {marked}=await import('marked');
const inlineTokens=[];
marked.walkTokens(marked.lexer(stringsSource),token=>{if(token.type==='codespan')inlineTokens.push(token.text)});
for(const token of inlineTokens) {
 const escaped=token.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 assert(stringsHtml.includes(`<code>${escaped}</code>`),`02-2 inline code: ${token}`);
}
const stringsFiles=['01_length_empty.cpp','02_concatenation.cpp','03_find_npos.cpp','04_find_boundaries.cpp','05_char_and_string.cpp','06_getline.cpp','07_number_then_line.cpp','08_bytes_and_text.cpp'];
const stringsPrograms=stringsBlocks.filter(b=>b[1]==='cpp'&&b[2].includes('int main()'));
assert.equal(stringsPrograms.length,8);
for(const dir of ['assets/examples/02-2','docs/assets/examples/02-2']) {
 assert.deepEqual(readdirSync(dir).sort(),[...stringsFiles,'README.md','02-2-string-examples.zip'].sort());
 for(const name of stringsFiles) {
  assert(stringsPrograms.some(b=>b[2]===readFileSync(`${dir}/${name}`,'utf8')),`02-2 exact downloadable ${name}`);
  assert(stringsHtml.includes(`/cpp-jeongseok/assets/examples/02-2/${name}`));
 }
 const guide=readFileSync(`${dir}/README.md`,'utf8');
 for(const term of ['Visual Studio','MSVC','/std:c++20','/utf-8','하나씩'])assert(guide.includes(term));
 assert(!guide.includes('../tests/'));
}
const stringsFigure=[...stringsHtml.matchAll(/<figure class="concept-figure">([\s\S]*?)<\/figure>/g)];
assert.equal(stringsFigure.length,1);
const stringsImage='/cpp-jeongseok/assets/illustrations/02-2-string-workbench.webp';
const stringsAlt='두 짧은 파란 띠와 하나의 긴 띠, 긴 띠의 일부를 살펴보는 청록색 돋보기';
const stringsCaption='AI로 생성한 개념 일러스트입니다. 두 문자열을 잇고 문자열 안에서 일부를 찾는 작업을 비유합니다. 실제 메모리 배치나 문자 개수를 나타내는 도표는 아닙니다.';
for(const part of [`href="${stringsImage}"`,`src="${stringsImage}"`,`alt="${stringsAlt}"`,'width="1200" height="800"','loading="lazy"','decoding="async"',`<figcaption>${stringsCaption}</figcaption>`])assert(stringsFigure[0][1].includes(part));
assert(readFileSync('assets/illustrations/02-2-string-workbench.webp').equals(readFileSync('docs/assets/illustrations/02-2-string-workbench.webp')));
for(const marker of ['docs.google.com','drive.google.com','비공개','검토본','CalpicoFile_','Sentinel_','/workspace/','CHECKPOINT','MANIFEST','GCC_REPORT','lesson-02-2-private']) {
 for(const text of [stringsSource,stringsHtml,readFileSync('assets/examples/02-2/README.md','utf8')])assert(!text.includes(marker),`02-2 private marker ${marker}`);
}
for(const part of ['hljs-stl-type">string</span>','hljs-global">cout</span>','hljs-global">cin</span>','hljs-title function_">find</span>','hljs-title function_">getline</span>'])assert(stringsHtml.includes(part));
assert(!/<(?:iostream|string|limits)>/.test(stringsHtml));
// Normalize only the presentation additions, then lock the complete reviewed body.
const restoredStrings='# 02-2 문자열을 값으로 다루기\n\n'+stringsSource
 .replace(/<figure class="concept-figure">[\s\S]*?<\/figure>/,`![${stringsAlt}](assets/string-workbench.webp)\n\n*${stringsCaption}*`)
 .replace(/## 예제 파일 받기\n[\s\S]*?(?=## 참고 자료)/,'');
const {createHash}=await import('node:crypto');
assert.equal(createHash('sha256').update(restoredStrings).digest('hex'),'c2df65f8de163f05899e5ce75acf644d1eb27d89230200d4f22bab72c108763c','02-2 full reviewed body preservation');
const {execFileSync}=await import('node:child_process');
execFileSync('python3',['-c',`import zipfile, pathlib
p=pathlib.Path('assets/examples/02-2')
with zipfile.ZipFile(p/'02-2-string-examples.zip') as z:
 expected=sorted('02-2-string-examples/'+f.name for f in p.iterdir() if f.suffix in ['.cpp','.md'])
 assert sorted(z.namelist()) == expected
 for name in z.namelist(): assert z.read(name) == (p/pathlib.Path(name).name).read_bytes()
assert (p/'02-2-string-examples.zip').read_bytes() == pathlib.Path('docs/assets/examples/02-2/02-2-string-examples.zip').read_bytes()
`]);
console.log(`PASS: 02-2 full reviewed body, ${stringsBlocks.length} exact blocks, ${inlineTokens.length} inline code spans, eight exact sources, source-only ZIP, MSVC guide, caption/alt, privacy, navigation, comments and existing colors`);

const containersHtml=readFileSync('docs/lessons/vector-array/index.html','utf8');
assert(publishedChapters.some(c=>c.number==='02-3'&&c.slug==='vector-array'));
assert(homeHtml.includes('/cpp-jeongseok/lessons/vector-array/'));
assert(stringsHtml.includes('/cpp-jeongseok/lessons/vector-array/'));
assert(containersHtml.includes('<code>auto</code>를 쓰기 전에 알아둘 기본 규칙'));
assert(containersHtml.includes('initializer_list&lt;int&gt;'));
assert(containersHtml.includes('02-3-array-vector.webp'));
assert(containersHtml.includes('08_auto_rules.cpp'));

// Regression: highlight.js uses built_in for casts, type for size_t and a
// function/params container for parenthesized vector initialization.
const castWords=['static_cast','dynamic_cast','const_cast','reinterpret_cast'];
const colorSamples=[
 ...castWords.map(word=>`${word}<int>(value);`),
 'std::size_t index = 0;',
 'std :: size_t index = 0;',
 'std::vector<int> b(4);\nstd::vector<int> c(2, 9);',
 'std::vector<int> a{4};\nstd::vector<std::vector<int>> rows(2);',
 'void inspect(std::size_t count, std::vector<int> values);',
 'void inspect(int count = static_cast<int>(4));',
 'std::cout << std::endl; std::endl(std::cout);',
 '// static_cast std::size_t std::vector<int>\n/* dynamic_cast std::vector */',
 '"static_cast std::size_t std::vector<int>"; R"note(const_cast std::vector<int>)note";',
 '#include <vector>\n#define CAST_TEXT "static_cast std::size_t"'
];
const colorHtml=colorSamples.map(text=>renderCode({lang:'cpp',text}));
for(let i=0;i<colorSamples.length;i++) {
 const body=colorHtml[i].match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/)[1];
 assert.equal(decode(body.replace(/<[^>]*>/g,'')).trimEnd(),colorSamples[i].trimEnd(),'Color normalization must preserve source');
}
for(let i=0;i<castWords.length;i++)assert(colorHtml[i].includes(`<span class="hljs-keyword">${castWords[i]}</span>`));
for(const i of [4,5,8])assert(colorHtml[i].includes('<span class="hljs-stl-type">size_t</span>'));
for(const i of [6,7])assert.equal((colorHtml[i].match(/class="hljs-stl-type">vector<\/span>/g)||[]).length,i===6?2:3);
assert(colorHtml[8].includes('<span class="hljs-stl-type">vector</span>'));
assert(colorHtml[9].includes('<span class="hljs-keyword">static_cast</span>'));
assert(colorHtml[6].includes('<span class="hljs-namespace">std</span>::'));
assert(colorHtml[6].includes('<span class="hljs-type">int</span>'));
assert(colorHtml[10].includes('<span class="hljs-global">cout</span>'));
assert.equal((colorHtml[10].match(/class="hljs-title function_">endl<\/span>/g)||[]).length,2);
for(const i of [11,12,13])assert(!/hljs-(?:stl-type|namespace|local)/.test(colorHtml[i]),'Never decorate literals, comments or preprocessor text');
for(const page of [calculationHtml,containersHtml])assert(page.includes('<span class="hljs-keyword">static_cast</span>'));
assert(containersHtml.includes('<span class="hljs-stl-type">size_t</span>'));
for(const code of ['std::vector<int> b(4);','std::vector<int> c(2, 9);'])assert(containersHtml.includes(renderCode({lang:'cpp',text:code}).match(/<code[^>]*>([\s\S]*?)<\/code>/)[1].trimEnd()));
const syntaxCss=readFileSync('docs/assets/style.css','utf8');
assert(syntaxCss.includes('.prose pre .hljs-keyword,.prose pre .hljs-type{color:#569cd6}'));
assert(syntaxCss.includes('.prose pre .hljs-stl-type,.prose pre .hljs-built_in,.prose pre .hljs-title.class_{color:#4ec9b0}'));
console.log('PASS: four cast keywords blue, qualified size_t/vector green across nested code containers, primitive/namespace/stream colors and protected literals preserved');

// User-defined roles use declarations, never lesson-specific identifier lists.
const roleContext=`enum class phase { queued = 0, active, done };
struct packet { std::string label; phase state = phase::queued; int total = 0; };
int main() { packet item{}; int total = 2; item.total = total;
auto pointer = &item; pointer->state = phase::active; }`;
const roleRendered=renderCode({text:roleContext,lang:'cpp'},roleContext);
for(const name of ['phase','packet'])assert(roleRendered.includes(`class="hljs-user-type">${name}</span>`));
for(const name of ['queued','active','done'])assert(roleRendered.includes(`class="hljs-enumerator">${name}</span>`));
for(const name of ['label','state','total'])assert(roleRendered.includes(`class="hljs-member">${name}</span>`));
assert(roleRendered.includes('class="hljs-local">total</span>'));
assert(roleRendered.includes('class="hljs-local">item</span>'));
assert(roleRendered.includes('class="hljs-local">pointer</span>'));
assert(roleRendered.includes('class="hljs-user-type">phase</span><span class="hljs-scope">::</span><span class="hljs-enumerator">active</span>'));
const roleFragment='packet copy = item;\ncopy.state = phase::done;';
const fragmentRendered=renderCode({text:roleFragment,lang:'cpp'},roleContext);
assert(fragmentRendered.includes('class="hljs-user-type">packet</span>'));
assert(fragmentRendered.includes('class="hljs-member">state</span>'));
assert(fragmentRendered.includes('class="hljs-enumerator">done</span>'));
const roleProtected='// struct invented {}; enum class fake { broken };\n"packet phase::done"; R"tag(struct bogus {}; phase::active)tag";';
assert(!/hljs-(?:user-type|member|enumerator)/.test(renderCode({text:roleProtected,lang:'cpp'},roleContext)));
for(const text of [roleContext,roleFragment,roleProtected]) {
 const output=renderCode({text,lang:'cpp'},roleContext).match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/)[1];
 assert.equal(decode(output.replace(/<[^>]*>/g,'')).trimEnd(),text.trimEnd());
}
const structsHtml=readFileSync('docs/lessons/struct-enum/index.html','utf8');
assert(structsHtml.includes('class="hljs-user-type">Task</span>'));
assert(structsHtml.includes('class="hljs-user-type">TaskState</span><span class="hljs-scope">::</span><span class="hljs-enumerator">Todo</span>'));
assert(structsHtml.includes('class="hljs-member">plannedMinutes</span>'));
assert(!structsHtml.includes('class="hljs-local">Task</span>'));
assert(!structsHtml.includes('class="hljs-local">TaskState</span>'));
assert(!/&<span/.test(structsHtml),'Never insert token markup inside an HTML entity');
for(const [kind,color] of [['user-type','4ec9b0'],['member','dadada'],['enumerator','b5cea8'],['scope','b4b4b4']]) {
 assert(syntaxCss.includes(`.prose pre .hljs-${kind}{color:#${color}}`));
 assert((luminance(color)+.05)/(luminance('1e1e1e')+.05)>=4.5);
}
console.log('PASS: generic declared types, field/local distinction, dot/arrow access, enum declarations/qualification, isolated lesson context, protected text and exact whitespace');
