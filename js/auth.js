/**
 * Music Radio — Supabase authentication (Phase 1, i18n-aware)
 * Email/password sign-in & sign-up through a HIG-style modal, session
 * persistence, and header UI (Sign In button vs. profile chip + Sign Out).
 * All UI strings render through I18N and re-render on language change.
 */
(function () {
  "use strict";

  // supabase-js expects the bare project URL (no /rest/v1/ suffix).
  var SUPABASE_URL = "https://xivobmucjutdfoxmfjxu.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_3-qf8Tpy8aaB8QdvyiR5dg_xx1CzksE";

  // English fallback so the UI still works if i18n.js fails to load.
  var EN = {
    "auth.sign_in": "Sign In",
    "auth.sign_up": "Sign Up",
    "auth.create_account": "Create Account",
    "auth.sign_out": "Sign Out",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.my_profile": "My Profile",
    "auth.welcome_back": "Welcome back",
    "auth.signin_sub": "Sign in to continue listening.",
    "auth.signup_title": "Create your account",
    "auth.signup_sub": "One account for Classical, Jazz and Vibes.",
    "auth.email_placeholder": "you@example.com",
    "auth.password_placeholder": "At least 6 characters",
    "auth.new_here": "New here? Create Account",
    "auth.have_account": "Already have an account? Sign In",
    "auth.signing_in": "Signing in…",
    "auth.creating": "Creating account…",
    "auth.check_inbox": "Check your inbox",
    "auth.signup_success": "Registration successful! Please check your inbox and click the confirmation link to activate your account.",
    "auth.back_to_signin": "Back to Sign In",
    "auth.close": "Close",
    "auth.err_invalid_email": "Please enter a valid email address.",
    "auth.err_short_password": "Password must be at least 6 characters.",
    "auth.err_unavailable": "Authentication is unavailable. Please reload the page."
  };

  var supabase = null;
  var currentUser = null;
  var mode = "signin"; // "signin" | "signup"
  var busy = false;
  var busyKey = null;       // spinner button label key while a request is in flight
  var errorKey = null;      // localizable validation error key
  var errorRaw = null;      // dynamic server error text (not translated)
  var successOpen = false;  // email-confirmation success panel visible

  var overlay, emailInput, passwordInput, titleEl, subEl,
      submitBtn, switchBtn, errorEl, noteEl, closeBtn, emailLabel, passwordLabel,
      formEl, switchWrap, successEl, successMsg, backBtn;

  function t(key, vars) {
    if (window.I18N && window.I18N.t) return window.I18N.t(key, vars);
    var s = EN[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(vars[k]);
      });
    }
    return s;
  }

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
      chip.setAttribute("aria-label", t("auth.my_profile") + ": " + email);
      chip.textContent = prefix;
      var out = document.createElement("button");
      out.className = "auth-signout";
      out.type = "button";
      out.textContent = t("auth.sign_out");
      out.addEventListener("click", signOut);
      area.appendChild(chip);
      area.appendChild(out);
    } else {
      var btn = document.createElement("button");
      btn.className = "auth-signin";
      btn.type = "button";
      btn.textContent = t("auth.sign_in");
      btn.addEventListener("click", function () { showForm("signin"); showModal(); });
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
        '<button class="auth-close" id="auth-close" type="button">✕</button>' +
        '<h2 class="auth-title" id="auth-title"></h2>' +
        '<p class="auth-sub" id="auth-sub"></p>' +
        '<form id="auth-form" novalidate>' +
          '<label class="auth-label" id="auth-email-label" for="auth-email"></label>' +
          '<input class="auth-input" id="auth-email" name="email" type="email" autocomplete="email" />' +
          '<label class="auth-label" id="auth-password-label" for="auth-password"></label>' +
          '<input class="auth-input" id="auth-password" name="password" type="password" autocomplete="current-password" />' +
          '<p class="auth-error" id="auth-error" role="alert"></p>' +
          '<p class="auth-note" id="auth-note"></p>' +
          '<button class="auth-submit" id="auth-submit" type="submit"></button>' +
        '</form>' +
        '<p class="auth-switch" id="auth-switch-wrap"><button type="button" id="auth-switch"></button></p>' +
        '<div class="auth-success" id="auth-success" hidden>' +
          '<div class="auth-success-badge" aria-hidden="true">✓</div>' +
          '<p class="auth-success-msg" id="auth-success-msg"></p>' +
          '<button class="auth-submit" id="auth-back-to-signin" type="button"></button>' +
        '</div>' +
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
    closeBtn = overlay.querySelector("#auth-close");
    emailLabel = overlay.querySelector("#auth-email-label");
    passwordLabel = overlay.querySelector("#auth-password-label");
    formEl = overlay.querySelector("#auth-form");
    switchWrap = overlay.querySelector("#auth-switch-wrap");
    successEl = overlay.querySelector("#auth-success");
    successMsg = overlay.querySelector("#auth-success-msg");
    backBtn = overlay.querySelector("#auth-back-to-signin");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) hideModal();
    });
    closeBtn.addEventListener("click", hideModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) hideModal();
    });
    switchBtn.addEventListener("click", function () {
      setMode(mode === "signin" ? "signup" : "signin");
    });
    backBtn.addEventListener("click", function () {
      showForm("signin");
    });
    formEl.addEventListener("submit", submit);

    applyModalTexts();
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

  function showForm(m) {
    successOpen = false;
    successEl.hidden = true;
    formEl.hidden = false;
    switchWrap.hidden = false;
    setMode(m);
  }

  function showSuccess() {
    successOpen = true;
    formEl.hidden = true;
    switchWrap.hidden = true;
    successEl.hidden = false;
    applyModalTexts();
  }

  function setMode(m) {
    mode = m;
    var signin = mode === "signin";
    passwordInput.setAttribute("autocomplete", signin ? "current-password" : "new-password");
    setError(null);
    setNote(null);
    applyModalTexts();
  }

  function applyModalTexts() {
    if (!overlay) return;
    var signin = mode === "signin";
    closeBtn.setAttribute("aria-label", t("auth.close"));
    if (successOpen) {
      titleEl.textContent = t("auth.check_inbox");
      subEl.hidden = true;
      successMsg.textContent = t("auth.signup_success");
      backBtn.textContent = t("auth.back_to_signin");
      return;
    }
    subEl.hidden = false;
    titleEl.textContent = t(signin ? "auth.welcome_back" : "auth.signup_title");
    subEl.textContent = t(signin ? "auth.signin_sub" : "auth.signup_sub");
    emailLabel.textContent = t("auth.email");
    passwordLabel.textContent = t("auth.password");
    emailInput.placeholder = t("auth.email_placeholder");
    passwordInput.placeholder = t("auth.password_placeholder");
    submitBtn.textContent = busyKey ? t(busyKey) : t(signin ? "auth.sign_in" : "auth.create_account");
    switchBtn.textContent = t(signin ? "auth.new_here" : "auth.have_account");
    renderError();
  }

  function renderError() {
    if (errorKey) errorEl.textContent = t(errorKey);
    else if (errorRaw) errorEl.textContent = errorRaw;
    errorEl.hidden = !(errorKey || errorRaw);
  }

  function setError(keyOrNull, raw) {
    errorKey = keyOrNull;
    errorRaw = raw || null;
    renderError();
  }

  function setNote(msg) {
    if (!msg) { noteEl.hidden = true; noteEl.textContent = ""; return; }
    noteEl.textContent = msg;
    noteEl.hidden = false;
  }

  function setBusy(on, key) {
    busy = on;
    busyKey = on ? key : null;
    submitBtn.disabled = on;
    applyModalTexts();
  }

  function validate(email, password) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "auth.err_invalid_email";
    }
    if (!password || password.length < 6) {
      return "auth.err_short_password";
    }
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    if (!supabase) { setError("auth.err_unavailable"); return; }
    if (busy) return;
    var email = emailInput.value.trim();
    var password = passwordInput.value;
    var err = validate(email, password);
    if (err) { setError(err); return; }

    setBusy(true, mode === "signin" ? "auth.signing_in" : "auth.creating");
    setError(null);
    setNote(null);

    try {
      if (mode === "signin") {
        var r1 = await supabase.auth.signInWithPassword({ email: email, password: password });
        if (r1.error) { setError(null, r1.error.message); return; }
        clearFields();
        hideModal();
      } else {
        var r2 = await supabase.auth.signUp({
          email: email,
          password: password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (r2.error) { setError(null, r2.error.message); return; }
        if (r2.data && r2.data.session) {
          clearFields();
          hideModal(); // email confirmation disabled on the project
        } else {
          // Success: user created, email confirmation pending. Clear inputs and
          // show the check-your-inbox panel — never try to auto sign in.
          clearFields();
          showSuccess();
        }
      }
    } finally {
      setBusy(false, null);
    }
  }

  function clearFields() {
    emailInput.value = "";
    passwordInput.value = "";
  }

  async function signOut() {
    if (!supabase) return;
    try { await supabase.auth.signOut(); } catch (e) { /* noop */ }
  }

  // ---------- init ----------

  function onLangChange() {
    renderHeader();
    applyModalTexts();
  }

  function init() {
    initClient();
    buildModal();
    renderHeader();
    document.addEventListener("langchange", onLangChange);
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
