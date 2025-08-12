import { execSync } from 'child_process';

test('running build twice leaves git worktree clean', () => {
  const before = execSync('git status --porcelain').toString().trim();
  execSync('node scripts/update-version.mjs');
  const after = execSync('git status --porcelain').toString().trim();
  expect(after).toBe(before);
});

