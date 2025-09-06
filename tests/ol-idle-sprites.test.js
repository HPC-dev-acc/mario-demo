import fs from 'fs';
import path from 'path';

test('OL idle sprites exist for frames 0-12', () => {
  for (let i = 0; i < 13; i++) {
    const file = path.join('assets', 'sprites', 'OL', `idle_${i.toString().padStart(3, '0')}.png`);
    expect(fs.existsSync(file)).toBe(true);
  }
});
