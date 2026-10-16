const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export function renderComments(config) {
  const heading = '<h2 id="comments-heading">함께 이야기하기</h2>';
  if (!config?.enabled || !config.repo || !config.repoId || !config.category || !config.categoryId) {
    return `<section class="comments" aria-labelledby="comments-heading">${heading}<p>댓글 연결을 준비하고 있습니다. 현재는 댓글을 작성할 수 없습니다.</p></section>`;
  }
  return `<section class="comments" aria-labelledby="comments-heading">${heading}
<p>질문이나 의견을 남겨 주세요. GitHub 계정으로 로그인하면 댓글을 작성할 수 있습니다.<br>댓글과 반응은 공개 GitHub Discussions에 저장됩니다.</p>
<div class="giscus" data-comments-repo="${esc(config.repo)}" data-comments-repo-id="${esc(config.repoId)}" data-comments-category="${esc(config.category)}" data-comments-category-id="${esc(config.categoryId)}"></div>
<p class="comments-status" role="status">댓글을 불러오는 중입니다…</p>
<noscript><p>댓글을 보려면 JavaScript를 켜 주세요.</p></noscript>
<p class="comments-help">댓글이 보이지 않나요? <a href="https://github.com/${esc(config.repo)}/discussions">GitHub Discussions에서 확인하기 ↗</a></p>
</section>`;
}
