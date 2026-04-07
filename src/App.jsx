import { useState, useEffect, useRef } from 'react'
import './App.css'
import GlowStackLogo from './GlowStackLogo.jsx'

// ── Constants ──────────────────────────────────────────────────────────────

const ACTIVES = ['AHA', 'BHA', 'Retinol', 'Vitamin C', 'Niacinamide', 'Benzoyl Peroxide', 'Peptides', 'SPF']

const CONFLICT_RULES = [
  { a: 'Retinol', b: 'AHA', message: 'Over-exfoliation risk', suggestion: 'Alternate nights' },
  { a: 'Retinol', b: 'BHA', message: 'Over-exfoliation risk', suggestion: 'Alternate nights' },
  { a: 'Retinol', b: 'Benzoyl Peroxide', message: 'Deactivates retinol', suggestion: 'Alternate nights' },
  { a: 'Vitamin C', b: 'AHA', message: 'pH conflict reduces efficacy', suggestion: '30 min gap or separate routines' },
  { a: 'Vitamin C', b: 'BHA', message: 'pH conflict reduces efficacy', suggestion: '30 min gap or separate routines' },
  { a: 'Niacinamide', b: 'Vitamin C', message: 'May reduce efficacy', suggestion: 'Monitor skin response', advisory: true },
  { a: 'Benzoyl Peroxide', b: 'Retinol', message: 'Deactivates retinol', suggestion: 'Alternate nights' },
]

const GOAL_ACTIVES = {
  Hydration: ['Peptides', 'SPF'],
  'Anti-aging': ['Retinol', 'Peptides', 'Vitamin C', 'SPF'],
  'Acne control': ['BHA', 'Niacinamide', 'Benzoyl Peroxide'],
  Brightening: ['Vitamin C', 'AHA', 'Niacinamide'],
  'Barrier repair': ['Peptides', 'Niacinamide'],
}

// Patterns used to detect actives from raw ingredients text
const ACTIVE_PATTERNS = {
  AHA: /\b(glycolic acid|lactic acid|mandelic acid|tartaric acid|citric acid|alpha.?hydroxy)\b/i,
  BHA: /\b(salicylic acid|beta.?hydroxy)\b/i,
  Retinol: /\b(retinol|retinal|retinoic acid|retinaldehyde|retinyl palmitate|retinyl acetate|vitamin a)\b/i,
  'Vitamin C': /\b(ascorbic acid|ascorbyl|vitamin c|sodium ascorbyl phosphate|magnesium ascorbyl)\b/i,
  Niacinamide: /\b(niacinamide|nicotinamide)\b/i,
  'Benzoyl Peroxide': /\b(benzoyl peroxide)\b/i,
  Peptides: /\b(peptide|palmitoyl|tripeptide|hexapeptide|oligopeptide|acetyl tetrapeptide|matrixyl|argireline)\b/i,
  SPF: /\b(avobenzone|octinoxate|octisalate|oxybenzone|zinc oxide|titanium dioxide|homosalate|octocrylene|bemotrizinol|bisoctrizole)\b/i,
}

function detectActivesFromText(text) {
  if (!text) return []
  return ACTIVES.filter((active) => ACTIVE_PATTERNS[active]?.test(text))
}

const ACTIVE_EXPLANATIONS = {
  AHA: 'exfoliates dead skin cells for a brighter complexion',
  BHA: 'unclogs pores and reduces breakouts',
  Retinol: 'boosts cell turnover and reduces fine lines',
  'Vitamin C': 'brightens skin tone and fights free radicals',
  Niacinamide: 'balances oil production and strengthens the skin barrier',
  'Benzoyl Peroxide': 'kills acne-causing bacteria',
  Peptides: 'support collagen production and improve hydration',
  SPF: 'protects against UV damage and premature aging',
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'My Products' },
  { id: 'routine', label: 'My Routine' },
  { id: 'goals', label: 'Skin Goals' },
  { id: 'account', label: 'Account' },
]

function NavIcon({ id, active }) {
  const base = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none',
    'aria-hidden': true,
    style: { flexShrink: 0 },
  }
  const stroke = {
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (id === 'dashboard') {
    // Active: four filled rounded squares; Inactive: same squares, outline only
    const rects = [
      { x: 2,   y: 2   },
      { x: 8.5, y: 2   },
      { x: 2,   y: 8.5 },
      { x: 8.5, y: 8.5 },
    ]
    return (
      <svg {...base}>
        {rects.map((r) =>
          active ? (
            <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width="5.5" height="5.5" rx="1.5" fill="#C2477A" />
          ) : (
            <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width="5.5" height="5.5" rx="1.5" fill="none" {...stroke} />
          )
        )}
      </svg>
    )
  }

  if (id === 'products') {
    return (
      <svg {...base}>
        <path d="M6 2h4M8 2v3M5 5h6l1 8H4L5 5z" {...stroke} />
        <path d="M6.5 8.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" {...stroke} />
      </svg>
    )
  }

  if (id === 'routine') {
    return (
      <svg {...base}>
        <path d="M2 4.5h12M2 8h9M2 11.5h7" {...stroke} />
        <circle cx="12" cy="11.5" r="2" {...stroke} />
      </svg>
    )
  }

  if (id === 'goals') {
    return (
      <svg {...base}>
        <circle cx="8" cy="8" r="6" {...stroke} />
        <circle cx="8" cy="8" r="3" {...stroke} />
        <circle cx="8" cy="8" r="1" fill="currentColor" />
      </svg>
    )
  }

  if (id === 'account') {
    return (
      <svg {...base}>
        <circle cx="8" cy="5" r="2.5" {...stroke} />
        <path d="M3 14c0-2.8 2.2-4 5-4s5 1.2 5 4" {...stroke} />
      </svg>
    )
  }

  return null
}

const PAGE_META = {
  dashboard: { title: 'Dashboard', sub: "Here's your skincare summary." },
  products: { title: 'My Products', sub: 'Manage your skincare cabinet.' },
  routine: { title: 'My Routine', sub: 'Build your AM and PM routines.' },
  goals: { title: 'Skin Goals', sub: 'Track progress toward your skin goals.' },
  account: { title: 'Account', sub: 'Your profile and settings.' },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveState(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function checkConflicts(routineProducts) {
  const ingredientSet = new Set()
  const ingredientToProducts = {}

  routineProducts.forEach((p) => {
    p.ingredients.forEach((ing) => {
      ingredientSet.add(ing)
      if (!ingredientToProducts[ing]) ingredientToProducts[ing] = []
      ingredientToProducts[ing].push(p.id)
    })
  })

  const conflicts = []
  const seen = new Set()

  CONFLICT_RULES.forEach((rule) => {
    if (ingredientSet.has(rule.a) && ingredientSet.has(rule.b)) {
      const key = [rule.a, rule.b].sort().join('+')
      if (!seen.has(key)) {
        seen.add(key)
        const affectedProductIds = new Set([
          ...(ingredientToProducts[rule.a] || []),
          ...(ingredientToProducts[rule.b] || []),
        ])
        conflicts.push({ ...rule, affectedProductIds: [...affectedProductIds] })
      }
    }
  })

  return conflicts
}

function scoreGoals(products, selectedGoals) {
  const allIngredients = new Set(products.flatMap((p) => p.ingredients))
  return selectedGoals.map((goal) => {
    const required = GOAL_ACTIVES[goal]
    const present = required.filter((a) => allIngredients.has(a))
    const missing = required.filter((a) => !allIngredients.has(a))
    return { goal, score: Math.round((present.length / required.length) * 100), present, missing }
  })
}

// ── Shared components ──────────────────────────────────────────────────────

function Sidebar({ active, onNav, isOpen, onClose }) {
  function handleNav(id) {
    onNav(id)
    onClose()
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <GlowStackLogo style={{ height: 40, width: 'auto', flexShrink: 0 }} />
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        <nav className="nav-section" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <NavIcon id={item.id} active={isActive} />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">K</div>
            <div className="user-info">
              <div className="user-name">Kitty</div>
              <div className="user-role">Skincare enthusiast</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function ConflictBanner({ conflicts }) {
  if (!conflicts.length) return null
  return (
    <div className="conflict-banner" role="alert" aria-live="polite">
      <div className="conflict-banner-title">⚠ Ingredient Conflicts Detected</div>
      {conflicts.map((c, i) => (
        <div key={i} className="conflict-item">
          <strong>{c.a} + {c.b}:</strong> {c.message}. Suggestion: {c.suggestion}.
          {c.advisory && <span className="advisory-pill">Advisory only</span>}
        </div>
      ))}
    </div>
  )
}

// ── Pages ──────────────────────────────────────────────────────────────────

function Dashboard({ products, amRoutine, pmRoutine, selectedGoals, onNav }) {
  const amProducts = products.filter((p) => amRoutine.includes(p.id))
  const pmProducts = products.filter((p) => pmRoutine.includes(p.id))
  const allRoutineProducts = [...new Map([...amProducts, ...pmProducts].map((p) => [p.id, p])).values()]
  const conflicts = checkConflicts(allRoutineProducts)
  const goalScores = scoreGoals(products, selectedGoals)
  const activeRoutines = (amRoutine.length > 0 ? 1 : 0) + (pmRoutine.length > 0 ? 1 : 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <div className="dash-greeting">
        <span>{greeting}, Kitty ✨</span>
      </div>

      <ConflictBanner conflicts={conflicts} />

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-sub">in your cabinet</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Routines</div>
          <div className="stat-value">{activeRoutines}</div>
          <div className="stat-sub">of 2 (AM + PM)</div>
        </div>
        <div className="stat-card" style={conflicts.length > 0 ? { borderColor: '#F5C4B3' } : {}}>
          <div className="stat-label">Conflicts Flagged</div>
          <div className="stat-value" style={{ color: conflicts.length > 0 ? '#993C1D' : undefined }}>
            {conflicts.length}
          </div>
          <div className="stat-sub">{conflicts.length > 0 ? 'needs attention' : 'all clear'}</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Goals Tracked</div>
          <div className="stat-value">{selectedGoals.length}</div>
          <div className="stat-sub">skin goals active</div>
        </div>
      </div>

      {goalScores.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Skin Goals Summary</span>
            <button className="card-action" onClick={() => onNav('goals')}>View all</button>
          </div>
          <div className="card-body">
            <div className="goals-list">
              {goalScores.map((gs) => (
                <div key={gs.goal} className="goal-row">
                  <div className="goal-row-top">
                    <span className="goal-name">{gs.goal}</span>
                    <span className="goal-pct" aria-hidden="true">{gs.score}%</span>
                  </div>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    aria-valuenow={gs.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${gs.goal}: ${gs.score}%`}
                  >
                    <div className="progress-fill" style={{ width: `${gs.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">AM Routine</span>
            <button className="card-action" onClick={() => onNav('routine')}>Edit</button>
          </div>
          {amProducts.length === 0 ? (
            <div className="empty-state">No AM products yet.</div>
          ) : (
            <div className="routine-list">
              {amProducts.map((p, i) => (
                <div key={p.id} className="routine-item">
                  <span className="step-num">{i + 1}</span>
                  <span className="routine-name">{p.name}</span>
                  <div className="ingredient-tags">
                    {p.ingredients.map((ing) => (
                      <span key={ing} className="ing-tag">{ing}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">PM Routine</span>
            <button className="card-action" onClick={() => onNav('routine')}>Edit</button>
          </div>
          {pmProducts.length === 0 ? (
            <div className="empty-state">No PM products yet.</div>
          ) : (
            <div className="routine-list">
              {pmProducts.map((p, i) => (
                <div key={p.id} className="routine-item">
                  <span className="step-num">{i + 1}</span>
                  <span className="routine-name">{p.name}</span>
                  <div className="ingredient-tags">
                    {p.ingredients.map((ing) => (
                      <span key={ing} className="ing-tag">{ing}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ProductsPage({ products, onAdd, onDelete }) {
  // Search state
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [tag, setTag] = useState('am')
  const [formError, setFormError] = useState('')

  const searchRef = useRef(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function onPointerDown(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function handleQueryChange(e) {
    const val = e.target.value
    setQuery(val)
    setSearchError('')
    setManualMode(false)

    clearTimeout(debounceRef.current)

    if (!val.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      setSearching(false)
      return
    }

    setSearching(true)
    setShowDropdown(true)

    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      fetch(
        `https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(val)}&json=1&page_size=8&fields=product_name,brands,ingredients_text`,
        { signal: controller.signal }
      )
        .then((r) => r.json())
        .then((data) => {
          const products = (data.products || []).filter((p) => p.product_name)
          setSearchResults(products)
          setShowDropdown(true)
          setSearching(false)
        })
        .catch((err) => {
          if (err.name === 'AbortError') return
          setSearchError('Search failed. You can add the product manually below.')
          setSearching(false)
          setShowDropdown(false)
        })
    }, 400)
  }

  function handleSelectResult(result) {
    const detected = detectActivesFromText(result.ingredients_text || '')
    setName(result.product_name || '')
    setBrand(result.brands || '')
    setSelectedIngredients(detected)
    setQuery('')
    setShowDropdown(false)
    setSearchResults([])
    setManualMode(true)
  }

  function handleManualMode() {
    setShowDropdown(false)
    setManualMode(true)
  }

  function toggleIngredient(ing) {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    )
  }

  function handleAdd() {
    if (!name.trim()) { setFormError('Please enter a product name.'); return }
    if (selectedIngredients.length === 0) { setFormError('Please select at least one active ingredient.'); return }
    setFormError('')
    onAdd({ name: name.trim(), brand: brand.trim(), ingredients: selectedIngredients, tag })
    setName('')
    setBrand('')
    setSelectedIngredients([])
    setTag('am')
    setManualMode(false)
    setQuery('')
  }

  function handleReset() {
    setManualMode(false)
    setName('')
    setBrand('')
    setSelectedIngredients([])
    setFormError('')
    setQuery('')
    setSearchResults([])
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Add Product</span>
          {manualMode && (
            <button className="card-action" onClick={handleReset}>← Back to search</button>
          )}
        </div>
        <div className="card-body form-body">

          {/* ── Search bar ── */}
          {!manualMode && (
            <div className="form-group search-group" ref={searchRef}>
              <label htmlFor="product-search" className="form-label">Search Open Beauty Facts</label>
              <div className="search-input-wrap">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input
                  id="product-search"
                  className="form-input search-input"
                  placeholder="Search by product name…"
                  value={query}
                  onChange={handleQueryChange}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={showDropdown}
                  aria-controls="search-dropdown"
                  role="combobox"
                />
                {searching && <span className="search-spinner" role="status" aria-label="Searching…" />}
              </div>

              {searchError && <div className="form-error" role="alert">{searchError}</div>}

              {showDropdown && (
                <div className="search-dropdown" id="search-dropdown" role="listbox">
                  {searching && searchResults.length === 0 && (
                    <div className="dropdown-status">Searching…</div>
                  )}
                  {!searching && searchResults.length === 0 && query.trim() && (
                    <div className="dropdown-status">No results found.</div>
                  )}
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      className="dropdown-item"
                      onPointerDown={() => handleSelectResult(r)}
                      type="button"
                    >
                      <span className="dropdown-name">{r.product_name}</span>
                      {r.brands && <span className="dropdown-brand">{r.brands}</span>}
                    </button>
                  ))}
                  <button className="dropdown-manual" onPointerDown={handleManualMode} type="button">
                    Not finding your product? Add manually
                  </button>
                </div>
              )}

              {!showDropdown && !query && (
                <button className="manual-link" onClick={handleManualMode} type="button">
                  Prefer to add manually?
                </button>
              )}
            </div>
          )}

          {/* ── Product form (shown after selecting a result or going manual) ── */}
          {manualMode && (
            <>
              <div className="form-group">
                <label htmlFor="product-name" className="form-label">Product Name</label>
                <input
                  id="product-name"
                  className="form-input"
                  placeholder="e.g. The Ordinary Retinol 1%"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-brand" className="form-label">Brand <span className="form-label-opt">(optional)</span></label>
                <input
                  id="product-brand"
                  className="form-input"
                  placeholder="e.g. The Ordinary"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" id="actives-label">Active Ingredients</label>
                {selectedIngredients.length > 0 && (
                  <div className="detected-note">
                    Detected from ingredients list — review and adjust as needed.
                  </div>
                )}
                <div className="ingredient-picker" aria-labelledby="actives-label" role="group">
                  {ACTIVES.map((ing) => (
                    <button
                      key={ing}
                      className={`ing-btn ${selectedIngredients.includes(ing) ? 'selected' : ''}`}
                      onClick={() => toggleIngredient(ing)}
                      type="button"
                      aria-pressed={selectedIngredients.includes(ing)}
                    >
                      {ing}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" id="routine-tag-label">Use in Routine</label>
                <div className="tag-picker" role="group" aria-labelledby="routine-tag-label">
                  {['am', 'pm', 'both'].map((t) => (
                    <button
                      key={t}
                      className={`tag-btn tag-btn-${t} ${tag === t ? 'selected' : ''}`}
                      onClick={() => setTag(t)}
                      type="button"
                      aria-pressed={tag === t}
                    >
                      <span aria-hidden="true">{t === 'am' ? '☀' : t === 'pm' ? '☾' : '✦'}</span>
                      {' '}{t === 'am' ? 'AM' : t === 'pm' ? 'PM' : 'Both'}
                    </button>
                  ))}
                </div>
              </div>

              {formError && <div className="form-error" role="alert">{formError}</div>}

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdd}>
                + Add Product
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">My Cabinet</span>
          <span className="card-sub">{products.length} product{products.length !== 1 ? 's' : ''}</span>
        </div>
        {products.length === 0 ? (
          <div className="empty-state">No products yet. Add your first one!</div>
        ) : (
          <div className="product-cabinet">
            {products.map((p) => (
              <div key={p.id} className="cabinet-item">
                <div className="cabinet-item-main">
                  <div className="cabinet-name">{p.name}</div>
                  {p.brand && <div className="cabinet-brand">{p.brand}</div>}
                  <div className="cabinet-meta">
                    <span className={`routine-tag tag-${p.tag}`}>{p.tag.toUpperCase()}</span>
                    <div className="ingredient-tags">
                      {p.ingredients.map((ing) => (
                        <span key={ing} className="ing-tag">{ing}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => onDelete(p.id)} aria-label="Delete product">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RoutinePage({ products, amRoutine, pmRoutine, onUpdateRoutine }) {
  const [view, setView] = useState('am')

  const routine = view === 'am' ? amRoutine : pmRoutine
  const setRoutine = (ids) => onUpdateRoutine(view, ids)

  const routineProducts = routine.map((id) => products.find((p) => p.id === id)).filter(Boolean)
  const availableProducts = products.filter((p) => !routine.includes(p.id))
  const conflicts = checkConflicts(routineProducts)
  const conflictProductIds = new Set(conflicts.flatMap((c) => c.affectedProductIds))

  function addToRoutine(productId) {
    setRoutine([...routine, productId])
  }

  function removeFromRoutine(productId) {
    setRoutine(routine.filter((id) => id !== productId))
  }

  function moveUp(index) {
    if (index === 0) return
    const r = [...routine]
    ;[r[index - 1], r[index]] = [r[index], r[index - 1]]
    setRoutine(r)
  }

  function moveDown(index) {
    if (index === routine.length - 1) return
    const r = [...routine]
    ;[r[index], r[index + 1]] = [r[index + 1], r[index]]
    setRoutine(r)
  }

  return (
    <>
      <div className="view-tabs" role="group" aria-label="Routine view">
        <button
          className={`view-tab ${view === 'am' ? 'active' : ''}`}
          onClick={() => setView('am')}
          aria-pressed={view === 'am'}
        >
          <span aria-hidden="true">☀</span> AM Routine
        </button>
        <button
          className={`view-tab ${view === 'pm' ? 'active' : ''}`}
          onClick={() => setView('pm')}
          aria-pressed={view === 'pm'}
        >
          <span aria-hidden="true">☾</span> PM Routine
        </button>
      </div>

      <ConflictBanner conflicts={conflicts} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">{view === 'am' ? '☀ AM' : '☾ PM'} Steps</span>
            <span className="card-sub">{routineProducts.length} product{routineProducts.length !== 1 ? 's' : ''}</span>
          </div>
          {routineProducts.length === 0 ? (
            <div className="empty-state">Add products from the panel on the right.</div>
          ) : (
            <div className="routine-steps">
              {routine.map((id, i) => {
                const p = products.find((prod) => prod.id === id)
                if (!p) return null
                const hasConflict = conflictProductIds.has(p.id)
                return (
                  <div key={id} className={`step-item ${hasConflict ? 'has-conflict' : ''}`}>
                    <span className="step-num">{i + 1}</span>
                    <div className="step-info">
                      <div className="step-name">
                        {p.name}
                        {hasConflict && <span className="conflict-badge">⚠ Conflict</span>}
                      </div>
                      <div className="ingredient-tags">
                        {p.ingredients.map((ing) => (
                          <span key={ing} className="ing-tag">{ing}</span>
                        ))}
                      </div>
                    </div>
                    <div className="step-actions">
                      <button className="icon-btn" onClick={() => moveUp(i)} disabled={i === 0} aria-label={`Move ${p.name} up`}>↑</button>
                      <button className="icon-btn" onClick={() => moveDown(i)} disabled={i === routine.length - 1} aria-label={`Move ${p.name} down`}>↓</button>
                      <button className="icon-btn remove" onClick={() => removeFromRoutine(id)} aria-label={`Remove ${p.name} from routine`}>✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Add to Routine</span>
          </div>
          {availableProducts.length === 0 ? (
            <div className="empty-state">
              {products.length === 0
                ? 'Add products in My Products first.'
                : 'All products are already in this routine.'}
            </div>
          ) : (
            <div className="available-list">
              {availableProducts.map((p) => (
                <div key={p.id} className="available-item">
                  <div className="available-info">
                    <div className="available-name">{p.name}</div>
                    <div className="available-meta">
                      <span className={`routine-tag tag-${p.tag}`}>{p.tag.toUpperCase()}</span>
                      <div className="ingredient-tags">
                        {p.ingredients.map((ing) => (
                          <span key={ing} className="ing-tag">{ing}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => addToRoutine(p.id)}>+ Add</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function GoalsPage({ products, selectedGoals, onToggleGoal }) {
  const goalScores = scoreGoals(products, selectedGoals)
  const allGoals = Object.keys(GOAL_ACTIVES)

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Skin Goals</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Select the goals you want to work toward.
          </p>
          <div className="goals-picker" role="group" aria-label="Skin goals">
            {allGoals.map((goal) => (
              <button
                key={goal}
                className={`goal-btn ${selectedGoals.includes(goal) ? 'selected' : ''}`}
                onClick={() => onToggleGoal(goal)}
                aria-pressed={selectedGoals.includes(goal)}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {goalScores.length > 0 && (
          <>
            <div className="card-divider" />
            <div className="card-header">
              <span className="card-title">Progress</span>
            </div>
            <div className="card-body">
              <div className="goals-list">
                {goalScores.map((gs) => (
                  <div key={gs.goal} className="goal-row">
                    <div className="goal-row-top">
                      <span className="goal-name">{gs.goal}</span>
                      <span className="goal-pct" aria-hidden="true">{gs.score}%</span>
                    </div>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      aria-valuenow={gs.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${gs.goal}: ${gs.score}%`}
                    >
                      <div className="progress-fill" style={{ width: `${gs.score}%` }} />
                    </div>
                    {/* ✓/✕ prefix means status is conveyed by text, not color alone */}
                    <div className="active-chips" aria-label={`Required actives for ${gs.goal}`}>
                      {GOAL_ACTIVES[gs.goal].map((a) => (
                        <span
                          key={a}
                          className={`active-chip ${gs.present.includes(a) ? 'have' : 'missing'}`}
                        >
                          {gs.present.includes(a) ? '✓ ' : '✕ '}{a}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Suggestions</span>
        </div>
        {selectedGoals.length === 0 ? (
          <div className="empty-state">Select goals on the left to see suggestions.</div>
        ) : goalScores.every((gs) => gs.missing.length === 0) ? (
          <div className="empty-state success-state">All your goals are well-covered!</div>
        ) : (
          <div className="suggestions-list">
            {goalScores
              .filter((gs) => gs.missing.length > 0)
              .map((gs) => (
                <div key={gs.goal} className="suggestion-card">
                  <div className="suggestion-goal">{gs.goal}</div>
                  <div className="suggestion-label">Consider adding:</div>
                  {gs.missing.map((a) => (
                    <div key={a} className="suggestion-active">
                      <span className="suggestion-ing">{a}</span>
                      <span className="suggestion-desc"> — {ACTIVE_EXPLANATIONS[a]}</span>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AccountPage() {
  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Profile</span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 32, paddingBottom: 32 }}>
          <div className="profile-avatar">K</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)' }}>Kitty</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Skincare enthusiast</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">About GlowStack</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            GlowStack helps you build a safe, effective skincare routine by tracking your products,
            detecting ingredient conflicts, and guiding you toward your skin goals.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, marginTop: 12 }}>
            All your data is stored locally in your browser — nothing is sent to any server.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [products, setProducts] = useState(() => loadState('gc_products', []))
  const [amRoutine, setAmRoutine] = useState(() => loadState('gc_am_routine', []))
  const [pmRoutine, setPmRoutine] = useState(() => loadState('gc_pm_routine', []))
  const [selectedGoals, setSelectedGoals] = useState(() => loadState('gc_goals', []))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => { saveState('gc_products', products) }, [products])
  useEffect(() => { saveState('gc_am_routine', amRoutine) }, [amRoutine])
  useEffect(() => { saveState('gc_pm_routine', pmRoutine) }, [pmRoutine])
  useEffect(() => { saveState('gc_goals', selectedGoals) }, [selectedGoals])

  function addProduct(product) {
    setProducts((prev) => [...prev, { ...product, id: Date.now() }])
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setAmRoutine((prev) => prev.filter((pid) => pid !== id))
    setPmRoutine((prev) => prev.filter((pid) => pid !== id))
  }

  function updateRoutine(view, ids) {
    if (view === 'am') setAmRoutine(ids)
    else setPmRoutine(ids)
  }

  function toggleGoal(goal) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const meta = PAGE_META[activePage]

  return (
    <div className="app">
      <Sidebar
        active={activePage}
        onNav={setActivePage}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
          <div className="topbar-title">
            <h2>{meta.title}</h2>
            <p>{meta.sub}</p>
          </div>
        </header>
        <main className="content">
          {activePage === 'dashboard' && (
            <Dashboard
              products={products}
              amRoutine={amRoutine}
              pmRoutine={pmRoutine}
              selectedGoals={selectedGoals}
              onNav={setActivePage}
            />
          )}
          {activePage === 'products' && (
            <ProductsPage products={products} onAdd={addProduct} onDelete={deleteProduct} />
          )}
          {activePage === 'routine' && (
            <RoutinePage
              products={products}
              amRoutine={amRoutine}
              pmRoutine={pmRoutine}
              onUpdateRoutine={updateRoutine}
            />
          )}
          {activePage === 'goals' && (
            <GoalsPage products={products} selectedGoals={selectedGoals} onToggleGoal={toggleGoal} />
          )}
          {activePage === 'account' && <AccountPage />}
        </main>
      </div>
    </div>
  )
}
