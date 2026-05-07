'use strict';

(function () {
  var PROFILE_KEY = 'ca_public_reader_profile';
  var NOTES_KEY = 'ca_public_reader_notes';
  var SOURCES_KEY = 'ca_public_reader_sources';

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json);
    } catch (_) {
      return fallback;
    }
  }

  function initReaderMode() {
    var panel = document.getElementById('reader-mode-panel');
    if (!panel) return;

    var profileRaw = localStorage.getItem(PROFILE_KEY);
    if (!profileRaw) return;

    var profile = safeParse(profileRaw, null);
    if (!profile || !profile.nombre) return;

    var nameEl = document.getElementById('reader-mode-name');
    var notesEl = document.getElementById('reader-mode-notes');
    var logoutBtn = document.getElementById('reader-mode-logout');
    var sourceInputs = panel.querySelectorAll('input[name="reader-source"]');

    panel.hidden = false;
    nameEl.textContent = profile.nombre;

    var savedNotes = localStorage.getItem(NOTES_KEY);
    if (savedNotes) {
      notesEl.value = savedNotes;
    }

    var savedSources = safeParse(localStorage.getItem(SOURCES_KEY), []);
    if (Array.isArray(savedSources)) {
      sourceInputs.forEach(function (input) {
        input.checked = savedSources.indexOf(input.value) !== -1;
      });
    }

    notesEl.addEventListener('input', function () {
      localStorage.setItem(NOTES_KEY, notesEl.value);
    });

    sourceInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        var selected = [];
        sourceInputs.forEach(function (node) {
          if (node.checked) selected.push(node.value);
        });
        localStorage.setItem(SOURCES_KEY, JSON.stringify(selected));
      });
    });

    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(NOTES_KEY);
      localStorage.removeItem(SOURCES_KEY);
      sessionStorage.removeItem('ca_auth');
      window.location.href = 'login.html';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReaderMode);
  } else {
    initReaderMode();
  }
})();
