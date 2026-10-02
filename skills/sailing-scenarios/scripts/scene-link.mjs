#!/usr/bin/env node
// Keep compatible with marineverse-frontend/components/racing-rules-canvas/sceneModel.js.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const CANVAS = 'https://www.marineverse.com/marineverse-cup/racing-rules/canvas';
const PRESETS = new Set(['port-starboard', 'windward-leeward', 'overtaking', 'no-barging', 'mark-room']);
const PRESET_STEPS = { 'port-starboard': 5, 'windward-leeward': 6, overtaking: 6, 'no-barging': 7, 'mark-room': 9 };
const MAX_STATE = 100 * 1024;
const fail = (message) => { throw new Error(message); };
const record = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
function keys(x, allowed, path) {
  if (!record(x)) fail(`${path} must be an object`);
  for (const key of Object.keys(x)) if (!allowed.includes(key)) fail(`${path}.${key} is unsupported`);
}
function number(x, min, max, path) {
  if (!Number.isFinite(x) || x < min || x > max) fail(`${path} must be a finite number in ${min}..${max}`);
}
function string(x, max, path) {
  if (typeof x !== 'string' || x.length > max) fail(`${path} must be a string of at most ${max} characters`);
}
export function validate(scene) {
  keys(scene, ['name', 'windDirection', 'stepCount', 'viewport', 'objects'], 'scene');
  string(scene.name, 200, 'name');
  number(scene.windDirection, 0, 360 - Number.EPSILON * 360, 'windDirection');
  number(scene.stepCount, 1, 50, 'stepCount');
  if (!Number.isInteger(scene.stepCount)) fail('stepCount must be an integer');
  if (!Array.isArray(scene.objects) || scene.objects.length > 40) fail('objects must be an array of at most 40 objects');
  scene.objects.forEach((o, i) => {
    const p = `objects[${i}]`;
    keys(o, ['type', 'frames', 'label', 'text', 'hullColor', 'fill', 'length', 'fontSize', 'width', 'showZone'], p);
    if (!['boat', 'mark', 'startLine', 'text'].includes(o.type)) fail(`${p}.type is unsupported`);
    if (!record(o.frames) || !Object.keys(o.frames).length) fail(`${p}.frames must be nonempty`);
    for (const [key, frame] of Object.entries(o.frames)) {
      if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= scene.stepCount) fail(`${p}.frames key ${key} is out of range`);
      keys(frame, ['x', 'y', 'bearing', 'rotation'], `${p}.frames.${key}`);
      for (const field of ['x', 'y']) number(frame[field], -Infinity, Infinity, `${p}.${key}.${field}`);
      for (const field of ['bearing', 'rotation']) if (field in frame) number(frame[field], -Infinity, Infinity, `${p}.${key}.${field}`);
    }
    for (const [field, max] of [['label', 200], ['text', 1000]]) if (field in o) string(o[field], max, `${p}.${field}`);
    for (const field of ['hullColor', 'fill']) if (field in o && (typeof o[field] !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(o[field]))) fail(`${p}.${field} must be a hex color`);
    for (const field of ['length', 'width']) if (field in o) number(o[field], 10, 4000, `${p}.${field}`);
    if ('fontSize' in o) number(o.fontSize, 6, 200, `${p}.fontSize`);
    if ('showZone' in o && typeof o.showZone !== 'boolean') fail(`${p}.showZone must be boolean`);
  });
  if ('viewport' in scene) {
    const vp = scene.viewport;
    const region = record(vp) && ('w' in vp || 'h' in vp);
    keys(vp, region ? ['cx', 'cy', 'w', 'h'] : ['cx', 'cy', 'scale'], 'viewport');
    number(vp.cx, -Infinity, Infinity, 'viewport.cx');
    number(vp.cy, -Infinity, Infinity, 'viewport.cy');
    if (region) {
      number(vp.w, Number.MIN_VALUE, Infinity, 'viewport.w');
      number(vp.h, Number.MIN_VALUE, Infinity, 'viewport.h');
    } else number(vp.scale, 0.05, 10, 'viewport.scale');
  }
  if (encodeURIComponent(JSON.stringify(scene)).length > MAX_STATE) fail('Encoded scene exceeds the 100 KiB frontend limit');
  return scene;
}
function canvasUrl(input) {
  const url = new URL(input);
  if (url.origin !== 'https://www.marineverse.com' || url.pathname.replace(/\/$/, '') !== new URL(CANVAS).pathname || url.username || url.password) fail('Expected an official MarineVerse canvas URL');
  for (const key of ['state', 'preset', 'step', 'view', 'autoplay']) if (url.searchParams.getAll(key).length > 1) fail(`Duplicate ${key} parameter`);
  return url;
}
function presentation(params) {
  return Object.fromEntries(['step', 'view', 'autoplay'].filter((key) => params.has(key)).map((key) => [key, params.get(key)]));
}
function checkPresentation(p, steps) {
  if (p.step !== undefined && p.step !== 'last' && (!/^[1-9]\d*$/.test(p.step) || Number(p.step) > steps)) fail('step must be last or a one-based step within the scene');
  if (p.view !== undefined && !['all', 'single'].includes(p.view)) fail('view must be all or single');
  if (p.autoplay !== undefined && !['0', '1', 'true', 'false'].includes(p.autoplay)) fail('autoplay must be 0, 1, true or false');
}
export function decode(input) {
  const url = canvasUrl(input);
  const p = presentation(url.searchParams);
  if (!url.searchParams.has('state')) {
    const preset = url.searchParams.get('preset') || 'port-starboard';
    if (!PRESETS.has(preset)) fail(`Unknown preset: ${preset}`);
    checkPresentation(p, PRESET_STEPS[preset]);
    return { preset, presentation: p };
  }
  const state = url.searchParams.get('state');
  if (!state || state.length > MAX_STATE) fail('Missing or oversized custom state');
  const scene = validate(JSON.parse(decodeURIComponent(state)));
  checkPresentation(p, scene.stepCount);
  return { scene, presentation: p };
}
export function encode(scene, options = {}) {
  validate(scene);
  const { from, ...overrides } = options;
  const p = { ...(from ? decode(from).presentation : {}), ...overrides };
  checkPresentation(p, scene.stepCount);
  const url = new URL(CANVAS);
  url.searchParams.set('state', encodeURIComponent(JSON.stringify(scene)));
  for (const key of ['step', 'view', 'autoplay']) if (p[key] !== undefined && p[key] !== 'single' && !(['0', 'false'].includes(p[key]) && key === 'autoplay')) url.searchParams.set(key, p[key]);
  return url.href;
}
export function main(args) {
  const [command, input, ...rest] = args;
  if (!input || !['encode', 'decode', 'validate'].includes(command)) fail('Usage: scene-link.mjs validate FILE | decode URL | encode FILE [--from URL] [--step N|last] [--view all|single] [--autoplay 0|1]');
  const options = {};
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i].replace(/^--/, '');
    if (command !== 'encode' || !['from', 'step', 'view', 'autoplay'].includes(key) || rest[i] !== `--${key}` || rest[i + 1] === undefined || key in options) fail(`Invalid option: ${rest[i]}`);
    options[key] = rest[i + 1];
  }
  if (command === 'decode') return JSON.stringify(decode(input), null, 2);
  const scene = JSON.parse(readFileSync(input, 'utf8'));
  return command === 'encode' ? encode(scene, options) : (validate(scene), 'Valid scene');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(main(process.argv.slice(2))); }
  catch (error) { console.error(`Scene error: ${error.message}`); process.exitCode = 1; }
}
