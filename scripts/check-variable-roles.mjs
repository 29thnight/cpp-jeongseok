import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {highlightCpp} from './highlight.mjs';
const cases=[
 ['int f(const int &value) {return value;}','value',['parameter','parameter']],
 ['int main(){int count(3);return count;}','count',['local','local']],
 ['struct X{int value; int f(){if(int value=3;value>0){return value;}return value;}}','value',['member','local','local','local','member']],
 ['struct X{int value;int f(){auto fn=[this](int value){return value;};return fn(value);}}','value',['member','parameter','parameter','member']],
 ['struct X { int first, second; X() : first{1}, second{first} {} };','second',['member','member']],
 ['int f(int value){for(int value=0;value<2;++value){} return value;}','value',['parameter','local','local','local','parameter']],
 ['struct X { int f(int &&amount)&& { return amount; } };','amount',['parameter','parameter']],
 ['struct X { int value; void f(int value){this->value=value;} };','value',['member','parameter','member','parameter']],
 ['class MarkerPair { int first_; int second_; public: MarkerPair() : first_{7}, second_{first_ + 1} { first_ += second_; } };', 'first_', ['member','member','member','member']],
 ['class MarkerPair { int first_; int second_; public: MarkerPair() : first_{7}, second_{first_ + 1} { first_ += second_; } };', 'second_', ['member','member','member']],
 ['struct X { int value; X(int value) : value{value} { this->value=value; } };','value',['member','parameter','member','parameter','member','parameter']],
 ['struct X { int value; int f(int amount) { value += amount; { int value=amount; value++; } return value; } };','value',['member','member','local','local','member']],
 ['struct X { int value; int f(int amount) { value += amount; { int value=amount; value++; } return value; } };','amount',['parameter','parameter','parameter']],
 ['int twice(int value) { return value+value; } int other() { int value=4; return value; }','value',['parameter','parameter','parameter','local','local']],
 ['struct X { int f() { return value; } int value{3}; };','value',['member','member']],
 ['struct X { int value; int f() const; }; int X::f() const { return value; }','value',['member','member']],
 ['struct X { int value; X(int value) : value(value) {} };','value',['member','parameter','member','parameter']],
 ['struct X { int value; int f(int value) { { int value=7; value++; } return value; } };','value',['member','parameter','local','local','parameter']],
 ['int value=1; struct X { int value; int f(int value) { return value; } };','value',['local','member','parameter','parameter']],
 ['struct X { int value; }; struct Y { int value; int f() { return value; } };','value',['member','member','member']],
 ['void f(int value); void g(int value) { value++; }','value',['parameter','parameter','parameter']],
];
const decode=s=>s.replace(/<[^>]*>/g,'').replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
for(const [source,name,expected] of cases){
 const html=highlightCpp(source);
 assert.deepEqual([...html.matchAll(new RegExp(`class="hljs-([^"]+)">${name}</span>`, 'g'))].map(m=>m[1]),expected,source);
 assert.equal(decode(html),source);
}
const fixture=readFileSync('tests/highlight/member-parameters.cpp','utf8');
assert.equal(decode(highlightCpp(fixture)),fixture);
const css=readFileSync('docs/assets/style.css','utf8');
assert(css.includes('.prose pre .hljs-parameter{color:#9a9a9a}'));
assert(css.includes('.prose pre .hljs-member{color:#dadada}'));
console.log(`PASS: ${cases.length} positional member/parameter/local cases, constructor braces, shadowing, out-of-line method, exact source and theme colors`);
