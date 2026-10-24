// Work on Markdown block tokens, never rendered HTML or code-fence contents.
// Keep every original token in place, including lists, examples and subheadings.
export function calloutKind(heading) {
  const title=heading.replace(/^\s*\d+[.)]?\s*/, '').trim();
  if (/^(?:연습\s*문제\s*(?:상세\s*)?)?해설(?:과|\s|$)|^정답과\s*(?:해설|풀이)(?:\s|$)/u.test(title)) return 'solution';
  if (/^연습(?:\s*문제)?(?:\s|$)|^직접\s*(?:풀어|확인할\s*문제)|^스스로\s*확인하는\s*.*문제$/u.test(title)) return 'exercise';
  return null;
}

export function withLessonCallouts(tokens) {
  const result=[];
  let open=false;
  const html=raw=>({type:'html',raw,text:raw,block:true});
  for (const token of tokens) {
    if (token.type==='heading' && token.depth<=2) {
      if (open) { result.push(html('</section>\n')); open=false; }
      const kind=token.depth===2 ? calloutKind(token.text) : null;
      if (kind) {
        const label=kind==='exercise' ? '연습문제' : '해설';
        result.push(html(`<section class="lesson-callout lesson-callout--${kind}" aria-label="${label}">\n<div class="lesson-callout-label" aria-hidden="true">${label}</div>\n`));
        open=true;
      }
    }
    result.push(token);
  }
  if (open) result.push(html('</section>\n'));
  // Marked stores link-reference definitions on the token list itself.
  result.links=tokens.links;
  return result;
}
