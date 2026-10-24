import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {marked} from 'marked';
import {withLessonCallouts,calloutKind,preserveSolutionAnchors} from './lesson-callouts.mjs';

const opening=/<section class="lesson-callout lesson-callout--(?:exercise|solution)" aria-label="(?:연습문제|해설)">\n<div class="lesson-callout-label" aria-hidden="true">(?:연습문제|해설)<\/div>\n/g;
const disclosureOpening='<details class="solution-disclosure">\n<summary><span class="solution-show">해설 보기</span><span class="solution-hide">해설 접기</span></summary>\n<div class="solution-content">\n';
const stripDisclosure=html=>html.replaceAll(disclosureOpening,'').replaceAll('</div>\n</details>\n','');
const unwrap=html=>stripDisclosure(html).replace(opening,'').replace(/<\/section>\n/g,'');
let lessons=0,codeBlocks=0;
for (const file of readdirSync('content').filter(f=>f.endsWith('.md'))) {
  const source=readFileSync(`content/${file}`,'utf8');
  const tokens=marked.lexer(source);
  const wrapped=withLessonCallouts(tokens);
  // No original token may be removed, changed, reordered or duplicated.
  assert.deepEqual(wrapped.filter(t=>tokens.includes(t)),[...tokens],file);
  const plain=marked.parser(tokens), rendered=marked.parser(wrapped);
  assert.equal(unwrap(rendered),plain,`${file}: complete rendered content preserved`);
  const expected=file==='introduction.md' ? [] : ['exercise','solution'];
  const blocks=[...rendered.matchAll(/<section class="lesson-callout lesson-callout--(exercise|solution)"[^>]*>\n<div[^>]*>[^<]*<\/div>\n([\s\S]*?)<\/section>\n/g)];
  assert.deepEqual(blocks.map(b=>b[1]),expected,`${file}: distinct complete callouts`);
  for (const [,kind,body] of blocks) {
    // The complete H2 section (and all H3 headings/code/lists) must be inside.
    const start=tokens.findIndex(t=>t.type==='heading' && t.depth===2 && calloutKind(t.text)===kind);
    let end=start+1;
    while(end<tokens.length && !(tokens[end].type==='heading' && tokens[end].depth<=2))end++;
    const section=tokens.slice(start,end); section.links=tokens.links;
    assert.equal(stripDisclosure(body),marked.parser(section),`${file}: ${kind} ends at next peer heading`);
  }
  const page=readFileSync(`docs/lessons/${file.slice(0,-3)}/index.html`,'utf8');
  assert.deepEqual([...page.matchAll(/class="lesson-callout lesson-callout--(exercise|solution)"/g)].map(m=>m[1]),expected,`${file}: built page`);
  const disclosures=[...page.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/g)];
  assert.equal(disclosures.length,expected.length ? 1 : 0);
  for(const [,attrs,body] of disclosures) {
    assert.equal(attrs,' class="solution-disclosure"','No open attribute at initial render');
    assert(body.startsWith('\n<summary>'));
    assert(!/<details\b/.test(body),'No nested disclosure');
    assert(!/ id="/.test(body),'No hidden anchor that could auto-open answers');
    assert(body.includes('<span class="solution-show">해설 보기</span>'));
    assert(body.includes('<span class="solution-hide">해설 접기</span>'));
  }
  assert.equal((page.match(/class="lesson-callout lesson-callout--exercise"/g)||[]).length,expected.length ? 1 : 0);
  codeBlocks+=tokens.filter(t=>t.type==='code').length;
  lessons++;
}

// Future lessons: references, nested lists, code containing headings, end of file,
// and back-to-back callouts retain the exact original Markdown rendering.
const fixture='## 연습문제\n\n문장 [참고][ref]\n\n- 항목\n  - 하위 항목\n\n### 문제 1\n\n```cpp\n// ## 해설\nint n = 1;\n```\n\n## 연습문제 상세 해설\n\n설명\n\n```text\n결과\n```\n\n[ref]: https://example.com\n';
const fixtureTokens=marked.lexer(fixture);
assert.equal(unwrap(marked.parser(withLessonCallouts(fixtureTokens))),marked.parser(fixtureTokens));
assert.equal((marked.parser(withLessonCallouts(fixtureTokens)).match(/<section /g)||[]).length,2);
const noExercises=marked.lexer('## 일반 설명\n\n해설이라는 단어만 쓴 문장\n\n### 연습문제\n\n짧은 실습\n');
assert.equal(marked.parser(withLessonCallouts(noExercises)),marked.parser(noExercises));
for(const title of ['7 연습문제 해설','연습문제 상세 해설','10. 정답과 풀이','해설과 확인'])assert.equal(calloutKind(title),'solution');
for(const title of ['8. 직접 풀어보기','10. 직접 풀어 보세요','9 직접 확인할 문제','11 스스로 확인하는 다섯 문제','연습'])assert.equal(calloutKind(title),'exercise');
console.log(`PASS: ${lessons} lessons, 26 complete callouts, ${codeBlocks} code blocks and all original content preserved; future lesson boundaries/references`);

const boundaryTokens=marked.lexer('## 연습문제\n\n문제\n\n### 작은 제목\n\n목록\n\n## 정리\n\n콜아웃 밖\n\n## 해설\n\n답\n\n# 다른 장\n\n밖\n');
const boundaries=marked.parser(withLessonCallouts(boundaryTokens));
assert.match(boundaries, /<\/section>\n<h2>정리<\/h2>/);
assert.match(boundaries, /<\/section>\n<h1>다른 장<\/h1>/);
const css=readFileSync('assets/style.css','utf8');
assert.equal(css,readFileSync('docs/assets/style.css','utf8'));
const luminance=color=>color.match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
for(const [foreground,background] of [['513582','e9e0f8'],['205c4e','daeee6'],['242428','f7f4fd'],['242428','f1f8f5']]) {
  assert(css.includes('#'+foreground) && css.includes('#'+background));
  assert((luminance(background)+.05)/(luminance(foreground)+.05)>=4.5);
}
console.log('PASS: H1/H2 boundaries, matching generated styles, callout body/label contrast >= 4.5:1');

const fragmentFixture='<h2 id="section-1">해설</h2><details class="solution-disclosure">\n<summary>해설 보기</summary><div class="solution-content"><h3 id="section-2">답 1</h3><p>답</p><h4 id="section-3">이유</h4></div></details>';
const protectedFragments=preserveSolutionAnchors(fragmentFixture);
assert(protectedFragments.indexOf('id="section-2"')<protectedFragments.indexOf('<details'));
assert(protectedFragments.indexOf('id="section-3"')<protectedFragments.indexOf('<details'));
assert(protectedFragments.includes('<h3>답 1</h3>'));
assert(protectedFragments.includes('<h4>이유</h4>'));
assert(css.includes('.solution-disclosure:not([open])>.solution-content{display:none!important}'));
assert(css.includes('.solution-disclosure>summary:focus-visible'));
assert(css.includes('.solution-disclosure[open]>summary .solution-hide{display:inline}'));
assert.equal(codeBlocks,184);
console.log('PASS: all 13 solutions closed in HTML; native summary controls, hidden body/print rules, preserved safe fragment targets, no nested details');
