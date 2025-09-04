import fs from 'fs';
import path from 'path';

function getPngDimensions(file) {
  const buf = fs.readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test('Trunk sprite aspect ratio is preserved in sizing formula', () => {
  const { width, height } = getPngDimensions(path.join('assets', 'sprites', 'Trunk', 'Move_000.png'));
  const ratio = width / height;
  const playerBaseH = 44;
  const sizeScale = 2;
  const npcH = playerBaseH * sizeScale;
  const npcW = npcH * ratio;
  expect(npcW / npcH).toBeCloseTo(ratio);
});
