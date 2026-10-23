import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('cpp', cpp);

const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const castKeywords = new Set(['static_cast', 'dynamic_cast', 'const_cast', 'reinterpret_cast']);
// Function/parameter spans are structural containers, not protected tokens.
const codeContainers = new Set(['<span class="hljs-function">', '<span class="hljs-params">']);
const standardTypes = new Set(['vector', 'string', 'string_view', 'array', 'span', 'optional', 'variant', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'map', 'set', 'unordered_map', 'unordered_set', 'pair', 'tuple', 'size_t', 'numeric_limits', 'streamsize']);

// Qualified standard streams are namespace-scope objects, not local variables.
const standardStreams = new Set(['cin', 'cout', 'cerr', 'clog', 'wcin', 'wcout', 'wcerr', 'wclog']);
// These functions may be passed to operator<< / operator>> without parentheses.
const streamManipulators = new Set([
  'endl', 'ends', 'flush', 'ws', 'boolalpha', 'noboolalpha', 'showbase', 'noshowbase',
  'showpoint', 'noshowpoint', 'showpos', 'noshowpos', 'skipws', 'noskipws', 'uppercase',
  'nouppercase', 'unitbuf', 'nounitbuf', 'internal', 'left', 'right', 'dec', 'hex', 'oct',
  'fixed', 'scientific', 'hexfloat', 'defaultfloat'
]);
const qualifiedStandard = prefix => /\bstd\s*::\s*$/.test(prefix);
const standardTokenClass = word => standardStreams.has(word) ? 'hljs-global'
  : streamManipulators.has(word) ? 'hljs-title function_' : null;

// Lexical supplementation, not compiler/IntelliSense semantic analysis.
// Find simple declarations (including nested template types and range-for).
// Ignore comments and literals so they cannot invent variable names.
function declaredNames(source) {
  const clean = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, ' ');
  const names = new Set();
  const declaration = /\b(?:const\s+)?(?:auto|int|float|double|bool|char|(?:std::)?[A-Za-z_]\w*(?:<[^;{}=]+>)?)(?:\s*[*&])?\s+([A-Za-z_]\w*)\s*(?=[{=;,:])/g;
  for (const match of clean.matchAll(declaration)) names.add(match[1]);
  return names;
}

// Position-based supplementation for the simple declarations used in lessons.
// Keep roles separate: a field name can also be a local name in another scope.
function declarationRoles(source) {
  const clean = source.replace(/R"([^ ()\\\t\r\n]{0,16})\([\s\S]*?\)\1"|\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|^\s*#[^\n]*/gm,
    text => text.replace(/[^\n]/g, ' '));
  const tokens = [...clean.matchAll(/[A-Za-z_]\w*|::|->|[^\s]/g)].map(m => ({word:m[0],start:m.index}));
  const roles = new Map(), types = new Set(), enums = new Set(), bodyKinds = new Map();
  const reserved = new Set(['struct','class','enum','return','if','else','for','while','switch','case','const','auto','void','int','float','double','bool','char','long','short','unsigned','signed','static','using','namespace','typename','template','throw','new','delete']);
  for (let i=0;i<tokens.length;i++) {
    const t=tokens[i];
    if (['struct','class','enum'].includes(t.word)) {
      const isEnum=t.word==='enum';
      let n=i+1;
      if (isEnum && ['class','struct'].includes(tokens[n]?.word)) n++;
      const name=tokens[n]?.word;
      if (!name || reserved.has(name) || !/^[A-Za-z_]\w*$/.test(name)) continue;
      types.add(name); if(isEnum) enums.add(name);
      let j=n+1;while(j<tokens.length&&!['{',';'].includes(tokens[j].word))j++;
      if(tokens[j]?.word==='{')bodyKinds.set(j,isEnum?'enum':'record');
      if(isEnum && n>i+1)i=n;
    }
  }
  // Infer a type in a standalone fragment from its declaration syntax, without
  // assuming a particular spelling or capitalization convention.
  const declarations=[];
  const valueNames=new Set([...clean.matchAll(/\b(?:auto|int|float|double|bool|char|long|short)\s*[*&]*\s+([A-Za-z_]\w*)/g)].map(m=>m[1]));
  for(const m of clean.matchAll(/\b([A-Za-z_]\w*)(?:\s*<[^;{}=]+>)?(?:\s*[*&])?\s+([A-Za-z_]\w*)\s*(?=[{=;,:)(])/g)) {
    if(reserved.has(m[1]) && !['auto','int','float','double','bool','char','long','short','unsigned','signed'].includes(m[1]))continue;
    if(reserved.has(m[2]))continue;
    if(!reserved.has(m[1]) && m[1]!=='std' && !standardTypes.has(m[1]) && !valueNames.has(m[1]))types.add(m[1]);
    declarations.push({start:m.index+m[0].lastIndexOf(m[2]),name:m[2]});
  }
  const declarationAt=new Map(declarations.map(d=>[d.start,d]));
  const scopes=[];let enumNext=false;
  for(let i=0;i<tokens.length;i++) {
    const t=tokens[i],prev=tokens[i-1]?.word,next=tokens[i+1]?.word;
    if(t.word==='{'){const kind=bodyKinds.get(i)||'block';scopes.push(kind);enumNext=kind==='enum';continue;}
    if(t.word==='}'){scopes.pop();enumNext=false;continue;}
    if(t.word==='::' && types.has(prev)){roles.set(t.start,'hljs-scope');continue;}
    if(scopes.at(-1)==='enum') {
      if(t.word===','){enumNext=true;continue;}
      if(enumNext && /^[A-Za-z_]\w*$/.test(t.word)){roles.set(t.start,'hljs-enumerator');enumNext=false;continue;}
    }
    if(!/^[A-Za-z_]\w*$/.test(t.word)||reserved.has(t.word))continue;
    if(['.','->'].includes(prev)){if(next!=='(')roles.set(t.start,'hljs-member');continue;}
    if(prev==='::' && enums.has(tokens[i-2]?.word)) {
      roles.set(t.start,'hljs-enumerator');continue;
    }
    if(types.has(t.word)){roles.set(t.start,'hljs-user-type');continue;}
    if(declarationAt.has(t.start)&&scopes.at(-1)==='record'&&next!=='(')roles.set(t.start,'hljs-member');
  }
  return {roles,types};
}

const unescapeHtml = text => text.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');

export function highlightCpp(source, context = '') {
  const variables = declaredNames(source);
  const {roles} = declarationRoles(source+'\n'+context);
  const html = hljs.highlight(source, { language: 'cpp', ignoreIllegals: true }).value
    .replace(/<span class="hljs-keyword">(if|else|for|while|do|switch|case|default|break|continue|return|throw|try|catch|co_return|co_yield|co_await)<\/span>/g, '<span class="hljs-control">$1</span>');
  // Decorate plain text in code containers and normalize known token categories.
  // Strings, comments, preprocessor text and their nested spans remain untouched.
  // Never change the source text or whitespace.
  const stack = [];
  let precedingText = '';
  let sourceOffset = 0;
  const parts = html.split(/(<[^>]+>)/g);
  return parts.map((part, index) => {
    if (part.startsWith('</')) { stack.pop(); return part; }
    const inCode = stack.every(open => codeContainers.has(open));
    if (part.startsWith('<')) {
      const word = parts[index + 1];
      // highlight.js calls named casts built-ins and size_t a primitive type.
      // Both need a narrower category to match the MSVC-style palette.
      if (inCode && parts[index + 2] === '</span>') {
        if (roles.has(sourceOffset) && /^[A-Za-z_]\w*$/.test(word)) {
          part = `<span class="${roles.get(sourceOffset)}">`;
        } else if (part === '<span class="hljs-built_in">' && castKeywords.has(word)) {
          part = '<span class="hljs-keyword">';
        } else if ((part === '<span class="hljs-type">' || part === '<span class="hljs-built_in">')
            && qualifiedStandard(precedingText) && standardTypes.has(word)) {
          part = '<span class="hljs-stl-type">';
        }
      }
      // highlight.js marks explicit endl(...) calls as built-ins. Apply the
      // same function category as endl passed without parentheses, but never
      // touch nested string/comment spans or unrelated built-ins.
      if (inCode && part === '<span class="hljs-built_in">'
          && qualifiedStandard(precedingText)) {
        const category = standardTokenClass(parts[index + 1]);
        if (category) part = `<span class="${category}">`;
      }
      // A built-in token followed by '(' is a call, including stream members
      // and numeric_limits<T>::max(). Keep protected strings/comments intact.
      if (inCode && part === '<span class="hljs-built_in">'
          && /^[A-Za-z_]\w*$/.test(parts[index + 1] || '')
          && parts[index + 2] === '</span>' && /^\s*\(/.test(parts[index + 3] || '')) {
        part = '<span class="hljs-title function_">';
      }
      stack.push(part);
      return part;
    }
    const prefix = precedingText;
    precedingText += part;
    const partOffset = sourceOffset;
    sourceOffset += unescapeHtml(part).length;
    if (!inCode) return part;
    return part.replace(/&(?:amp|lt|gt|quot|#x27|#39);|::|\b[A-Za-z_]\w*\b/g, (word, offset, text) => {
      if(word.startsWith('&'))return word;
      const role=roles.get(partOffset+unescapeHtml(text.slice(0,offset)).length);
      if(role)return `<span class="${role}">${word}</span>`;
      if (word === 'std' && /^\s*::/.test(text.slice(offset + word.length))) return `<span class="hljs-namespace">${word}</span>`;
      if (qualifiedStandard(prefix + text.slice(0, offset))) {
        const category = standardTokenClass(word);
        if (category) return `<span class="${category}">${word}</span>`;
        if (standardTypes.has(word)) return `<span class="hljs-stl-type">${word}</span>`;
      }
      if (variables.has(word)) return `<span class="hljs-local">${word}</span>`;
      return word;
    });
  }).join('');
}

// Highlight during generation: no browser bundle, network request, or JS needed.
export function renderCode({ text, lang }, context = '') {
  const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();
  const isCpp = ['cpp', 'c++', 'cc', 'cxx', 'hpp', 'h++'].includes(language);
  const body = isCpp ? highlightCpp(text, context) : escapeHtml(text);
  return `<pre><code class="${isCpp ? 'language-cpp hljs' : 'language-plaintext'}">${body}\n</code></pre>\n`;
}
