import fs from 'fs';
import path from 'path';

test('Officeman walk sprites exist for frames 0-10', () => {
  for (let i = 0; i < 11; i++) {
    const file = path.join('assets', 'sprites', 'officeman', `walk_${i.toString().padStart(3, '0')}.png`);
    expect(fs.existsSync(file)).toBe(true);
  }
});
