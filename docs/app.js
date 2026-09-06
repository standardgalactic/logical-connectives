const rows = [[0,0], [0,1], [1,0], [1,1]]

const functions = [
  { bits:'0000', name:'Contradiction', symbol:'⊥', expr:'Y = 0', short:'Always false' },
  { bits:'0001', name:'AND', symbol:'∧', expr:'Y = A ∧ B', short:'Both inputs' },
  { bits:'0010', name:'Nonimplication', symbol:'↛', expr:'Y = A ∧ ¬B', short:'A without B' },
  { bits:'0011', name:'A', symbol:'A', expr:'Y = A', short:'Pass A through' },
  { bits:'0100', name:'Converse nonimplication', symbol:'↚', expr:'Y = ¬A ∧ B', short:'B without A' },
  { bits:'0101', name:'B', symbol:'B', expr:'Y = B', short:'Pass B through' },
  { bits:'0110', name:'XOR', symbol:'⊕', expr:'Y = A ⊕ B', short:'Inputs differ' },
  { bits:'0111', name:'OR', symbol:'∨', expr:'Y = A ∨ B', short:'Either input' },
  { bits:'1000', name:'NOR', symbol:'↓', expr:'Y = ¬(A ∨ B)', short:'Neither input' },
  { bits:'1001', name:'Equivalence', symbol:'↔', expr:'Y = A ↔ B', short:'Inputs agree' },
  { bits:'1010', name:'NOT B', symbol:'¬B', expr:'Y = ¬B', short:'Complement of B' },
  { bits:'1011', name:'Converse implication', symbol:'←', expr:'Y = B → A', short:'If B, then A' },
  { bits:'1100', name:'NOT A', symbol:'¬A', expr:'Y = ¬A', short:'Complement of A' },
  { bits:'1101', name:'Implication', symbol:'→', expr:'Y = A → B', short:'If A, then B' },
  { bits:'1110', name:'NAND', symbol:'↑', expr:'Y = ¬(A ∧ B)', short:'Not both inputs' },
  { bits:'1111', name:'Tautology', symbol:'⊤', expr:'Y = 1', short:'Always true' },
]

const catalog = document.querySelector('.catalog')
const detail = document.querySelector('.detail')
const intro = document.querySelector('.intro')
const back = document.querySelector('.back')
let selected = null
let inputA = 0
let inputB = 0

function card(fn) {
  const button = document.createElement('button')
  button.className = 'gate-card'
  button.type = 'button'
  button.innerHTML = `
    <span class="gate-mark" aria-hidden="true">${fn.symbol}</span>
    <h3>${fn.name}</h3>
    <p>${fn.short} · ${fn.bits}</p>
    <span class="mini-table" aria-label="Outputs ${fn.bits.split('').join(', ')}">
      ${[...fn.bits].map(bit => `<span class="${bit === '1' ? 'on' : ''}">${bit}</span>`).join('')}
    </span>`
  button.addEventListener('click', () => openGate(fn.bits))
  return button
}

for (let rank = 0; rank <= 4; rank++) {
  const members = functions.filter(fn => [...fn.bits].filter(bit => bit === '1').length === rank)
  const group = document.createElement('section')
  group.className = 'rank-group'
  group.setAttribute('aria-labelledby', `rank-${rank}`)
  group.innerHTML = `<div class="rank-heading"><h3 id="rank-${rank}">Rank ${rank}</h3><span>${members.length} ${members.length === 1 ? 'vertex' : 'vertices'} · weight ${rank}</span></div><div class="rank-grid"></div>`
  members.forEach(fn => group.querySelector('.rank-grid').append(card(fn)))
  catalog.append(group)
}

function description(fn) {
  return `<div class="content-card">
    <p class="kicker">Function ${fn.bits}</p>
    <h2>${fn.name}</h2>
    <p class="lede">${sentence(fn)}</p>
    <div class="expression">${fn.expr}</div>
    ${table(fn, -1)}
  </div>`
}

function sentence(fn) {
  const ones = rows.filter((_, i) => fn.bits[i] === '1')
  if (ones.length === 0) return 'This function returns 0 for every possible pair of inputs.'
  if (ones.length === 4) return 'This function returns 1 for every possible pair of inputs.'
  const states = ones.map(([a,b]) => `A = ${a} and B = ${b}`).join(ones.length === 1 ? '' : '; ')
  return `The output is 1 when ${states}. It is 0 for every other input pair.`
}

function table(fn, active) {
  return `<table class="truth-table">
    <caption>Truth table</caption>
    <thead><tr><th scope="col">A</th><th scope="col">B</th><th scope="col">Y</th></tr></thead>
    <tbody>${rows.map(([a,b], i) => `<tr class="${i === active ? 'active-row' : ''}"><td>${a}</td><td>${b}</td><td>${fn.bits[i]}</td></tr>`).join('')}</tbody>
  </table>`
}

function live(fn) {
  const index = inputA * 2 + inputB
  const output = Number(fn.bits[index])
  return `<div class="content-card live-panel">
    <div>
      <p class="kicker">${fn.name} · ${fn.expr}</p>
      <h2>Change the inputs</h2>
    </div>
    <div class="switches">
      ${bitButton('A', inputA)}
      ${bitButton('B', inputB)}
    </div>
    <div class="signal-line ${output ? 'on' : ''}" aria-hidden="true"></div>
    <div class="output ${output ? 'on' : ''}" role="status" aria-live="polite">Output Y<strong>${output}</strong></div>
    ${table(fn, index)}
  </div>`
}

function bitButton(label, value) {
  return `<button type="button" class="bit-switch" data-input="${label}" aria-pressed="${Boolean(value)}"><span>Input ${label}</span><strong>${value}</strong></button>`
}

function openGate(bits, push = true) {
  selected = functions.find(fn => fn.bits === bits) || functions[1]
  intro.hidden = true
  catalog.hidden = true
  detail.hidden = false
  back.style.visibility = 'visible'
  document.querySelector('.topbar h1').textContent = selected.name
  document.querySelector('.description-view').innerHTML = description(selected)
  renderLive()
  setTab('description')
  if (push) history.pushState({ bits }, '', `#${bits}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function renderLive() {
  const node = document.querySelector('.live-view')
  node.innerHTML = live(selected)
  node.querySelectorAll('.bit-switch').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.input === 'A') inputA = 1 - inputA
    else inputB = 1 - inputB
    renderLive()
  }))
}

function closeGate(push = true) {
  selected = null
  detail.hidden = true
  intro.hidden = false
  catalog.hidden = false
  back.style.visibility = 'hidden'
  document.querySelector('.topbar h1').textContent = 'Logical Connectives'
  if (push) history.pushState({}, '', location.pathname)
}

function setTab(view) {
  document.querySelectorAll('.tab').forEach(tab => {
    const active = tab.dataset.view === view
    tab.classList.toggle('active', active)
    tab.setAttribute('aria-selected', active)
  })
  document.querySelector('.description-view').hidden = view !== 'description'
  document.querySelector('.live-view').hidden = view !== 'live'
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setTab(tab.dataset.view)))
back.addEventListener('click', () => closeGate())
document.querySelector('.lattice-button').addEventListener('click', () => closeGate())
window.addEventListener('popstate', () => location.hash ? openGate(location.hash.slice(1), false) : closeGate(false))
if (location.hash) openGate(location.hash.slice(1), false)
