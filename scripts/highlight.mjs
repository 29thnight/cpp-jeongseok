import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('cpp', cpp);

const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
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

export function highlightCpp(source) {
  const variables = declaredNames(source);
  const html = hljs.highlight(source, { language: 'cpp', ignoreIllegals: true }).value
    .replace(/<span class="hljs-keyword">(if|else|for|while|do|switch|case|default|break|continue|return|throw|try|catch|co_return|co_yield|co_await)<\/span>/g, '<span class="hljs-control">$1</span>');
  // Only decorate plain text nodes. Never rewrite an HTML attribute, a string,
  // or a comment, and never change the source text or whitespace.
  const stack = [];
  let precedingText = '';
  const parts = html.split(/(<[^>]+>)/g);
  return parts.map((part, index) => {
    if (part.startsWith('</')) { stack.pop(); return part; }
    if (part.startsWith('<')) {
      // highlight.js marks explicit endl(...) calls as built-ins. Apply the
      // same function category as endl passed without parentheses, but never
      // touch nested string/comment spans or unrelated built-ins.
      if (!stack.length && part === '<span class="hljs-built_in">'
          && qualifiedStandard(precedingText)) {
        const category = standardTokenClass(parts[index + 1]);
        if (category) part = `<span class="${category}">`;
      }
      // A built-in token followed by '(' is a call, including stream members
      // and numeric_limits<T>::max(). Keep protected strings/comments intact.
      if (!stack.length && part === '<span class="hljs-built_in">'
          && /^[A-Za-z_]\w*$/.test(parts[index + 1] || '')
          && parts[index + 2] === '</span>' && /^\s*\(/.test(parts[index + 3] || '')) {
        part = '<span class="hljs-title function_">';
      }
      stack.push(part);
      return part;
    }
    const prefix = precedingText;
    precedingText += part;
    if (stack.length) return part;
    return part.replace(/\b[A-Za-z_]\w*\b/g, (word, offset, text) => {
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
export function renderCode({ text, lang }) {
  const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();
  const isCpp = ['cpp', 'c++', 'cc', 'cxx', 'hpp', 'h++'].includes(language);
  const body = isCpp ? highlightCpp(text) : escapeHtml(text);
  return `<pre><code class="${isCpp ? 'language-cpp hljs' : 'language-plaintext'}">${body}\n</code></pre>\n`;
}
