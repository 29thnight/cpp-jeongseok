// Bounded, position-based name resolution for instructional C++ fragments.
// This is not an IntelliSense replacement: no suffix-based naming assumptions.
export function variableRoles(tokens, declarations, bodyKinds, types) {
  const result=new Map(), pairs=new Map(), stack=[], scopeAt=[], parent=new Map();
  const word=i=>tokens[i]?.word;
  for(let i=0;i<tokens.length;i++) {
    scopeAt[i]=stack.filter(j=>word(j)==='{').at(-1) ?? -1;
    if(['{','(','['].includes(word(i))) {parent.set(i,scopeAt[i]);stack.push(i);}
    else if(['}',')',']'].includes(word(i))) {const open=stack.pop();if(open!==undefined){pairs.set(open,i);pairs.set(i,open);}}
  }
  const ancestor=(scope,outer)=>{while(scope!==-1){if(scope===outer)return true;scope=parent.get(scope)??-1;}return outer===-1;};
  const indexAt=new Map(tokens.map((t,i)=>[t.start,i]));
  const decls=declarations.map(d=>({...d,index:indexAt.get(d.start)})).filter(d=>d.index!==undefined);
  // Additional declarators share their declaration's type, not its spelling.
  for(const d of [...decls]) {
    if(word(d.index+1)==='(')continue;
    for(let j=d.index+1;j<tokens.length;j++) {
      if([';',')','}'].includes(word(j)))break;
      if(['(','{','['].includes(word(j))&&pairs.has(j)){j=pairs.get(j);continue;}
      if(word(j)===','&&/^[A-Za-z_]\w*$/.test(word(j+1)||'')&&[';','=',',','{','['].includes(word(j+2))&&!decls.some(v=>v.index===j+1))
        decls.push({name:word(j+1),start:tokens[j+1].start,index:j+1});
    }
  }
  const declAt=new Map(decls.map(d=>[d.index,d]));
  const records=new Map();
  for(const [i,kind] of bodyKinds) if(kind==='record') {
    let j=i-1;while(j>=0&&!['class','struct',';','}'].includes(word(j)))j--;
    if(['class','struct'].includes(word(j)))records.set(word(j+1),i);
  }
  const functions=[];
  for(let i=0;i<tokens.length;i++) {
    if(word(i)!=='(' || !pairs.has(i))continue;
    const name=word(i-1), declaration=declAt.has(i-1), constructor=types.has(name);
    const qualifiedMethod=word(i-2)==='::'&&records.has(word(i-3));
    const lambda=word(i-1)===']';
    if(!declaration&&!constructor&&!qualifiedMethod&&!lambda)continue;
    const first=word(i+1);
    if(declaration&&first!==')'&&!decls.some(d=>d.index>i&&d.index<pairs.get(i))&&!types.has(first)&&!['void','int','float','double','bool','char','long','short','unsigned','signed','const','std'].includes(first))continue;
    const close=pairs.get(i);let end=close+1;
    // cv/ref qualifiers and bounded noexcept expressions.
    while(['const','volatile','&','&&','noexcept','override','final'].includes(word(end))) {
      const qualifier=word(end++);if(qualifier==='noexcept'&&word(end)==='(')end=(pairs.get(end)??end)+1;
    }
    if(word(end)===':') {
      end++;
      // Each mem-initializer has its own () or {}. None is the function body.
      while(end<tokens.length) {
        while(/^[A-Za-z_]\w*$/.test(word(end)||'')||word(end)==='::')end++;
        if(!['(','{'].includes(word(end))||!pairs.has(end))break;
        end=pairs.get(end)+1;
        if(word(end)!==',')break;end++;
      }
    }
    if(!['{',';','='].includes(word(end)))continue;
    const body=word(end)==='{'?end:null, last=body===null?end:pairs.get(body);
    if(last===undefined)continue;
    let owner=scopeAt[i];while(owner!==-1&&bodyKinds.get(owner)!=='record')owner=parent.get(owner)??-1;
    if(word(i-2)==='::'&&records.has(word(i-3)))owner=records.get(word(i-3));
    const params=decls.filter(d=>d.index>i&&d.index<close);
    functions.push({open:i,close,end:last,body,owner,params});
  }
  const parameterAt=new Set(functions.flatMap(f=>f.params.map(d=>d.index)));
  const functionNameAt=new Set(functions.map(f=>f.open-1));
  const fields=new Map(), locals=[];
  for(const d of decls) {
    if(functionNameAt.has(d.index)||parameterAt.has(d.index))continue;
    const scope=scopeAt[d.index];
    if(bodyKinds.get(scope)==='record') {
      if(!fields.has(scope))fields.set(scope,new Map());fields.get(scope).set(d.name,d);
      result.set(d.start,'hljs-member');
    } else {
      let lifetimeEnd=tokens.length;
      // A for/if/switch initializer belongs to its statement, not the outer block.
      for(let j=d.index-1;j>=0;j--)if(word(j)==='('&&pairs.get(j)>d.index&&['for','if','switch','while'].includes(word(j-1))) {
        let after=pairs.get(j)+1;
        lifetimeEnd=word(after)==='{'?pairs.get(after):after;
        if(word(after)!=='{')while(lifetimeEnd<tokens.length&&word(lifetimeEnd)!==';')lifetimeEnd++;
        if(word(lifetimeEnd+1)==='else'&&word(lifetimeEnd+2)==='{')lifetimeEnd=pairs.get(lifetimeEnd+2);
        break;
      }
      locals.push({...d,scope,lifetimeEnd});result.set(d.start,'hljs-local');
    }
  }
  for(const f of functions)for(const p of f.params)result.set(p.start,'hljs-parameter');
  for(let i=0;i<tokens.length;i++) {
    const t=tokens[i];if(!/^[A-Za-z_]\w*$/.test(t.word)||functionNameAt.has(i))continue;
    if(['.','->'].includes(word(i-1)))continue; // handled by the caller
    if(word(i-1)==='::') {
      if(fields.get(records.get(word(i-2)))?.has(t.word))result.set(t.start,'hljs-member');
      continue;
    }
    if(result.has(t.start))continue;
    const f=functions.filter(f=>i>f.open&&i<=f.end).sort((a,b)=>b.open-a.open)[0];
    // The identifier before each initializer delimiter names a member, even
    // when a constructor parameter has the same spelling.
    if(f && i>f.close && (f.body===null||i<f.body) && [':',','].includes(word(i-1)) && ['{','('].includes(word(i+1)) && fields.get(f.owner)?.has(t.word)) {
      result.set(t.start,'hljs-member');continue;
    }
    const local=locals.filter(d=>d.name===t.word&&d.index<=i&&i<=d.lifetimeEnd&&ancestor(scopeAt[i],d.scope) && (!f || (d.index>f.close && d.index<f.end))).at(-1);
    if(local){result.set(t.start,'hljs-local');continue;}
    if(f?.params.some(p=>p.name===t.word)){result.set(t.start,'hljs-parameter');continue;}
    let owner=f?.owner??scopeAt[i];
    while(owner!==-1) {
      if(fields.get(owner)?.has(t.word)){result.set(t.start,'hljs-member');break;}
      owner=parent.get(owner)??-1;
    }
  }
  return result;
}
