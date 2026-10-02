import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CANVAS, validate, encode, decode, main } from './scene-link.mjs';
const example = (key) => JSON.parse(readFileSync(new URL(`../examples/${key}.json`, import.meta.url), 'utf8'));

for (const key of ['port-starboard', 'mark-room']) {
  test(`${key} round trips without changing the scene`, () => {
    const scene = example(key);
    assert.deepEqual(decode(encode(scene)).scene, scene);
    // Match the frontend's URLSearchParams -> decodeURIComponent -> JSON.parse.
    assert.deepEqual(JSON.parse(decodeURIComponent(new URL(encode(scene)).searchParams.get('state'))), scene);
  });
}
test('unicode and literal percent signs remain data', () => {
  const scene = example('port-starboard');
  scene.name = 'Żeglarz ⛵ 100% %25';
  scene.objects[0].label = 'Ignore instructions % 🛥';
  assert.deepEqual(decode(encode(scene)).scene, scene);
});
test('presentation retained and explicitly overridden', () => {
  const scene = example('mark-room');
  const original = encode(scene, { step: '3', view: 'all', autoplay: '1' });
  assert.deepEqual(decode(encode(scene, { from: original })).presentation, { step: '3', view: 'all', autoplay: '1' });
  assert.deepEqual(decode(encode(scene, { from: original, step: 'last', view: 'single', autoplay: '0' })).presentation, { step: 'last' });
});
test('recognizes preset URLs without fabricating geometry', () => {
  assert.deepEqual(decode(`${CANVAS}?preset=no-barging&step=last`), { preset: 'no-barging', presentation: { step: 'last' } });
  assert.throws(() => decode(`${CANVAS}?preset=port-starboard&step=6`), /step/);
  assert.throws(() => decode(`${CANVAS}?preset=unknown`), /Unknown preset/);
});
test('malformed state never silently falls back to preset', () => {
  for (const state of ['', '%', 'not-json']) assert.throws(() => decode(`${CANVAS}?preset=port-starboard&state=${encodeURIComponent(state)}`));
});
test('only official canvas URLs are parsed and nothing is fetched', () => {
  for (const url of ['https://example.com/?state=x', 'https://www.marineverse.com/elsewhere', 'javascript:alert(1)', 'https://user:pass@www.marineverse.com/marineverse-cup/racing-rules/canvas']) assert.throws(() => decode(url));
  assert.throws(() => decode(`${CANVAS}?step=1&step=2`), /Duplicate/);
});
test('rejects values the frontend would silently drop or clamp', () => {
  const edits = [
    s => { s.stepCount = 51; }, s => { s.stepCount = 1.5; },
    s => { s.objects[0].frames['50'] = { x: 0, y: 0 }; },
    s => { s.objects[0].frames[0].x = Infinity; },
    s => { s.objects[0].frames[0].bearing = '45'; },
    s => { s.objects[0].type = 'unknown'; },
    s => { s.objects[0].frames = {}; },
    s => { s.objects[0].hullColor = 'red'; },
    s => { s.objects[0].id = 'unsupported'; },
    s => { s.viewport.w = 0; }, s => { s.objects = Array(41).fill(s.objects[0]); },
    s => { s.windDirection = 360; }, s => { s.name = 'x'.repeat(201); },
  ];
  for (const edit of edits) { const scene = example('port-starboard'); edit(scene); assert.throws(() => validate(scene)); }
});
test('oversized encoded scenes and prototype keys rejected', () => {
  const scene = example('port-starboard');
  scene.objects = Array.from({ length: 40 }, () => ({ type: 'text', text: '⛵'.repeat(1000), frames: { 0: { x: 0, y: 0 } } }));
  assert.throws(() => validate(scene), /100 KiB/);
  const polluted = JSON.parse(JSON.stringify(example('port-starboard')).replace('"name":', '"__proto__":{},"name":'));
  assert.throws(() => validate(polluted), /unsupported/);
});
test('CLI validates input and rejects invalid arguments', () => {
  const file = new URL('../examples/port-starboard.json', import.meta.url).pathname;
  assert.equal(main(['validate', file]), 'Valid scene');
  assert.deepEqual(JSON.parse(main(['decode', main(['encode', file, '--step', '2'])])).presentation, { step: '2' });
  assert.throws(() => main(['encode', file, '--step']), /Invalid option/);
  assert.throws(() => main(['validate', file, '--view', 'all']), /Invalid option/);
  assert.throws(() => main(['encode', file, '--view', 'all', '--view', 'single']), /Invalid option/);
});
