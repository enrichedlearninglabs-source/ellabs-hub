/*
 * ELLabs Hub — Firebase adapter
 * ------------------------------------------------------------------
 * The app was first built as a claude.ai artifact, where storage and
 * downloads come from `window.claude.use(...)`. This file provides the
 * same interface on a normal website:
 *   use('db')        → Cloud Firestore (only after a staff member signs in)
 *   use('downloads') → ordinary browser downloads
 * It also runs the Google sign-in screen.
 */
(function () {
  var cfg = window.ELLABS_FIREBASE_CONFIG || {};
  var configured = cfg.apiKey && cfg.apiKey.indexOf('PASTE') !== 0;

  var resolveDb;
  var dbReady = new Promise(function (r) { resolveDb = r; });

  var downloads = {
    save: function (req) {
      var data = req.data;
      var blob = data instanceof Blob ? data : new Blob([data]);
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = req.filename || 'download';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      return Promise.resolve({ status: 'saved' });
    }
  };

  window.claude = {
    use: function (name) {
      if (name === 'db') return dbReady;
      if (name === 'downloads') return Promise.resolve(downloads);
      return Promise.resolve(null);
    }
  };

  function $(id) { return document.getElementById(id); }
  function onReady(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function setMsg(t) { var m = $('login-msg'); if (m) m.textContent = t || ''; }
  function showLogin(msg) {
    var l = $('login'); if (l) l.classList.remove('hidden');
    var logo = document.querySelector('.logo-row img');
    if (logo && $('login-logo')) $('login-logo').src = logo.src;
    var b = $('login-btn'); if (b) b.disabled = !configured;
    setMsg(msg || '');
  }
  function hideLogin(user) {
    var l = $('login'); if (l) l.classList.add('hidden');
    var bar = $('user-bar');
    if (bar) {
      bar.innerHTML = '';
      var span = document.createElement('span');
      span.textContent = 'Signed in as ' + (user.email || user.displayName || 'staff');
      var out = document.createElement('button');
      out.textContent = 'Sign out';
      out.onclick = function () { firebase.auth().signOut().then(function () { location.reload(); }); };
      bar.appendChild(span); bar.appendChild(document.createTextNode('·')); bar.appendChild(out);
    }
  }

  onReady(function () {
    if (!configured) { showLogin('Setup needed: add your Firebase settings to firebase-config.js (see README).'); return; }
    if (!window.firebase) { showLogin('Could not load Firebase. Check your internet connection and reload.'); return; }

    firebase.initializeApp(cfg);
    var auth = firebase.auth();
    var fs = firebase.firestore();
    try { fs.settings({ ignoreUndefinedProperties: true, merge: true }); } catch (e) {}

    $('login-btn').addEventListener('click', function () {
      var btn = $('login-btn'); btn.disabled = true; setMsg('Opening Google sign-in…');
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      auth.signInWithPopup(provider).catch(function (e) {
        if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
          return auth.signInWithRedirect(provider);
        }
        btn.disabled = false;
        setMsg(e && e.code === 'auth/popup-closed-by-user' ? '' : 'Sign-in failed: ' + ((e && e.message) || 'unknown error'));
      });
    });

    auth.onAuthStateChanged(function (user) {
      if (!user) { showLogin(''); return; }
      setMsg('Checking access…');
      // A read proves this account is on the staff list in firestore.rules.
      fs.doc('config/cycle').get().then(function () {
        hideLogin(user);
        resolveDb(fs);
      }).catch(function (e) {
        var denied = e && e.code === 'permission-denied';
        auth.signOut();
        showLogin(denied
          ? (user.email + ' is not on the ELLabs staff list. Ask the administrator to add this email.')
          : 'Could not reach the database: ' + ((e && e.message) || 'unknown error'));
      });
    });
  });
})();
