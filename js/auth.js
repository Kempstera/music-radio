/**
 * Music Radio — Supabase authentication (Phase 1)
 * Email/password sign-in & sign-up through a HIG-style modal, session
 * persistence, and header UI (Sign In button vs. profile chip + Sign Out).
 */
(function () {
  "use strict";

  // supabase-js expects the bare project URL (no /rest/v1/ suffix).
  var SUPABASE_URL = "https://xivobmucjutdfoxmfjxu.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_3-qf8Tpy8aaB8QdvyiR5dg_xx1CzksE";

  var supabase = null;
  var currentUser = null;
  var mode = "signin"; // "signin" | "signup"
  var busy = false;
  var overlay, emailInput, passwordInput, titleEl, subEl,
      submitBtn, switchBtn, errorEl, noteEl;

  function initClient() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { detectSessionInUrl: true }
      });
    } else {
      console.warn("[Music Radio] Supabase JS client (CDN) not loaded — auth disabled.");
    }
  }

  // ---------- header ----------

  function renderHeader() {
    var area = document.getElementById("auth-area");
    if (!area) return;
    area.innerHTML = "";
    if (currentUser) {
      var email = currentUser.email || "";
      var prefix = (email.split("@")[0] || "Profile").slice(0, 18);
      var chip = document.createElement("span");
      chip.className = "auth-chip";
      chip.title = email;
      chip.textContent = prefix;
      var out = document.createElement("button");
      out.className = "auth-signout";
      out.type = "button";
      out.textContent = "Sign Out";
      out.addEventListener("click", signOut);
      area.appendChild(chip);
      area.appendChild(out);
    } else {
      var btn = document.createElement("button");
      btn.className = "auth-signin";
      btn.type = "button";
      btn.textContent = "Sign In";
      btn.addEventListener("click", function () { setMode("signin"); showModal(); });
      area.appendChild(btn);
    }
  }

  // ---------- modal ----------

  function buildModal() {
    overlay = document.createElement("div");
    overlay.id = "auth-overlay";
    overlay.className = "auth-overlay";
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">' +
        '<button class="auth-close" type="button" aria-label="Close">✕</button>' +
        '<h2 class="auth-title" id="auth-title">Welcome back</h2>' +
        '<p class="auth-sub" id="auth-sub">Sign in to continue listening.</p>' +
        '<form id="auth-form" novalidate>' +
          '<label class="auth-label" for="auth-email">Email</label>' +
          '<input class="auth-input" id="auth-email" name="email" type="email" ' +
            'autocomplete="email" placeholder="you@example.com" />' +
          '<label class="auth-label" for="auth-password">Password</label>' +
          '<input class="auth-input" id="auth-password" name="password" type="password" ' +
            'autocomplete="current-password" placeholder="At least 6 characters" />' +
          '<p class="auth-error" id="auth-error" role="alert"></p>' +
          '<p class="auth-note" id="auth-note"></p>' +
          '<button class="auth-submit" id="auth-submit" type="submit">Sign In</button>' +
        '</form>' +
        '<p class="auth-switch"><button type="button" id="auth-switch">New here? Create Account</button></p>' +
      '</div>';
    document.body.appendChild(overlay);

    emailInput = overlay.querySelector("#auth-email");
    passwordInput = overlay.querySelector("#auth-password");
    titleEl = overlay.querySelector("#auth-title");
    subEl = overlay.querySelector("#auth-sub");
    submitBtn = overlay.querySelector("#auth-submit");
    switchBtn = overlay.querySelector("#auth-switch");
    errorEl = overlay.querySelector("#auth-error");
    noteEl = overlay.querySelector("#auth-note");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) hideModal();
    });
    overlay.querySelector(".auth-close").addEventListener("click", hideModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) hideModal();
    });
    switchBtn.addEventListener("click", function () {
      setMode(mode === "signin" ? "signup" : "signin");
    });
    overlay.querySelector("#auth-form").addEventListener("submit", submit);
  }

  function showModal() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(function () { emailInput.focus(); }, 30);
  }

  function hideModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function setMode(m) {
    mode = m;
    var signin = mode === "signin";
    titleEl.textContent = signin ? "Welcome back" : "Create your account";
    subEl.textContent = signin
      ? "Sign in to continue listening."
      : "One account for Classical, Jazz and Vibes.";
    submitBtn.textContent = signin ? "Sign In" : "Create Account";
    switchBtn.textContent = signin
      ? "New here? Create Account"
      : "Already have an account? Sign In";
    passwordInput.setAttribute("autocomplete", signin ? "current-password" : "new-password");
    setError(null);
    setNote(null);
  }

  function setError(msg) {
    if (!msg) { errorEl.hidden = true; errorEl.textContent = ""; return; }
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function setNote(msg) {
    if (!msg) { noteEl.hidden = true; noteEl.textContent = ""; return; }
    noteEl.textContent = msg;
    noteEl.hidden = false;
  }

  function validate(email, password) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    if (!supabase) { setError("Authentication is unavailable. Please reload the page."); return; }
    if (busy) return;
    var email = emailInput.value.trim();
    var password = passwordInput.value;
    var err = validate(email, password);
    if (err) { setError(err); return; }

    busy = true;
    setError(null);
    setNote(null);
    submitBtn.disabled = true;
    submitBtn.textContent = mode === "signin" ? "Signing in…" : "Creating account…";

    try {
      if (mode === "signin") {
        var r1 = await supabase.auth.signInWithPassword({ email: email, password: password });
        if (r1.error) { setError(r1.error.message); return; }
        hideModal();
      } else {
        var r2 = await supabase.auth.signUp({
          email: email,
          password: password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (r2.error) { setError(r2.error.message); return; }
        if (r2.data && r2.data.session) {
          hideModal(); // email confirmation disabled on the project
        } else {
          setMode("signin");
          passwordInput.value = "";
          setNote("Account created! Check your inbox to confirm your email, then sign in.");
        }
      }
    } finally {
      busy = false;
      submitBtn.disabled = false;
      submitBtn.textContent = mode === "signin" ? "Sign In" : "Create Account";
    }
  }

  async function signOut() {
    if (!supabase) return;
    try { await supabase.auth.signOut(); } catch (e) { /* noop */ }
  }

  // ---------- init ----------

  function init() {
    initClient();
    buildModal();
    renderHeader();
    if (!supabase) return;
    supabase.auth.getSession().then(function (res) {
      currentUser = res.data && res.data.session ? res.data.session.user : null;
      renderHeader();
    }).catch(function () { /* noop */ });
    supabase.auth.onAuthStateChange(function (event, session) {
      currentUser = session ? session.user : null;
      renderHeader();
      if (event === "SIGNED_IN") hideModal();
    });
  }

  init();
})();
