/* Prototype shared logic — Accessible Room Experience (data, state, analytics) */

// ---- Mock SynXis-sourced data (facility tags are open/configurable per property, FR-018) ----
const FACILITY_TAGS = {
  mobility_accessible: {
    label: 'Mobility Accessible',
    icon: '\u267F', // ♿
    reminder: 'Your room features widened doorways, lowered fixtures, and a barrier-free layout throughout.'
  },
  roll_in_shower: {
    label: 'Roll-in Shower',
    icon: '\uD83D\uDEBF', // 🚿
    reminder: 'Your bathroom is equipped with a roll-in shower and grab bars. Let us know ahead of arrival if you also need a shower chair.'
  },
  visual_alarm: {
    label: 'Visual Alarm',
    icon: '\uD83D\uDD14', // 🔔
    reminder: 'Your room includes a visual/strobe alarm notification in addition to the standard audible alarm.'
  },
  hearing_accessible: {
    label: 'Hearing Accessible',
    icon: '\uD83D\uDC42', // 👂
    reminder: 'Your room includes a visual door-knock alert and a closed-caption-capable television.'
  }
};

const ROOM_TYPES = [
  {
    id: 'harbor-king-ada',
    name: 'Harbor Deluxe King — Accessible',
    bed: 'King Bed', view: 'Harbor View',
    price: 4200, currency: 'HKD',
    accessible: true,
    tags: ['mobility_accessible', 'roll_in_shower'],
    desc: 'Ground-floor room with a barrier-free layout, widened doorways, and a roll-in shower. 420 sq ft with harbor views.'
  },
  {
    id: 'classic-queen',
    name: 'Classic Queen Room',
    bed: '2 Queen Beds', view: 'City View',
    price: 3100, currency: 'HKD',
    accessible: false,
    tags: [],
    desc: 'Comfortable room ideal for two guests, featuring a workspace and city skyline views.'
  },
  {
    id: 'garden-suite-ada',
    name: 'Garden Suite — Accessible',
    bed: 'King Bed', view: 'Garden View',
    price: 5600, currency: 'HKD',
    accessible: true,
    tags: ['mobility_accessible', 'roll_in_shower', 'visual_alarm'],
    desc: 'Spacious suite with lowered fixtures, an accessible bathroom, visual alarm notifications, and direct garden access.'
  },
  {
    id: 'executive-twin',
    name: 'Executive Twin Room',
    bed: '2 Twin Beds', view: 'Harbor View',
    price: 3550, currency: 'HKD',
    accessible: false,
    tags: [],
    desc: 'Bright twin room with premium linens and a private balcony overlooking the harbor.'
  },
  {
    id: 'accessible-twin',
    name: 'Accessible Twin Room',
    bed: '2 Twin Beds', view: 'Courtyard View',
    price: 3400, currency: 'HKD',
    accessible: true,
    tags: ['mobility_accessible', 'hearing_accessible'],
    desc: 'Ground-floor twin room with a wheelchair-accessible layout and visual/hearing alert notifications.'
  },
  {
    id: 'premier-king',
    name: 'Premier King Room',
    bed: 'King Bed', view: 'City View',
    price: 3950, currency: 'HKD',
    accessible: false,
    tags: [],
    desc: 'Elevated room on a high floor with a soaking tub and panoramic city views.'
  }
];

const RW = (function () {
  const STORAGE_KEY = 'rw_prototype_state_v1';

  function getState() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function setState(patch) {
    const state = Object.assign(getState(), patch);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function clearBooking() {
    const state = getState();
    delete state.selectedRoom;
    delete state.booking;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // FR-031–FR-039: analytics events pushed to the data layer for Adobe/Google Analytics
  function trackEvent(event, detail) {
    window.dataLayer = window.dataLayer || [];
    const entry = Object.assign({ event: event, timestamp: new Date().toISOString() }, detail || {});
    window.dataLayer.push(entry);
    renderAnalyticsLog();
    return entry;
  }

  function renderAnalyticsLog() {
    const log = document.getElementById('analyticsLog');
    if (!log) return;
    const events = (window.dataLayer || []).slice(-25).reverse();
    log.innerHTML = events.map(function (e) {
      const rest = Object.keys(e).filter(function (k) { return k !== 'event' && k !== 'timestamp'; })
        .map(function (k) { return k + '=' + JSON.stringify(e[k]); }).join(', ');
      const time = e.timestamp.split('T')[1].split('.')[0];
      return '<li><strong>' + e.event + '</strong> <span class="log-time">' + time + '</span>' +
        (rest ? '<br><span class="log-detail">' + rest + '</span>' : '') + '</li>';
    }).join('') || '<li class="log-empty">No events yet.</li>';
  }

  // FR-024/FR-025: Large Font Mode toggle, persists for the browsing session, works from any page
  function initLargeFontMode() {
    const btn = document.getElementById('largeFontToggle');
    function apply(on) {
      document.documentElement.classList.toggle('large-font', on);
      if (btn) btn.setAttribute('aria-pressed', String(on));
    }
    apply(!!getState().largeFont);
    if (btn) {
      btn.addEventListener('click', function () {
        const next = !getState().largeFont;
        setState({ largeFont: next });
        apply(next);
        trackEvent('large_font_mode_toggled', { enabled: next });
      });
    }
  }

  function formatMoney(amount, currency) {
    return currency + ' ' + amount.toLocaleString('en-HK');
  }

  function init() {
    initLargeFontMode();
    renderAnalyticsLog();
  }

  return {
    getState: getState,
    setState: setState,
    clearBooking: clearBooking,
    trackEvent: trackEvent,
    renderAnalyticsLog: renderAnalyticsLog,
    formatMoney: formatMoney,
    init: init,
    FACILITY_TAGS: FACILITY_TAGS,
    ROOM_TYPES: ROOM_TYPES
  };
})();

document.addEventListener('DOMContentLoaded', RW.init);
