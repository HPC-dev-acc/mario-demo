import fs from 'fs';
import path from 'path';

test('OL walk sprites exist for frames 0-11', () => {
  for (let i = 0; i < 12; i++) {
    const file = path.join('assets', 'sprites', 'OL', `walk_${i.toString().padStart(3, '0')}.png`);
    expect(fs.existsSync(file)).toBe(true);
  }
});
