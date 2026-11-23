const { test } = require('node:test');
const assert = require('node:assert/strict');
const { projection, indian, beats } = require('./model.ts');
test('daily, annual, saved minutes and calendar use the same duration', () => {
  const p = projection({ daily: ['300'] }, null);
  assert.deepEqual(
    [p.daily, p.limit, p.saved, Math.round(p.days), Math.round(p.regained)],
    [300, 210, 45, 38, 11],
  );
  assert.equal(indian(p.daily * 365), '1,09,500');
});
test('both limits are capped by the reported screen time', () => {
  const p = projection({ daily: ['1000'], screen: ['0'] }, 990);
  assert.equal(p.saved, 0);
  assert.equal(p.atLeast, true);
  assert.equal(projection({}, 10000).limit, 300);
});
test('head reflection always ends with the interest beat', () => {
  assert.equal(beats('head', { symptoms: ['memory', 'focus', 'sleep'] }), 4);
  assert.equal(beats('head', { symptoms: ['skip'] }), 2);
});
