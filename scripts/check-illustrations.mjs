import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Lock every byte outside illustration figures, including all examples and lesson prose.
// Two explicitly authorized illustration-dependent sentences are excluded as well.
// All other prose, examples, headings, and curriculum data remain byte-locked.
function unchangedBody(file, text) {
  text=text.replace(/<figure class="concept-figure">[\s\S]*?<\/figure>/g,'[LESSON_FIGURE]');
  if(file==='content/string-values.md') text=text.replace(/^그림 설명: [^\n]+$/m,'[ILLUSTRATION_DESCRIPTION]');
  if(file==='content/class-constructors.md') text=text.replace(/^그림(?:의 완성 표시| 속 음량 조절기)[^\n]+$/m,'[ILLUSTRATION_DESCRIPTION]');
  return text;
}
const hashes=JSON.parse(readFileSync('tests/fixtures/illustration-body-hashes.json','utf8'));
for(const [file,expected] of Object.entries(hashes)) {
  const text=unchangedBody(file,readFileSync(file,'utf8'));
  assert.equal(createHash('sha256').update(text).digest('hex'),expected,`${file}: non-figure content changed`);
}
function webpDimensions(bytes) {
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  const kind=bytes.toString('ascii',12,16);
  if(kind==='VP8X') return [1+bytes.readUIntLE(24,3),1+bytes.readUIntLE(27,3)];
  if(kind==='VP8 ') return [bytes.readUInt16LE(26)&0x3fff,bytes.readUInt16LE(28)&0x3fff];
  if(kind==='VP8L') {
    assert.equal(bytes[20],0x2f);
    const bits=bytes.readUInt32LE(21);
    return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1];
  }
  assert.fail(`Unsupported WebP header ${kind}`);
}
let count=0;const seen=new Set();
for(const slug of readdirSync('docs/lessons')) {
  const html=readFileSync(`docs/lessons/${slug}/index.html`,'utf8');
  const figures=[...html.matchAll(/<figure class="concept-figure">([\s\S]*?)<\/figure>/g)];
  assert.equal(figures.length,slug==='introduction'?0:slug==='ai-era-cpp'?2:1,`${slug}: figure count`);
  for(const [,figure] of figures) {
    count++;
    const src=figure.match(/<img[^>]* src="([^"]+)"/)?.[1];
    assert(src?.startsWith('/cpp-jeongseok/assets/illustrations/'),`${slug}: local image`);
    assert(!seen.has(src),`${slug}: unique lesson illustration`);seen.add(src);
    const local=src.slice('/cpp-jeongseok/'.length).split('?')[0];
    const bytes=readFileSync(local);
    assert.equal(src.split('?v=')[1],createHash('sha256').update(bytes).digest('hex').slice(0,12),`${slug}: content-hashed cache busting`);
    assert(/<figcaption>[\s\S]*<\/figcaption>\s*$/.test(figure),`${slug}: figcaption last child`);
    assert.equal((figure.match(/class="figure-example"/g)||[]).length,1,`${slug}: one readable example panel`);
    assert(bytes.equals(readFileSync(`docs/${local}`)),`${slug}: copied asset bytes`);
    const width=Number(figure.match(/width="(\d+)"/)?.[1]);
    const height=Number(figure.match(/height="(\d+)"/)?.[1]);
    assert.deepEqual([width,height],webpDimensions(bytes),`${slug}: intrinsic pixel dimensions`);
    assert(figure.includes(`href="${src}"`),`${slug}: full-size link`);
    assert(figure.includes('loading="lazy"')&&figure.includes('decoding="async"'));
    assert(/alt="[^"]{20,}"/.test(figure),`${slug}: meaningful alt`);
    assert(/<figcaption>[\s\S]*AI(?:로)?\s*생성/.test(figure),`${slug}: AI provenance caption`);
    assert(!/drive\.google|docs\.google|\/workspace\/|manifest\.json|batch-[abc]/.test(figure),`${slug}: no private provenance`);
  }
}
assert.equal(count,14);
assert.deepEqual([...seen].map(s=>s.split('/').pop().split('?')[0]).sort(),readdirSync('assets/illustrations').sort(),'Only published web assets belong in public illustrations');
console.log('PASS: 14 accessible figures, real WebP dimensions, exact copied assets, AI captions, full-size links, private-marker exclusion and unchanged non-figure prose/curriculum');
