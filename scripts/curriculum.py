#!/usr/bin/env python3
"""Public metadata only. Never writes lesson content or publishes a page."""
import argparse
from collections import Counter
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
DEFAULT = ROOT / 'curriculum/state.json'
STATUSES = {'not_started': '미착수', 'writing': '집필중', 'example_validation': '예제검증',
            'awaiting_review': '검수대기', 'needs_revision': '수정필요',
            'ready_to_publish': '게시준비', 'published': '게시완료', 'blocked': '차단'}
STAGES = 'ABCDEFG'
REQUIRED = {'examples', 'technical', 'editorial', 'links', 'privacy'}
FIELDS = {'id', 'track', 'title', 'goal', 'prerequisites', 'status', 'stage', 'review', 'draft',
          'publication_path', 'evidence', 'next_action', 'blocked_reason', 'updated_at'}
MUTABLE = FIELDS - {'id', 'track', 'title', 'prerequisites'}
EXPECTED = {f'{m:02}-{n}' for m, count in enumerate([3,4,4,4,4,4,5,4,4,4,4,5,4]) for n in range(1,count+1)} | {'S1','S2','S3','S4'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def timestamp(value):
    require(isinstance(value, str), 'timestamp must be text')
    dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
    require(dt.tzinfo is not None, 'timestamp must include timezone')


def public_text(value):
    require(isinstance(value, str) and 0 < len(value) <= 1000, 'invalid public text')
    require(not re.search(r'https?://|file:|sediment:|/workspace/|/home/|[A-Za-z]:\\|(?:drive|docs)\.google|```', value, re.I), 'private locator, URL, or code in public metadata')
    require(not any(c in value for c in '\n\r\t'), 'metadata must be a single line')


def repo_path(value, prefix):
    require(isinstance(value, str) and value.startswith(prefix) and '\\' not in value,
            'invalid public artifact path')
    require('..' not in Path(value).parts and not Path(value).is_absolute(), 'unsafe path')
    require((ROOT / value).resolve().is_relative_to(ROOT), 'path escapes repository')
    require((ROOT / value).is_file(), f'public artifact missing: {value}')


def validate(data):
    require(set(data) == {'schema_version','revision','standard','storage_policy','lessons','existing_articles','runs'}, 'unknown root fields')
    require(data['schema_version'] == 1 and type(data['revision']) is int and data['revision'] >= 0, 'invalid version')
    require(data['standard'] == 'C++20' and data['storage_policy'] == 'private_durable_required', 'invalid policy')
    lessons = data['lessons']
    require(isinstance(lessons, list) and len(lessons) == 57, 'expected 57 lessons')
    ids = [x['id'] for x in lessons]
    require(len(set(ids)) == 57 and set(ids) == EXPECTED, 'invalid or duplicate lesson IDs')
    by_id = {x['id']: x for x in lessons}
    for x in lessons:
        require(set(x) == FIELDS, f"unknown/missing fields: {x['id']}")
        require(x['track'] == ('optional' if x['id'].startswith('S') else 'core'), 'invalid track')
        for key in ['title','goal','next_action']:
            public_text(x[key])
        require(x['status'] in STATUSES and x['stage'] in list(STAGES), 'invalid status/stage')
        require(x['review'] in ['not_requested','pending','changes_requested','approved'], 'invalid review')
        require(x['draft'] in ['absent','private_durable'], 'draft must not contain a private locator')
        require(isinstance(x['prerequisites'], list) and len(set(x['prerequisites'])) == len(x['prerequisites']), 'invalid prerequisites')
        for dep in x['prerequisites']:
            require(dep in by_id and dep != x['id'], 'unknown/self dependency')
            require(x['track'] != 'core' or by_id[dep]['track'] == 'core', 'optional lesson blocks core')
        timestamp(x['updated_at'])
        if x['blocked_reason'] is not None:
            public_text(x['blocked_reason'])
        require((x['status'] == 'blocked') == bool(x['blocked_reason']), 'blocked reason mismatch')
        ev = x['evidence']
        require(isinstance(ev, dict) and set(ev) <= REQUIRED | {'approval','publication'}, 'invalid evidence categories')
        for kind, proof in ev.items():
            require(set(proof) == {'result','checked_at','summary'}, 'evidence must not contain private pointers')
            require(proof['result'] in ['passed','failed','not_applicable'], 'invalid evidence result')
            require(proof['result'] != 'not_applicable' or kind == 'examples', 'only examples can be inapplicable with explanation')
            timestamp(proof['checked_at']); public_text(proof['summary'])
        if x['status'] == 'not_started':
            require(x['stage'] == 'A' and x['draft'] == 'absent' and not ev and x['review'] == 'not_requested', 'unstarted lesson has progress')
        if x['status'] == 'example_validation':
            require(x['stage'] == 'C', 'example validation must use stage C')
        if x['stage'] in 'DEFG':
            require(ev.get('examples', {}).get('result') in ['passed','not_applicable'], 'example verification required before prose')
        if x['stage'] != 'A' or x['status'] in ['writing','example_validation','awaiting_review','needs_revision','ready_to_publish','published']:
            require(x['draft'] == 'private_durable', 'durable private checkpoint required')
        if x['status'] == 'awaiting_review':
            require(x['stage'] == 'G' and x['review'] == 'pending', 'invalid review handoff')
        if x['status'] == 'needs_revision':
            require(x['review'] == 'changes_requested', 'revision needs review decision')
        if x['status'] in ['awaiting_review','ready_to_publish','published']:
            require(all(ev.get(k, {}).get('result') == 'passed' for k in REQUIRED - {'examples'}), 'all quality checks required')
        if x['status'] in ['ready_to_publish','published']:
            require(x['stage'] == 'G' and x['review'] == 'approved', 'approval needed for ready state')
        if x['status'] == 'published':
            require(all(ev.get(k, {}).get('result') == 'passed' for k in ['approval','publication']), 'publication approval and deployed verification required')
            repo_path(x['publication_path'], 'docs/lessons/')
        else:
            require(x['publication_path'] is None, 'unpublished lesson must not advertise a public path')
    visited, stack = set(), set()
    def visit(i):
        require(i not in stack, 'dependency cycle')
        if i in visited: return
        stack.add(i)
        for dep in by_id[i]['prerequisites']: visit(dep)
        stack.remove(i); visited.add(i)
    for i in ids: visit(i)
    require(isinstance(data['existing_articles'], list), 'invalid articles')
    for article in data['existing_articles']:
        require(set(article) == {'path','publication_path','status','related_lessons','review_note'}, 'invalid article metadata')
        repo_path(article['path'], 'content/'); repo_path(article['publication_path'], 'docs/lessons/')
        require(article['status'] == 'published' and set(article['related_lessons']) <= set(ids), 'invalid article mapping')
        public_text(article['review_note'])
    require(isinstance(data['runs'], list), 'invalid runs')
    run_ids = set()
    for run in data['runs']:
        require(set(run) == {'run_id','lesson_id','patch_hash','revision','recorded_at'}, 'invalid run record')
        require(re.fullmatch(r'[a-zA-Z0-9_-]{1,80}', run['run_id']) and run['run_id'] not in run_ids, 'invalid/duplicate run ID')
        run_ids.add(run['run_id'])
        require(run['lesson_id'] in by_id and re.fullmatch('[0-9a-f]{64}',run['patch_hash']), 'invalid run digest')
        require(type(run['revision']) is int and 1 <= run['revision'] <= data['revision'], 'invalid run revision')
        timestamp(run['recorded_at'])
    require([r['revision'] for r in data['runs']] == list(range(1, data['revision'] + 1)), 'non-contiguous checkpoint history')
    return data


def load(path):
    raw = path.read_bytes()
    return validate(json.loads(raw)), hashlib.sha256(raw).hexdigest()


def candidate(data, include_optional=False):
    by_id = {x['id']: x for x in data['lessons']}
    eligible = [x for x in data['lessons'] if include_optional or x['track'] == 'core']
    active = [x for x in eligible if x['status'] in ['writing','example_validation','needs_revision']]
    eligible = active + [x for x in eligible if x['status'] == 'not_started']
    for x in eligible:
        if all(by_id[i]['status'] in ['ready_to_publish','published'] for i in x['prerequisites']):
            return {key: x[key] for key in ['id','title','status','stage','next_action','draft']}
    return None


@contextmanager
def locked(path):
    lock = Path(str(path) + '.lock')
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError:
        raise ValueError('state locked; verify the prior process stopped before manual recovery')
    try:
        os.close(fd)
        yield
    finally:
        lock.unlink()


def atomic_write(path, content):
    fd, temp = tempfile.mkstemp(dir=path.parent, prefix='.' + path.name)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as file:
            file.write(content); file.flush(); os.fsync(file.fileno())
        os.replace(temp, path)
    finally:
        if os.path.exists(temp): os.unlink(temp)


def checkpoint(path, expected, run_id, lesson_id, patch):
    require(re.fullmatch(r'[a-zA-Z0-9_-]{1,80}',run_id), 'invalid run ID')
    require(isinstance(patch, dict) and patch and set(patch) <= MUTABLE, 'invalid patch')
    digest = hashlib.sha256(json.dumps(patch,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
    with locked(path):
        data, current = load(path)
        for run in data['runs']:
            if run['run_id'] == run_id:
                require(run['lesson_id'] == lesson_id and run['patch_hash'] == digest, 'run ID reused with different content')
                return {'result':'already_applied','revision':run['revision'],'state_sha256':current}
        require(current == expected, 'stale state; reload and reconcile, never overwrite newer progress')
        lesson = next((x for x in data['lessons'] if x['id'] == lesson_id), None)
        require(lesson is not None, 'unknown lesson')
        require('updated_at' not in patch, 'timestamp is assigned by the checkpoint command')
        old_stage = lesson['stage']
        by_id = {x['id']: x for x in data['lessons']}
        if patch.get('status', lesson['status']) not in ['not_started', 'blocked']:
            require(all(by_id[i]['status'] in ['ready_to_publish','published'] for i in lesson['prerequisites']), 'prerequisites not ready')
        target_stage = patch.get('stage', old_stage)
        require(target_stage in list(STAGES), 'invalid stage')
        if (STAGES.index(target_stage) < STAGES.index(old_stage)
                or patch.get('status') == 'needs_revision'
                or ('goal' in patch and patch['goal'] != lesson['goal'])):
            require(patch.get('evidence') == {} and patch.get('review') in ['changes_requested','not_requested'], 'revision must clear stale evidence and approval')
            require(target_stage in 'ABC', 'restart revised material no later than example validation')
        lesson.update(patch)
        require(STAGES.index(lesson['stage']) <= STAGES.index(old_stage) + 1, 'complete one stage at a time')
        now = datetime.now(timezone.utc).isoformat(timespec='seconds')
        lesson['updated_at'] = now
        data['revision'] += 1
        data['runs'].append(dict(run_id=run_id,lesson_id=lesson_id,patch_hash=digest,revision=data['revision'],recorded_at=now))
        validate(data)
        atomic_write(path, json.dumps(data,ensure_ascii=False,indent=2)+'\n')
        return {'result':'checkpointed','revision':data['revision'],'state_sha256':load(path)[1]}


def markdown(data):
    def cell(s): return str(s).replace('|','\\|').replace('<','&lt;').replace('>','&gt;')
    counts = Counter(x['status'] for x in data['lessons'])
    lines = ['# 커리큘럼 집필 현황', '', '이 표는 `state.json`에서 생성됩니다. 본편 53수업 + 선택 심화 4수업입니다.',
             '기존 소개 글 1편은 별도이며 본편 완료 수에 포함하지 않습니다.', '',
             f"미착수 {counts['not_started']} · 검수대기 {counts['awaiting_review']} · 게시준비 {counts['ready_to_publish']} · 게시완료 {counts['published']}", '',
             '게시준비는 검수된 비공개 완성본이며 공개를 의미하지 않습니다. 이 표는 집필 진척만 표시하며 예약 실행 설정은 별도로 관리합니다.', '',
             '| 수업 | 목표 | 선행 | 집필 단계 | 예제 검증 | 검토 | 게시 | 다음 행동 | 갱신 |',
             '|---|---|---|---|---|---|---|---|---|']
    for x in data['lessons']:
        example = x['evidence'].get('examples',{}).get('result','미검증')
        pub = '게시완료' if x['status']=='published' else '비공개 완성' if x['status']=='ready_to_publish' else '미게시'
        values = [x['id']+' '+x['title'],x['goal'],', '.join(x['prerequisites']) or '없음',STATUSES[x['status']]+' / '+x['stage'],example,x['review'],pub,x['next_action'],x['updated_at'][:10]]
        lines.append('| '+' | '.join(map(cell, values))+' |')
    return '\n'.join(lines)+'\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state', type=Path, default=DEFAULT)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('validate')
    nex = sub.add_parser('next'); nex.add_argument('--include-optional', action='store_true')
    render = sub.add_parser('render'); render.add_argument('--check', action='store_true')
    cp = sub.add_parser('checkpoint')
    cp.add_argument('--expected-sha',required=True); cp.add_argument('--run-id',required=True)
    cp.add_argument('--lesson',required=True); cp.add_argument('--patch',type=Path,required=True)
    args = parser.parse_args()
    if args.command == 'checkpoint':
        result = checkpoint(args.state,args.expected_sha,args.run_id,args.lesson,json.loads(args.patch.read_text()))
    else:
        data, digest = load(args.state)
        result = {'revision':data['revision'],'state_sha256':digest}
        if args.command == 'next':
            result.update(candidate=candidate(data,args.include_optional), notice='proposal_only; private durable workspace required; no writing or publication performed')
        elif args.command == 'render':
            output = args.state.parent / 'PROGRESS.md'; content = markdown(data)
            if args.check: require(output.exists() and output.read_text() == content,'progress table is stale; run render')
            else: atomic_write(output,content)
            result['result'] = 'progress_table_valid' if args.check else 'rendered'
        else: result['result'] = 'valid_57_lessons'
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__ == '__main__':
    try: main()
    except (ValueError,KeyError,TypeError,OSError,StopIteration) as error:
        print(f'ERROR: {error}', file=sys.stderr); sys.exit(1)
