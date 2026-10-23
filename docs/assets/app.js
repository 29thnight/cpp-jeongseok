const form = document.querySelector('.search-form');
if (form) {
  const input = form.querySelector('input');
  const rows = [...document.querySelectorAll('.chapter')];
  const result = document.querySelector('.search-result');
  const empty = document.querySelector('.no-results');
  const filter = () => {
    const words = input.value.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);
    let visible = 0;
    rows.forEach(row => { row.hidden = !words.every(word => row.dataset.search.toLocaleLowerCase('ko').includes(word)); if (!row.hidden) visible++; });
    document.querySelectorAll('.curriculum-group').forEach(group => { group.hidden = ![...group.querySelectorAll('.chapter')].some(row => !row.hidden); });
    result.hidden = !words.length;
    result.textContent = `${visible}개의 강좌가 검색되었습니다`;
    empty.hidden = visible !== 0;
  };
  input.addEventListener('input', filter);
  form.addEventListener('submit', e => e.preventDefault());
  form.addEventListener('reset', () => { input.value=''; filter(); input.focus(); });
}
const tocLinks = [...document.querySelectorAll('.article-sidebar nav a')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting) { tocLinks.forEach(a => { const active=a.hash===`#${entry.target.id}`; a.classList.toggle('active',active); if(active)a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); }); } });
  }, {rootMargin:'-5% 0px -65% 0px'});
  document.querySelectorAll('.prose h2').forEach(h=>observer.observe(h));
}

// Official giscus widget. No tokens or account credentials belong in this config.
const comments = document.querySelector('.giscus[data-comments-repo]');
if (comments) {
  const status = document.querySelector('.comments-status');
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  const options = {
    repo: comments.dataset.commentsRepo,
    'repo-id': comments.dataset.commentsRepoId,
    category: comments.dataset.commentsCategory,
    'category-id': comments.dataset.commentsCategoryId,
    mapping: 'pathname', strict: '1',
    'reactions-enabled': '1', 'emit-metadata': '0',
    'input-position': 'top', theme: 'light', lang: 'ko'
  };
  for (const [key, value] of Object.entries(options)) script.setAttribute(`data-${key}`, value);
  const timeout = setTimeout(() => {
    status.textContent = '댓글을 불러오지 못했거나 연결이 지연되고 있습니다. 페이지를 새로고침하거나 아래 GitHub 링크를 이용해 주세요.';
  }, 20000);
  script.addEventListener('error', () => {
    clearTimeout(timeout);
    status.textContent = '댓글 서버에 연결하지 못했습니다. 페이지를 새로고침하거나 아래 GitHub 링크를 이용해 주세요.';
  });
  window.addEventListener('message', event => {
    const frame = comments.querySelector('iframe.giscus-frame');
    if (event.origin !== 'https://giscus.app' || event.source !== frame?.contentWindow || !event.data?.giscus) return;
    if (event.data.giscus.resizeHeight) {
      clearTimeout(timeout);
      status.hidden = true;
      frame.title = 'C++의 정석 강좌 댓글';
    }
  });
  comments.appendChild(script);
}
