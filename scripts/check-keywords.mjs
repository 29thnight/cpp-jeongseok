import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {highlightCpp} from './highlight.mjs';
import {cpp20Keywords, contextualIdentifiers} from './cpp-keywords.mjs';
const textOnly = html => html.replace(/<[^>]*>/g,'').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const render = source => {const html=highlightCpp(source);assert.equal(textOnly(html),source);return html;};
assert.equal(cpp20Keywords.size,92,'N4861: 81 keywords + 11 alternative tokens');
for(const word of cpp20Keywords) {
  // Deliberately adversarial lexical fixtures, not compilable C++ examples.
  for(const source of [word, `${word} Candidate(int value);`, `struct Record { ${word} Candidate; };`]) {
    const html=render(source);
    assert(!html.includes(`class="hljs-user-type">${word}</span>`),`Keyword inferred as type: ${word}`);
    assert(!html.includes(`class="hljs-local">${word}</span>`),`Keyword inferred as local: ${word}`);
    assert(!html.includes(`class="hljs-member">${word}</span>`),`Keyword inferred as member: ${word}`);
    assert(new RegExp(`<span class="hljs-(?:keyword|control|type|literal)">${word}</span>`).test(html),`Missing protected keyword: ${word}`);
  }
}
const realistic=[
 'class Volume { public: explicit Volume(int value) : value_{value} {} private: int value_; };',
 'class Ticket { public: explicit Ticket(int price); };',
 'struct Flag { explicit(true) Flag(int); explicit(false) operator bool() const noexcept; };',
 'struct Box { constexpr Box() noexcept = default; virtual ~Box() = default; };',
 'consteval int answer() { return 42; }\nconstinit int value = answer();',
 'template<class T> concept Sized = requires(T value) { sizeof(value); };',
 'static_assert(alignof(int) > 0); thread_local int counter = 0; volatile int status = 0;',
 'bool value = true and not false; auto pointer = nullptr;'
];
for(const source of realistic) render(source);
for(const source of realistic.slice(0,3)) assert(render(source).includes('class="hljs-keyword">explicit</span>'));
for(const word of contextualIdentifiers) {
 assert(!cpp20Keywords.has(word));
 const html=render(`int ${word} = 1; int value = ${word};`);
 const block=render(`void use() { int ${word} = 1; ${word}; }`);
 assert(!block.includes(`class="hljs-keyword">${word}</span>`),`Identifier expression in block: ${word}`);
 assert.equal((html.match(new RegExp(`class="hljs-local">${word}</span>`,'g'))||[]).length,2,`Legal identifier: ${word}`);
 assert(!html.includes(`class="hljs-keyword">${word}</span>`));
}
for(const source of ['class Task final {};','struct D { void f() const noexcept override final; };','struct D { void f() final override; };','export module example;\nimport example;','module;\nmodule sample:part;']) {
 const html=render(source);
 for(const word of source.match(/\b(?:final|override|module|import)\b/g)||[]) assert(html.includes(`class="hljs-keyword">${word}</span>`),`Contextual keyword: ${source}`);
}
for(const source of ['// explicit Candidate; final override import module\n','"explicit Candidate; final override import module"','R"x(explicit Candidate; final override import module)x"','#define TEXT explicit Candidate']) {
 const html=render(source);assert(!/hljs-(?:user-type|local|member)/.test(html));
}
const lesson=readFileSync('docs/lessons/class-constructors/index.html','utf8');
assert.equal((lesson.match(/class="hljs-keyword">explicit<\/span>/g)||[]).length,2);
assert(!/class="hljs-(?:user-type|local|member)">explicit<\/span>/.test(lesson));

const noexceptIdentifier=render('constexpr bool final = true; struct B { virtual void f() noexcept(final); }; struct D : B { void f() noexcept(final) override; };');
assert(!noexceptIdentifier.includes('class="hljs-keyword">final</span>'));
assert(noexceptIdentifier.includes('class="hljs-keyword">override</span>'));
for(const word of ['module','import']) {
 const type=render(`struct ${word} {}; ${word} value;`);
 assert(!type.includes(`class="hljs-keyword">${word}</span>`));
 assert.equal((type.match(new RegExp(`class="hljs-user-type">${word}</span>`,'g'))||[]).length,2);
}
console.log('PASS: all 92 C++20 reserved spellings in 276 lexical fixtures; explicit/explicit(bool), contextual identifiers, protected text, exact source preservation and both published constructors');
