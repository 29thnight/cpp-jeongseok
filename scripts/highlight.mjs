import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('cpp', cpp);

const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const standardTypes = new Set(['vector', 'string', 'string_view', 'array', 'span', 'optional', 'variant', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'map', 'set', 'unordered_map', 'unordered_set', 'pair', 'tuple', 'size_t']);

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
  return html.split(/(<[^>]+>)/g).map(part => {
    if (part.startsWith('</')) { stack.pop(); return part; }
    if (part.startsWith('<')) { stack.push(part); return part; }
    if (stack.length) return part;
    return part.replace(/\b[A-Za-z_]\w*\b/g, (word, offset, text) => {
      if (word === 'std' && text.slice(offset + word.length).startsWith('::')) return `<span class="hljs-namespace">${word}</span>`;
      if (['cout', 'cin', 'cerr', 'clog'].includes(word) && /std::$/.test(text.slice(0, offset))) return `<span class="hljs-variable">${word}</span>`;
      if (variables.has(word)) return `<span class="hljs-local">${word}</span>`;
      if (standardTypes.has(word) && /std::$/.test(text.slice(0, offset))) return `<span class="hljs-stl-type">${word}</span>`;
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
