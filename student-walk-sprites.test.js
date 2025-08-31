import fs from 'fs';
import path from 'path';

test('Student walk sprites exist for frames 0-8', () => {
  for (let i = 0; i < 9; i++) {
    const file = path.join('assets', 'sprites', 'Student', `walk_${i.toString().padStart(3, '0')}.png`);
    expect(fs.existsSync(file)).toBe(true);
  }
});
