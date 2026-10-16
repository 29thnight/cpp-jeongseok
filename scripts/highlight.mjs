import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('cpp', cpp);

const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

// Highlight during generation: no browser bundle, network request, or JS needed.
export function renderCode({ text, lang }) {
  const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();
  const isCpp = ['cpp', 'c++', 'cc', 'cxx', 'hpp', 'h++'].includes(language);
  const body = isCpp
    ? hljs.highlight(text, { language: 'cpp', ignoreIllegals: true }).value
    : escapeHtml(text);
  return `<pre><code class="${isCpp ? 'language-cpp hljs' : 'language-plaintext'}">${body}\n</code></pre>\n`;
}
