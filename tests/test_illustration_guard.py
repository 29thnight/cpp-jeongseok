"""Illustration snapshots protect lesson text, not mutable writing progress."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('node'), 'Illustration integration tests require Node.js')
class IllustrationGuardTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in ('content', 'assets', 'docs', 'curriculum', 'scripts', 'tests/fixtures'):
            shutil.copytree(ROOT / name, self.root / name)
        self.state = self.root / 'curriculum/state.json'

    def run_guard(self):
        return subprocess.run(['node', 'scripts/check-illustrations.mjs'],
                              cwd=self.root, capture_output=True, text=True)

    def test_valid_checkpoint_does_not_break_snapshot(self):
        data = json.loads(self.state.read_text())
        # Same-stage progress works independently of today's active lesson.
        lesson = next(x for x in data['lessons'] if x['status'] == 'not_started')
        patch = self.root / 'patch.json'
        patch.write_text(json.dumps({'next_action': '학습 목표를 검토한다.'}))
        result = subprocess.run([
            'python3', 'scripts/curriculum.py', 'checkpoint',
            '--expected-sha', hashlib.sha256(self.state.read_bytes()).hexdigest(),
            '--run-id', 'illustration-guard-regression', '--lesson', lesson['id'],
            '--patch', str(patch)], cwd=self.root, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(self.state.read_text())['revision'], data['revision'] + 1)
        result = self.run_guard()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_invalid_curriculum_is_rejected(self):
        data = json.loads(self.state.read_text())
        data['lessons'][0]['status'] = 'invalid'
        self.state.write_text(json.dumps(data))
        self.assertNotEqual(self.run_guard().returncode, 0)

    def test_lesson_prose_is_still_byte_locked(self):
        path = self.root / 'content/variables-initialization.md'
        path.write_text(path.read_text() + '\nUnauthorized prose change.\n')
        result = self.run_guard()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('non-figure content changed', result.stderr)

    def test_code_examples_are_still_byte_locked(self):
        path = self.root / 'content/variables-initialization.md'
        source = path.read_text()
        self.assertIn('```cpp\n', source)
        path.write_text(source.replace('```cpp\n', '```cpp\nint unauthorized = 1;\n', 1))
        result = self.run_guard()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('non-figure content changed', result.stderr)
