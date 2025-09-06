import fs from 'fs';
import path from 'path';

test('Trunk move sprites exist for frames 0-12', () => {
  for (let i = 0; i <= 12; i++) {
    const file = path.join('assets', 'sprites', 'Trunk', `Move_${i.toString().padStart(3, '0')}.png`);
    expect(fs.existsSync(file)).toBe(true);
  }
});
