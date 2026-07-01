import { test } from 'node:test';
import assert from 'node:assert';
import { 
  getRoomPolygon, 
  getPolygonArea, 
  getPolygonPerimeter, 
  calculateRoomRequirements,
  encodeState,
  decodeState
} from './calculatorCore.js';

test('Rectangle Area and Perimeter', () => {
  const pts = getRoomPolygon('rectangle', { length: '10', width: '5' }, 'm');
  assert.strictEqual(getPolygonArea(pts), 50);
  assert.strictEqual(getPolygonPerimeter(pts), 30);
});

test('L-Shape Area and Perimeter', () => {
  const pts = getRoomPolygon('l-shape', { l1: '10', w1: '5', l2: '5', w2: '5' }, 'm');
  assert.strictEqual(getPolygonArea(pts), 75);
  // Perimeter of L-shape 10x5 and 5x5 attached: Main block 10x5, extension 5x5
  // Top: 5, Right inner: 5, Right outer: 5, Bottom: 10, Left: 10 => 5+5+5+10+10 = 35. Wait, 5+5+5+10+10 is 35?
  // Let's check the points generated.
  // [0,0], [5,0], [5,5], [10,5], [10,10], [0,10] -> Top:5, Right(inner):5, Top(inner):5, Right(outer):5, Bottom:10, Left:10.
  // Sum = 5+5+5+5+10+10 = 40.
  assert.strictEqual(getPolygonPerimeter(pts), 40);
});

test('T-Shape Area', () => {
  const pts = getRoomPolygon('t-shape', { mainL: '2', mainW: '10', stemL: '8', stemW: '2' }, 'm');
  assert.strictEqual(getPolygonArea(pts), 36); // 10*2 + 8*2
});

test('Wall Mode Calculations', () => {
  const room = {
    mode: 'walls',
    shape: 'rectangle',
    unit: 'm',
    dim: { length: '5', width: '5', height: '3' },
    doors: 1, doorW: '1', doorH: '2', // 2 sqm
    windows: 2, windowW: '1', windowH: '1', // 2 sqm
    tileId: 'custom', customTileW: '1000', customTileH: '1000', // 1 sqm tile
    wastage: 10
  };
  
  const req = calculateRoomRequirements(room);
  // Floor perimeter: 20m. Wall area = 20 * 3 = 60. Minus 4 (doors/windows) = 56 sqm.
  assert.strictEqual(req.areaSqm, 56);
  assert.strictEqual(req.netTiles, 56);
  assert.strictEqual(req.totalTiles, 62); // 56 + 10% (6) = 62
});

test('State Encoding', () => {
  const state = [{ id: '1', name: 'Test Room' }];
  const encoded = encodeState(state);
  const decoded = decodeState(encoded);
  assert.deepStrictEqual(decoded, state);
});
