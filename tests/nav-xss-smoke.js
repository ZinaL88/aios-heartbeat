const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const nav = require('../aios-nav.js');

for (const raw of ['javascript:alert(1)', '  JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>']) {
  assert.equal(nav.safeHttpUrl(raw), '');
  assert.equal(nav.base({ getItem: () => raw }), '');
}
assert.equal(nav.base({ getItem: () => 'https://sitroom.example/' }), 'https://sitroom.example');

// Exercise the actual map helper with a DOM stub that forbids HTML parsing.
const source = fs.readFileSync(path.join(__dirname, '../map.html'), 'utf8');
const start = source.indexOf('    function buildCardJump(');
const end = source.indexOf('    function selectJob(', start);
assert.ok(start >= 0 && end > start);
assert.match(source, /id="cardJump"><\/div>/);
assert.match(source, /buildCardJump\(\$\("cardJump"\), building.code \|\| building.id\)/);
function element(tag) {
  return {
    tag, childNodes: [],
    appendChild(child) { this.childNodes.push(child); },
    set innerHTML(value) { assert.fail('HTML parsing is forbidden'); }
  };
}
let stored = 'javascript:alert(1)';
const context = {
  window: { AIOSNav: { ...nav, base: () => nav.base({ getItem: () => stored }) } },
  document: { createElement: element, createTextNode: text => ({ textContent: text }) }
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
const task = '\"><img src=x onerror=alert(1)>';
let container = element('div');
context.buildCardJump(container, task);
assert.equal(container.childNodes.length, 1);
assert.equal(container.childNodes[0].href, 'index.html?task=' + encodeURIComponent(task));
assert.equal(container.childNodes[0].textContent, 'Board');

stored = 'https://sitroom.example/\" onmouseover=\"alert(1)';
container = element('div');
context.buildCardJump(container, task);
const anchors = container.childNodes.filter(child => child.tag === 'a');
assert.equal(anchors.length, 3);
for (const anchor of anchors.slice(1)) {
  assert.ok(anchor.href.startsWith('https://sitroom.example/'));
  assert.equal(anchor.target, '_blank');
  assert.equal(anchor.rel, 'noopener');
}
context.window.AIOSNav = undefined;
context.buildCardJump(element('div'), task);
console.log('nav XSS smoke checks passed');
