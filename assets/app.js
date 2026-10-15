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
