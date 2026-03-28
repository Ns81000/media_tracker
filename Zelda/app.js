/* ─────────────────────────────────────────────────────────
   ZELDA GUIDE — app.js
   Handles: tab switching · card building · expand/collapse
───────────────────────────────────────────────────────── */

// ─── HELPERS ────────────────────────────────────────────

function getPCClass(pcText) {
  if (!pcText) return '';
  if (pcText.includes('✅')) return 'pc-great';
  if (pcText.includes('⚠️')) return 'pc-try';
  return 'pc-no';
}

function getTierClass(game) {
  if (game.tierClass) return game.tierClass;
  // Infer from tier string if set
  if (game.tier) {
    const t = game.tier.toLowerCase();
    if (t.includes('tier 1')) return 'tier1';
    if (t.includes('tier 2')) return 'tier2';
    if (t.includes('tier 3')) return 'tier3';
    if (t.includes('tier 4')) return 'tier4';
    if (t.includes('tier 5')) return 'tier5';
    if (t.includes('tier 6')) return 'tier6';
  }
  return 'tier6';
}

const TIER_LABELS = {
  tier1: '✦ Tier 1 — Best Looking, Runs Great',
  tier2: '✦ Tier 2 — Remasters, Still Look Great',
  tier3: '✦ Tier 3 — 3DS Originals, Clean & Playable',
  tier4: '✦ Tier 4 — GameCube / Wii Era via Dolphin',
  tier5: '✦ Tier 5 — GBA / DS Originals',
  tier6: '✦ Tier 6 — SNES / NES Originals',
};

// ─── CARD HTML BUILDER ───────────────────────────────────

function buildCardHTML(game, showTierBadge = false) {
  const tc = getTierClass(game);
  const pcClass = getPCClass(game.yourPC);

  return `
    <div class="game-card ${tc}" data-id="${game.id}">
      <div class="card-summary">
        <div class="card-top">
          <span class="card-year-badge">${game.year}</span>
          <span class="card-pc-badge">${game.yourPC || ''}</span>
        </div>
        <div class="card-title">${game.title}</div>
        <div class="card-platform-row">
          <span class="emulator-tag">${game.emulator}</span>
        </div>
        <p class="card-desc">${game.shortDesc}</p>
        <div class="card-expand-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <div class="card-details">
        <div class="card-details-inner">

          <div class="detail-row">
            <span class="detail-label">Platform</span>
            <span class="detail-value">${game.platform}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Style</span>
            <span class="detail-value">${game.style}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Campaign</span>
            <span class="detail-value">${game.campaign}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Protagonist</span>
            <span class="detail-value">${game.protagonist}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Timeline</span>
            <span class="detail-value">${game.timelineBranch}</span>
          </div>

          <div class="detail-divider"></div>

          <div class="detail-row">
            <span class="detail-label">Your PC</span>
            <span class="detail-value ${pcClass}">${game.yourPC}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Performance Note</span>
            <span class="detail-value">${game.pcNote}</span>
          </div>

          <div class="detail-divider"></div>

          <div class="detail-block">
            <span class="detail-label">Story Role</span>
            <span class="detail-value">${game.storyRole}</span>
          </div>

          <div class="detail-block">
            <span class="detail-label">Gameplay Notes</span>
            <span class="detail-value">${game.expandDetails}</span>
          </div>

          <div class="connects-to-box">
            <strong>↳ Connects to</strong>
            ${game.connectsTo}
          </div>

        </div>
      </div>
    </div>
  `;
}

// ─── SECTION 1: VISUAL ORDER ─────────────────────────────

function renderVisualSection() {
  const container = document.getElementById('section-visual');

  // Group by tier
  const tierOrder = ['tier1','tier2','tier3','tier4','tier5','tier6'];
  const groups = {};
  tierOrder.forEach(t => groups[t] = []);

  GAMES.byVisual.forEach(g => {
    const tc = getTierClass(g);
    if (groups[tc]) groups[tc].push(g);
  });

  let html = `
    <div class="section-header">
      <h2>Best-Looking &amp; Smoothest First</h2>
      <p>Every Zelda game, ordered by visual quality and performance on your RDNA2 iGPU. Start at Tier 1 and work your way down — by the time you reach Tier 6 you will understand exactly why those games matter.</p>
    </div>
  `;

  tierOrder.forEach(tc => {
    if (!groups[tc].length) return;
    html += `<div class="tier-group">`;
    html += `<div class="tier-label ${tc}">${TIER_LABELS[tc]}</div>`;
    html += `<div class="games-grid">`;

    groups[tc].forEach((game, i) => {
      html += buildCardHTML(game);
      // Timeline connector between cards within same tier (not after last)
      if (i < groups[tc].length - 1) {
        // connector is rendered between grid items in CSS — skip inline connector
      }
    });

    html += `</div></div>`;
  });

  // -- SPIN-OFFS --
  if (GAMES.spinoffs && GAMES.spinoffs.length > 0) {
    html += `
      <div class="spinoff-section">
        <h3>✦ Spin-offs: Actually Worth Playing</h3>
        <p style="margin-bottom: 24px; color: var(--parchment-dark); font-style: italic;">While not part of the canonical timeline paths above, these titles offer exceptional gameplay and music that any Zelda fan should experience.</p>
        <div class="games-grid">
    `;
    GAMES.spinoffs.forEach(game => {
      html += buildCardHTML(game);
    });
    html += `</div></div>`;
  }

  container.innerHTML = html;
  attachCardListeners(container);
}

// ─── SECTION 2: RELEASE ORDER ────────────────────────────

function renderReleaseSection() {
  const container = document.getElementById('section-release');

  // Group by year
  const yearMap = {};
  GAMES.byRelease.forEach(entry => {
    if (!yearMap[entry.year]) yearMap[entry.year] = [];
    yearMap[entry.year].push(entry);
  });

  let html = `
    <div class="section-header">
      <h2>Release Order</h2>
      <p>Every game in the order it was published. Remasters and HD versions are noted alongside their originals. Click any card to expand full details.</p>
    </div>
  `;

  const years = Object.keys(yearMap).sort((a,b) => a - b);

  years.forEach(year => {
    html += `<div class="release-year-group">`;
    html += `<div class="release-year-label">${year}</div>`;
    html += `<div class="release-list">`;

    yearMap[year].forEach(entry => {
      // Is it a pointer to original version?
      if (entry.isOriginal) {
        const base = GAMES.lookup[entry.refId];
        if (!base) return;
        const tc = getTierClass(base);
        html += `
          <div class="release-card ${tc} original-flag" data-id="${entry.refId}">
            <div class="release-card-header">
              <div>
                <div class="release-card-title">${entry.originalTitle}</div>
                <p class="original-note">Original release — HD/Remaster version available · Click to see full details</p>
              </div>
              <span class="card-pc-badge">${base.yourPC}</span>
            </div>
            <div class="release-card-meta">
              <span class="emulator-tag">${entry.originalEmulator}</span>
            </div>
          </div>
        `;
      } else {
        const game = GAMES.lookup[entry.id];
        if (!game) return;
        const tc = getTierClass(game);
        html += `
          <div class="release-card ${tc}" data-id="${game.id}">
            <div class="release-card-header">
              <div>
                <div class="release-card-title">${game.title}</div>
                <p class="card-desc" style="margin-top:6px;font-style:italic;color:var(--parchment-deep);font-size:0.92rem;">${game.shortDesc}</p>
              </div>
              <span class="card-pc-badge">${game.yourPC}</span>
            </div>
            <div class="release-card-meta">
              <span class="emulator-tag">${game.emulator}</span>
            </div>
          </div>
        `;
      }
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
  attachReleaseCardListeners(container);
}

// ─── SECTION 3: CHRONOLOGICAL ────────────────────────────

function renderChronoSection() {
  const container = document.getElementById('section-chrono');

  let html = `
    <div class="section-header">
      <h2>In-Universe Chronological Order</h2>
      <p>The official timeline from <em>Hyrule Historia</em>. Ocarina of Time splits everything into three branches simultaneously. Post-timeline games are placed after all branches intentionally by Nintendo.</p>
    </div>
  `;

  GAMES.byChronological.forEach(branch => {
    html += `
      <div class="branch-group">
        <div class="branch-header">
          <div class="branch-dot" style="background:${branch.color}; color:${branch.color};"></div>
          <div class="branch-name">${branch.branch}</div>
        </div>
        <div class="branch-games" style="--branch-color: ${branch.color};">
    `;

    branch.games.forEach((entry, i) => {
      const game = GAMES.lookup[entry.id];
      if (!game) return;
      const tc = getTierClass(game);

      html += `
        <div class="chrono-card" style="--branch-color:${branch.color};">
          <div class="game-card ${tc}" data-id="${game.id}">
            <div class="card-summary">
              <div class="card-top">
                <span class="card-year-badge">${game.year}</span>
                <span class="card-pc-badge">${game.yourPC}</span>
              </div>
              <div class="card-title">${game.title}</div>
              <div class="card-platform-row">
                <span class="emulator-tag">${game.emulator}</span>
              </div>
              <p class="card-desc">${game.shortDesc}</p>
              <div class="chrono-note">${entry.chronNote}</div>
              <div class="card-expand-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <div class="card-details">
              <div class="card-details-inner">
                <div class="detail-row">
                  <span class="detail-label">Platform</span>
                  <span class="detail-value">${game.platform}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Style</span>
                  <span class="detail-value">${game.style}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Campaign</span>
                  <span class="detail-value">${game.campaign}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Protagonist</span>
                  <span class="detail-value">${game.protagonist}</span>
                </div>
                <div class="detail-divider"></div>
                <div class="detail-row">
                  <span class="detail-label">Your PC</span>
                  <span class="detail-value ${getPCClass(game.yourPC)}">${game.yourPC}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Performance</span>
                  <span class="detail-value">${game.pcNote}</span>
                </div>
                <div class="detail-divider"></div>
                <div class="detail-block">
                  <span class="detail-label">Story Role</span>
                  <span class="detail-value">${game.storyRole}</span>
                </div>
                <div class="detail-block">
                  <span class="detail-label">Gameplay Notes</span>
                  <span class="detail-value">${game.expandDetails}</span>
                </div>
                <div class="connects-to-box">
                  <strong>↳ Connects to</strong>
                  ${game.connectsTo}
                </div>
              </div>
            </div>
          </div>
          ${i < branch.games.length - 1 ? `
            <div class="timeline-connector">
              <div class="timeline-arrow" style="background:${branch.color}; opacity:0.5;"></div>
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
  attachCardListeners(container);
}

// ─── EVENT LISTENERS ─────────────────────────────────────

function attachCardListeners(container) {
  container.querySelectorAll('.game-card').forEach(card => {
    card.querySelector('.card-summary').addEventListener('click', () => {
      const wasExpanded = card.classList.contains('expanded');
      // Collapse all in this container
      container.querySelectorAll('.game-card.expanded').forEach(c => c.classList.remove('expanded'));
      if (!wasExpanded) card.classList.add('expanded');
    });
  });
}

function attachReleaseCardListeners(container) {
  container.querySelectorAll('.release-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const game = GAMES.lookup[id];
      if (!game) return;
      // Open modal overlay
      openModal(game);
    });
  });
}

// ─── MODAL (for release section click-through) ───────────

function openModal(game) {
  const tc = getTierClass(game);
  const pcClass = getPCClass(game.yourPC);

  const modal = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');

  body.innerHTML = `
    <div class="modal-header">
      <div class="card-year-badge" style="color:var(--gold-dim);font-family:'Cinzel',serif;font-size:0.75rem;letter-spacing:0.1em;">${game.year}</div>
      <h2 style="font-family:'Cinzel',serif;font-size:clamp(1.2rem,3vw,1.8rem);color:var(--parchment);margin:6px 0 4px;">${game.title}</h2>
      <div style="margin-bottom:12px;"><span class="emulator-tag">${game.emulator}</span></div>
    </div>

    <p style="font-style:italic;color:var(--parchment-dark);font-size:1rem;line-height:1.6;margin-bottom:16px;">${game.shortDesc}</p>

    <div class="detail-divider"></div>

    <div class="detail-row"><span class="detail-label">Platform</span><span class="detail-value">${game.platform}</span></div>
    <div class="detail-row"><span class="detail-label">Style</span><span class="detail-value">${game.style}</span></div>
    <div class="detail-row"><span class="detail-label">Campaign</span><span class="detail-value">${game.campaign}</span></div>
    <div class="detail-row"><span class="detail-label">Protagonist</span><span class="detail-value">${game.protagonist}</span></div>
    <div class="detail-row"><span class="detail-label">Timeline</span><span class="detail-value">${game.timelineBranch}</span></div>
    <div class="detail-row"><span class="detail-label">Your PC</span><span class="detail-value ${pcClass}">${game.yourPC}</span></div>
    <div class="detail-row"><span class="detail-label">Performance</span><span class="detail-value">${game.pcNote}</span></div>

    <div class="detail-divider"></div>

    <div class="detail-block" style="margin-bottom:12px;">
      <span class="detail-label" style="display:block;margin-bottom:4px;">Story Role</span>
      <span class="detail-value">${game.storyRole}</span>
    </div>

    <div class="detail-block" style="margin-bottom:12px;">
      <span class="detail-label" style="display:block;margin-bottom:4px;">Gameplay Notes</span>
      <span class="detail-value">${game.expandDetails}</span>
    </div>

    <div class="connects-to-box">
      <strong>↳ Connects to</strong>
      ${game.connectsTo}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── TAB SWITCHING ───────────────────────────────────────

function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.section-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('section-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

// ─── INIT ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderVisualSection();
  renderReleaseSection();
  renderChronoSection();
  initTabs();

  // Modal close
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});
