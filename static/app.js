/* ── Vita-Win · app.js ─────────────────────────────────────────────────
   All persistence is localStorage-based and browser-specific.
   No server calls. No external dependencies beyond Bootstrap.
   Key format:  vitawin_YYYY-MM-DD
   Value format: { status: "taken"|"skipped", timestamp: ISO string }
   ──────────────────────────────────────────────────────────────────── */

const STORAGE_PREFIX = "vitawin_";

/* ── Helpers ──────────────────────────────────────────────────────── */

/**
 * Returns today's date string in YYYY-MM-DD (local time).
 * @returns {string}
 */
function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${STORAGE_PREFIX}${yyyy}-${mm}-${dd}`;
}

/**
 * Returns a human-readable date label from a storage key.
 * @param {string} key  e.g. "vitawin_2025-06-01"
 * @returns {string}    e.g. "Sun, Jun 1 2025"
 */
function labelFromKey(key) {
  const dateStr = key.replace(STORAGE_PREFIX, "");
  // Parse as local date to avoid UTC-offset shifting
  const [yyyy, mm, dd] = dateStr.split("-").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats an ISO timestamp to a short local time string.
 * @param {string} iso
 * @returns {string}  e.g. "2:34:07 PM"
 */
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Retrieves all vitawin entries from localStorage, sorted descending by date.
 * @returns {Array<{key: string, status: string, timestamp: string}>}
 */
function getAllEntries() {
  const entries = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith(STORAGE_PREFIX)) continue;
    try {
      const val = JSON.parse(localStorage.getItem(key));
      if (val && val.status && val.timestamp) {
        entries.push({ key, ...val });
      }
    } catch {
      // Corrupt entry — skip silently
    }
  }
  // Sort newest first
  entries.sort((a, b) => b.key.localeCompare(a.key));
  return entries;
}

/* ── Core Actions ─────────────────────────────────────────────────── */

/**
 * Logs today's dose status and refreshes UI.
 * @param {"taken"|"skipped"} status
 */
function logDose(status) {
  const entry = {
    status,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(todayKey(), JSON.stringify(entry));
  renderAll();
}

/**
 * Clears all vitawin entries from localStorage after confirmation.
 */
function clearHistory() {
  if (!window.confirm("Clear all Vita-Win history from this browser?")) return;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  renderAll();
}

/* ── Render ───────────────────────────────────────────────────────── */

/** Refreshes every UI region from the current localStorage state. */
function renderAll() {
  renderStatus();
  renderHistory();
}

/** Updates the status banner and enables/disables action buttons. */
function renderStatus() {
  const banner    = document.getElementById("status-banner");
  const btnTaken  = document.getElementById("btn-taken");
  const btnSkip   = document.getElementById("btn-skipped");
  const tsEl      = document.getElementById("log-timestamp");
  const section   = document.getElementById("action-section");

  const key     = todayKey();
  const raw     = localStorage.getItem(key);
  const entry   = raw ? JSON.parse(raw) : null;

  if (entry) {
    const isTaken = entry.status === "taken";
    banner.className = `alert mb-0 ${isTaken ? "alert-success" : "alert-warning"}`;
    banner.textContent = isTaken
      ? "✓ Vitamins logged as TAKEN today."
      : "✗ Vitamins logged as SKIPPED today.";

    // Disable both buttons — today is already logged
    btnTaken.disabled = true;
    btnSkip.disabled  = true;

    tsEl.textContent = `Logged at ${formatTime(entry.timestamp)}`;
  } else {
    banner.className = "alert mb-0 alert-secondary";
    banner.textContent = "No entry logged yet for today. Log your dose below.";
    btnTaken.disabled = false;
    btnSkip.disabled  = false;
    tsEl.textContent  = "";
  }
}

/** Rebuilds the history table from localStorage. */
function renderHistory() {
  const tbody   = document.getElementById("history-tbody");
  const entries = getAllEntries();

  if (entries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-muted">No history recorded yet.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = entries
    .map(({ key, status, timestamp }) => {
      const isTaken     = status === "taken";
      const badgeClass  = isTaken ? "bg-success" : "bg-secondary";
      const label       = isTaken ? "Taken" : "Skipped";
      return `
        <tr>
          <td>${labelFromKey(key)}</td>
          <td><span class="badge ${badgeClass}">${label}</span></td>
          <td class="text-muted small">${formatTime(timestamp)}</td>
        </tr>`;
    })
    .join("");
}

/* ── Init ─────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  // Populate nav date
  const navDate = document.getElementById("nav-date");
  if (navDate) {
    navDate.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Footer year
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderAll();
});