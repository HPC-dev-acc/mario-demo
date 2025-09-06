import fs from 'fs';
import path from 'path';

test('Officeman idle sprites exist for frames 0-18', () => {
  for (let i = 0; i < 19; i++) {
    const file = path.join('assets', 'sprites', 'officeman', `idle_${i.toString().padStart(3, '0')}.png`);
    expect(fs.existsSync(file)).toBe(true);
  }
});
