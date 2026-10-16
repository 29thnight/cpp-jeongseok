import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('curriculum', Path(__file__).resolve().parents[1] / 'scripts/curriculum.py')
c = importlib.util.module_from_spec(spec); spec.loader.exec_module(c)

def initial_state(source):
    """Keep the curriculum definition; isolate unit tests from writing progress."""
    data = copy.deepcopy(source)
    data['revision'] = 0
    data['runs'] = []
    for lesson in data['lessons']:
        lesson.update(status='not_started', stage='A', review='not_requested',
                      draft='absent', publication_path=None, evidence={},
                      next_action='학습 목표를 정한다.', blocked_reason=None,
                      updated_at='2026-10-16T00:00:00Z')
    return c.validate(data)


class CurriculumTests(unittest.TestCase):
    def setUp(self):
        source, _ = c.load(c.DEFAULT)
        self.data = initial_state(source)
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name)/'state.json'
        self.path.write_text(json.dumps(self.data,ensure_ascii=False))
    def tearDown(self): self.temp.cleanup()
    def reject(self, change):
        change(self.data)
        with self.assertRaises((ValueError,KeyError,TypeError)): c.validate(self.data)
    def test_initial_counts_and_next(self):
        self.assertEqual(sum(x['track']=='core' for x in self.data['lessons']),53)
        self.assertEqual(sum(x['track']=='optional' for x in self.data['lessons']),4)
        self.assertEqual(c.candidate(self.data)['id'],'00-1')
        self.assertEqual(sum(x['status']=='published' for x in self.data['lessons']),0)
    def test_live_state_is_valid(self):
        data, _ = c.load(c.DEFAULT)
        self.assertEqual(len(data['lessons']), 57)
    def test_fixture_does_not_mutate_progressed_state(self):
        _, digest = c.load(self.path)
        c.checkpoint(self.path, digest, 'fixture-progress', '00-1',
                     dict(status='writing', stage='B', draft='private_durable'))
        progressed, _ = c.load(self.path)
        before = copy.deepcopy(progressed)
        fixture = initial_state(progressed)
        self.assertEqual(progressed, before)
        self.assertEqual(fixture['revision'], 0)
        self.assertEqual(fixture['runs'], [])
        self.assertEqual(fixture['lessons'][0]['stage'], 'A')
        self.assertEqual(fixture['lessons'][0]['draft'], 'absent')
        self.assertEqual(fixture['lessons'][0]['status'], 'not_started')
    def test_fixture_resets_review_and_blocked_progress(self):
        source = copy.deepcopy(self.data)
        source['lessons'][0].update(status='awaiting_review', stage='G',
            review='pending', draft='private_durable',
            evidence={k:dict(result='passed', checked_at='2026-10-16T00:00:00Z',
                summary='검증 완료') for k in c.REQUIRED})
        source['lessons'][1].update(status='blocked', blocked_reason='검토 대기')
        c.validate(source)
        fixture = initial_state(source)
        self.assertTrue(all(x['status']=='not_started' and x['stage']=='A'
            and x['draft']=='absent' and x['review']=='not_requested'
            and not x['evidence'] and x['blocked_reason'] is None
            for x in fixture['lessons']))
        self.assertEqual(c.candidate(fixture)['id'], '00-1')
    def test_duplicate_id(self): self.reject(lambda d: d['lessons'][1].update(id='00-1'))
    def test_cycle(self): self.reject(lambda d: d['lessons'][0].update(prerequisites=['00-2']))
    def test_unknown_dependency(self): self.reject(lambda d: d['lessons'][0].update(prerequisites=['99-1']))
    def test_optional_not_core_prerequisite(self): self.reject(lambda d: d['lessons'][0].update(prerequisites=['S1']))
    def test_private_url(self): self.reject(lambda d: d['lessons'][0].update(goal='https://drive.google.com/private'))
    def test_private_path(self): self.reject(lambda d: d['lessons'][0].update(next_action='/workspace/private/source'))
    def test_private_field(self): self.reject(lambda d: d['lessons'][0].update(source_file='secret'))
    def test_private_draft_locator(self): self.reject(lambda d: d['lessons'][0].update(draft='private-file-id'))
    def test_false_ready(self): self.reject(lambda d: d['lessons'][0].update(status='ready_to_publish',stage='G'))
    def test_false_published(self): self.reject(lambda d: d['lessons'][0].update(status='published'))
    def test_published_path_for_unpublished(self): self.reject(lambda d: d['lessons'][0].update(publication_path='docs/lessons/introduction/index.html'))
    def test_missing_blocker(self): self.reject(lambda d: d['lessons'][0].update(status='blocked'))
    def test_incomplete_validation(self): self.reject(lambda d: d['lessons'][0].update(stage='D',status='writing',draft='private_durable'))
    def test_no_durable_draft(self): self.reject(lambda d: d['lessons'][0].update(status='writing'))
    def test_checkpoint_idempotency_and_conflict(self):
        _,digest=c.load(self.path)
        patch=dict(status='writing',draft='private_durable',next_action='목표를 검토한다.')
        result=c.checkpoint(self.path,digest,'run-1','00-1',patch)
        self.assertEqual(result['revision'],1)
        self.assertEqual(c.checkpoint(self.path,digest,'run-1','00-1',patch)['result'],'already_applied')
        with self.assertRaises(ValueError): c.checkpoint(self.path,digest,'run-2','00-1',patch)
        with self.assertRaises(ValueError): c.checkpoint(self.path,result['state_sha256'],'run-1','00-1',dict(patch,next_action='다른 작업'))
        self.assertEqual(c.load(self.path)[0]['revision'],1)
    def test_stage_skipping_rejected(self):
        _,digest=c.load(self.path)
        with self.assertRaises(ValueError): c.checkpoint(self.path,digest,'run-1','00-1',dict(stage='C',status='example_validation',draft='private_durable'))
        self.assertEqual(c.load(self.path)[0]['revision'],0)
    def test_lock_does_not_expire_to_completion(self):
        _,digest=c.load(self.path)
        lock=Path(str(self.path)+'.lock'); lock.touch()
        with self.assertRaises(ValueError): c.checkpoint(self.path,digest,'run-1','00-1',dict(status='writing',draft='private_durable'))
        self.assertTrue(lock.exists()); self.assertEqual(c.load(self.path)[0]['revision'],0)
    def test_active_prioritized(self):
        self.data['lessons'][0].update(status='writing',draft='private_durable')
        self.assertEqual(c.candidate(self.data)['status'],'writing')
    def test_blocked_not_restarted(self):
        self.data['lessons'][0].update(status='blocked',blocked_reason='검토 필요')
        self.assertIsNone(c.candidate(self.data))
    def test_review_wait_not_restarted(self):
        self.data['lessons'][0]['status']='awaiting_review'
        self.assertIsNone(c.candidate(self.data))
    def test_ready_allows_dependency_without_publication(self):
        self.data['lessons'][0]['status']='ready_to_publish'
        self.assertEqual(c.candidate(self.data)['id'],'00-2')
    def test_prerequisite_enforced_on_checkpoint(self):
        _,digest=c.load(self.path)
        with self.assertRaises(ValueError): c.checkpoint(self.path,digest,'run-1','01-1',dict(status='writing',draft='private_durable'))
        self.assertEqual(c.load(self.path)[0]['revision'],0)
    def test_unknown_patch_and_timestamp_rejected(self):
        _,digest=c.load(self.path)
        for patch in [dict(source='secret'),dict(updated_at='2026-10-16T00:00:00Z')]:
            with self.assertRaises(ValueError): c.checkpoint(self.path,digest,'run-1','00-1',patch)
    def test_complete_private_lifecycle(self):
        proof=dict(result='passed',checked_at='2026-10-16T00:00:00Z',summary='새 예제의 정상·경계·실패 경로 확인')
        patches=[dict(status='writing',draft='private_durable'),dict(stage='B'),dict(stage='C',status='example_validation'),
                 dict(stage='D',status='writing',evidence={'examples':proof}),dict(stage='E'),dict(stage='F'),
                 dict(stage='G',status='awaiting_review',review='pending',evidence={k:proof for k in c.REQUIRED}),
                 dict(status='ready_to_publish',review='approved')]
        for n,patch in enumerate(patches):
            _,digest=c.load(self.path)
            c.checkpoint(self.path,digest,f'run-{n}','00-1',patch)
        data,_=c.load(self.path)
        self.assertEqual(data['lessons'][0]['status'],'ready_to_publish')
        self.assertIsNone(data['lessons'][0]['publication_path'])
        self.assertEqual(c.candidate(data)['id'],'00-2')
        _,digest=c.load(self.path)
        with self.assertRaises(ValueError): c.checkpoint(self.path,digest,'publish','00-1',dict(status='published',publication_path='docs/lessons/introduction/index.html'))
    def test_revision_cannot_reuse_evidence(self):
        _,digest=c.load(self.path)
        with self.assertRaises(ValueError): c.checkpoint(self.path,digest,'revision','00-1',dict(status='needs_revision',draft='private_durable',review='changes_requested'))
        result=c.checkpoint(self.path,digest,'revision','00-1',dict(status='needs_revision',draft='private_durable',review='changes_requested',evidence={}))
        self.assertEqual(result['revision'],1)
    def test_malformed_evidence_and_time(self):
        self.reject(lambda d:d['lessons'][0].update(evidence={'technical':{'result':'passed','checked_at':'yesterday','summary':'test'}}))
    def test_unknown_run_fields(self):
        self.reject(lambda d:d['runs'].append({'secret':'x'}))
    def test_render_is_deterministic(self):
        output=c.markdown(self.data)
        self.assertEqual(output,c.markdown(self.data)); self.assertIn('게시완료 0',output)
        self.assertEqual(sum(line.startswith('| ') for line in output.splitlines()),58)

if __name__=='__main__': unittest.main()

