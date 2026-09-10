'use strict';

// ── Recipe data ────────────────────────────────────────────────
// Each ingredient: { qty: number (per serving), unit, name, prep, group }
// qty is relative to 1 serving; BASE_SERVINGS is the recipe's default.
const BASE_SERVINGS = 4;

const INGREDIENTS = [
  // Chicken
  { group: 'Chicken',     qty: 0.25,  unit: '',        name: 'whole chicken',   prep: '~1.8 kg / 4 lb each' },
  // Herb butter
  { group: 'Herb Butter', qty: 15,    unit: 'g',       name: 'unsalted butter', prep: 'softened' },
  { group: 'Herb Butter', qty: 0.5,   unit: '',        name: 'lemon',           prep: 'zested' },
  { group: 'Herb Butter', qty: 0.5,   unit: 'cloves',  name: 'garlic',          prep: 'minced' },
  { group: 'Herb Butter', qty: 0.5,   unit: 'tsp',     name: 'fresh thyme',     prep: 'leaves stripped' },
  { group: 'Herb Butter', qty: 0.25,  unit: 'tsp',     name: 'flaky sea salt',  prep: '' },
  { group: 'Herb Butter', qty: 0.125, unit: 'tsp',     name: 'black pepper',    prep: 'freshly ground' },
  // Cavity
  { group: 'Cavity',      qty: 0.25,  unit: '',        name: 'lemon',           prep: 'halved' },
  { group: 'Cavity',      qty: 0.25,  unit: '',        name: 'head of garlic',  prep: 'halved crosswise' },
  { group: 'Cavity',      qty: 0.5,   unit: 'sprigs',  name: 'fresh thyme',     prep: '' },
];

// ── Fraction formatting ────────────────────────────────────────
const FRACTIONS = [
  [1, 8, '⅛'], [1, 4, '¼'], [1, 3, '⅓'],
  [3, 8, '⅜'], [1, 2, '½'], [5, 8, '⅝'],
  [2, 3, '⅔'], [3, 4, '¾'], [7, 8, '⅞'],
];

function formatQty(n) {
  if (n === 0) return '—';
  const whole = Math.floor(n);
  const frac  = n - whole;

  let fracStr = '';
  if (frac > 0.01) {
    let best = null, bestDiff = Infinity;
    for (const [num, den, sym] of FRACTIONS) {
      const diff = Math.abs(frac - num / den);
      if (diff < bestDiff) { bestDiff = diff; best = sym; }
    }
    fracStr = bestDiff < 0.09 ? best : `.${Math.round(frac * 10) / 10}`.slice(1);
  }

  if (whole === 0) return fracStr || '<1';
  return fracStr ? `${whole}${fracStr}` : `${whole}`;
}

function formatQtyVerbose(n, unit, name) {
  const q = formatQty(n);
  const u = unit ? ` ${unit}` : '';
  return `${q}${u} ${name}`.trim();
}

// ── Ingredient rendering ───────────────────────────────────────
let currentServings = BASE_SERVINGS;

function renderIngredients(servings) {
  const list = document.getElementById('ingredient-list');
  let html = '';
  let lastGroup = null;

  for (const ing of INGREDIENTS) {
    if (ing.group !== lastGroup) {
      html += `<li class="ingredient-group-label" role="presentation" aria-hidden="true">${ing.group}</li>`;
      lastGroup = ing.group;
    }

    const scaledQty  = ing.qty * servings;
    const displayQty = formatQty(scaledQty);
    const verboseQty = formatQtyVerbose(scaledQty, ing.unit, ing.name);
    const unit       = ing.unit ? ` ${ing.unit}` : '';
    const prepSpan   = ing.prep
      ? `<span class="sr-only">(${ing.prep})</span>`
      : '';

    html += `
      <li class="ingredient-item">
        <span class="ingredient-name">${ing.name}${prepSpan}</span>
        <span class="ingredient-qty" aria-label="${verboseQty}">${displayQty}${unit}</span>
      </li>`;
  }

  list.innerHTML = html;
}

// ── Live-region announcements ──────────────────────────────────
let announceTimer = null;

function announce(servings) {
  const region = document.getElementById('live-region');
  region.textContent = '';          // force re-announcement even for same value
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    region.textContent =
      `Quantities updated for ${servings} ${servings === 1 ? 'serving' : 'servings'}.`;
  }, 50);
}

// ── Servings control ───────────────────────────────────────────
function applyServings(servings) {
  servings = Math.max(1, Math.min(99, servings));
  currentServings = servings;
  document.getElementById('servings-input').value = servings;
  document.getElementById('btn-decrease').disabled = servings <= 1;
  document.getElementById('btn-increase').disabled = servings >= 99;
  renderIngredients(servings);
  announce(servings);
}

function changeServings(delta) {
  applyServings(currentServings + delta);
}

function onServingsInput() {
  const input = document.getElementById('servings-input');
  const val   = parseInt(input.value, 10);
  if (!isNaN(val) && val >= 1 && val <= 99) {
    applyServings(val);
  }
}

// ── Tab management ─────────────────────────────────────────────
const TABS = [
  { tab: 'tab-ingredients', panel: 'panel-ingredients' },
  { tab: 'tab-method',      panel: 'panel-method'      },
];

function selectTab(index) {
  const narrow = window.matchMedia('(max-width: 640px)').matches;

  TABS.forEach(({ tab, panel }, i) => {
    const tabEl   = document.getElementById(tab);
    const panelEl = document.getElementById(panel);
    const active  = i === index;

    tabEl.setAttribute('aria-selected', active ? 'true' : 'false');
    tabEl.tabIndex = active ? 0 : -1;

    if (active || !narrow) {
      panelEl.removeAttribute('hidden');
    } else {
      panelEl.setAttribute('hidden', '');
    }
  });
}

function initTabs() {
  const tabBar = document.getElementById('tab-bar');

  tabBar.addEventListener('keydown', (e) => {
    const current = TABS.findIndex(
      ({ tab }) => document.getElementById(tab) === document.activeElement
    );
    if (current === -1) return;

    let next = current;
    if      (e.key === 'ArrowRight') next = (current + 1) % TABS.length;
    else if (e.key === 'ArrowLeft')  next = (current - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home')       next = 0;
    else if (e.key === 'End')        next = TABS.length - 1;
    else return;

    e.preventDefault();
    selectTab(next);
    document.getElementById(TABS[next].tab).focus();
  });

  TABS.forEach(({ tab }, i) => {
    document.getElementById(tab).addEventListener('click', () => selectTab(i));
  });

  // Re-evaluate panel visibility when crossing the breakpoint
  window.matchMedia('(max-width: 640px)').addEventListener('change', () => {
    const currentActive = TABS.findIndex(
      ({ tab }) => document.getElementById(tab).getAttribute('aria-selected') === 'true'
    );
    selectTab(currentActive === -1 ? 0 : currentActive);
  });
}

// ── Expose handlers to HTML (onclick / oninput attributes) ─────
window.changeServings  = changeServings;
window.onServingsInput = onServingsInput;

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderIngredients(BASE_SERVINGS);
  initTabs();
  selectTab(0);
});
