import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const source = fs.readFileSync(new URL('../docs/app.js', import.meta.url), 'utf8')
const block = source.match(/const functions = \[(.*?)\n\]/s)
assert.ok(block, 'canonical function catalogue exists')

const functions = vm.runInNewContext(`[${block[1]}]`)
assert.equal(functions.length, 16)
assert.equal(new Set(functions.map(f => f.bits)).size, 16)
assert.equal(
  JSON.stringify(Array.from(functions, f => f.bits).sort()),
  JSON.stringify(Array.from({length: 16}, (_, n) => n.toString(2).padStart(4, '0')))
)
assert.deepEqual(
  [0, 1, 2, 3, 4].map(rank => Array.from(functions, f => f.bits).filter(bits => [...bits].filter(bit => bit === '1').length === rank).length),
  [1, 4, 6, 4, 1]
)
assert.equal(functions.find(f => f.name === 'AND').bits, '0001')
assert.equal(functions.find(f => f.name === 'OR').bits, '0111')
assert.equal(functions.find(f => f.name === 'NAND').bits, '1110')
assert.equal(functions.find(f => f.name === 'NOR').bits, '1000')
assert.equal(functions.find(f => f.name === 'XOR').bits, '0110')
assert.equal(functions.find(f => f.name === 'Equivalence').bits, '1001')
assert.ok(functions.every(f => /^[01]{4}$/.test(f.bits)))
console.log('16 canonical Boolean functions verified')
