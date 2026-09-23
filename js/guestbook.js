/**
 * Music Radio — Guestbook (Supabase `guestbook` table)
 * HIG-style glassmorphism modal: message form on top, scrollable feed below.
 * Works for anonymous guests and authenticated users (user_id attached).
 * Fully i18n-aware (6 languages); all user content rendered via textContent.
 */
(function () {
  "use strict";

  var SUPABASE_URL = "https://xivobmucjutdfoxmfjxu.supabase.co";
  var SUPABASE_ANON_KEY = "***";
  var FEED_LIMIT = 50;

  // English fallback so the UI still works if i18n.js fails to load.
  var EN = {
    "guestbook.title": "Guestbook",
    "guestbook.leave_msg": "Leave a message...",
    "guestbook.name": "Name (Optional)",
    "guestbook.message": "Message",
    "guestbook.submit": "Submit",
    "guestbook.guest": "Guest",
    "guestbook.loading": "Loading messages…",
    "guestbook.empty": "No messages yet. Be the first to leave one!",
    "guestbook.err_load": "Could not load messages.",
    "guestbook.err_post": "Could not post your message. Please try again.",
    "guestbook.msg_required": "Please write a message."
  };

  var supabase = null;
  var currentUser = null;
  var messages = [];
  var busy = false;
  var errorKey = null;

  var overlay, nameInput, msgInput, feedEl, errEl, submitBtn, titleEl, subEl,
      nameLabel, msgLabel, closeBtn;

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

  function emailPrefix() {
    var email = currentUser && currentUser.email ? currentUser.email : "";
    return email.split("@")[0] || "";
  }

  function initClient() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.warn("[Music Radio] Supabase JS client (CDN) not loaded — guestbook disabled.");
    }
  }

  // ---------- modal ----------

  function buildModal() {
    overlay = document.createElement("div");
    overlay.id = "guestbook-overlay";
    overlay.className = "guestbook-overlay";
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="guestbook-modal" role="dialog" aria-modal="true" aria-labelledby="gb-title">' +
        '<button class="auth-close" id="gb-close" type="button">✕</button>' +
        '<div class="guestbook-head">' +
          '<h2 class="guestbook-title" id="gb-title"></h2>' +
          '<p class="guestbook-sub" id="gb-sub"></p>' +
        '</div>' +
        '<div class="guestbook-body">' +
          '<form class="guestbook-form" id="gb-form" novalidate>' +
            '<label class="auth-label" id="gb-name-label" for="gb-name"></label>' +
            '<input class="auth-input" id="gb-name" type="text" autocomplete="name" />' +
            '<label class="auth-label" id="gb-msg-label" for="gb-msg"></label>' +
            '<textarea class="auth-input gb-textarea" id="gb-msg" rows="3"></textarea>' +
            '<p class="auth-error" id="gb-error" role="alert"></p>' +
            '<button class="auth-submit" id="gb-submit" type="submit"></button>' +
          '</form>' +
          '<div class="gb-feed" id="gb-feed" aria-live="polite"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    nameInput = overlay.querySelector("#gb-name");
    msgInput = overlay.querySelector("#gb-msg");
    feedEl = overlay.querySelector("#gb-feed");
    errEl = overlay.querySelector("#gb-error");
    submitBtn = overlay.querySelector("#gb-submit");
    titleEl = overlay.querySelector("#gb-title");
    subEl = overlay.querySelector("#gb-sub");
    nameLabel = overlay.querySelector("#gb-name-label");
    msgLabel = overlay.querySelector("#gb-msg-label");
    closeBtn = overlay.querySelector("#gb-close");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) hideModal();
    });
    closeBtn.addEventListener("click", hideModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) hideModal();
    });
    overlay.querySelector("#gb-form").addEventListener("submit", onSubmit);

    applyTexts();
    renderFeed();
  }

  function showModal() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    refreshSession().then(function () {
      if (currentUser) {
        nameInput.value = emailPrefix();
        nameInput.readOnly = true;
      } else {
        nameInput.readOnly = false;
        if (!nameInput.value) nameInput.value = "";
      }
      if (!messages.length && supabase) fetchMessages();
    });
    window.setTimeout(function () { msgInput.focus(); }, 30);
  }

  function hideModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function applyTexts() {
    if (!overlay) return;
    titleEl.textContent = t("guestbook.title");
    subEl.textContent = t("guestbook.leave_msg");
    nameLabel.textContent = t("guestbook.name");
    msgLabel.textContent = t("guestbook.message");
    nameInput.placeholder = t("guestbook.guest");
    submitBtn.textContent = t("guestbook.submit");
    closeBtn.setAttribute("aria-label", t("auth.close"));
    renderError();
  }

  function renderError() {
    errEl.textContent = errorKey ? t(errorKey) : "";
    errEl.hidden = !errorKey;
  }

  function setError(keyOrNull) {
    errorKey = keyOrNull;
    renderError();
  }

  // ---------- feed ----------

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var locale = (window.I18N && window.I18N.getLang()) || undefined;
    try {
      return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return d.toLocaleDateString();
    }
  }

  function itemEl(m) {
    var wrap = document.createElement("div");
    wrap.className = "gb-item";
    var head = document.createElement("div");
    head.className = "gb-item-head";
    var name = document.createElement("span");
    name.className = "gb-item-name";
    name.textContent = m.name || t("guestbook.guest");
    var time = document.createElement("span");
    time.className = "gb-item-time";
    time.textContent = formatDate(m.created_at);
    head.appendChild(name);
    head.appendChild(time);
    var text = document.createElement("p");
    text.className = "gb-item-text";
    text.textContent = m.content;
    wrap.appendChild(head);
    wrap.appendChild(text);
    return wrap;
  }

  function renderFeed() {
    if (!feedEl) return;
    feedEl.innerHTML = "";
    if (!messages.length) {
      var empty = document.createElement("p");
      empty.className = "gb-empty";
      empty.textContent = t("guestbook.empty");
      feedEl.appendChild(empty);
      return;
    }
    messages.forEach(function (m) { feedEl.appendChild(itemEl(m)); });
  }

  async function fetchMessages() {
    if (!supabase) return;
    if (!messages.length) {
      feedEl.innerHTML = "";
      var loading = document.createElement("p");
      loading.className = "gb-empty";
      loading.textContent = t("guestbook.loading");
      feedEl.appendChild(loading);
    }
    try {
      var res = await supabase
        .from("guestbook")
        .select("id, created_at, name, content, user_id")
        .order("created_at", { ascending: false })
        .limit(FEED_LIMIT);
      if (res.error) { setError("guestbook.err_load"); return; }
      messages = res.data || [];
      renderFeed();
    } catch (e) {
      setError("guestbook.err_load");
      renderFeed();
    }
  }

  // ---------- submit ----------

  async function onSubmit(e) {
    e.preventDefault();
    if (!supabase) { setError("guestbook.err_load"); return; }
    if (busy) return;
    var content = msgInput.value.trim();
    if (!content) { setError("guestbook.msg_required"); return; }

    var name = currentUser ? emailPrefix() : nameInput.value.trim();
    if (!name) name = t("guestbook.guest");

    busy = true;
    submitBtn.disabled = true;
    setError(null);
    try {
      var res = await supabase
        .from("guestbook")
        .insert([{
          name: name,
          content: content,
          user_id: currentUser ? currentUser.id : null
        }])
        .select("id, created_at, name, content, user_id");
      if (res.error) { setError("guestbook.err_post"); return; }
      var row = res.data && res.data[0];
      if (row) {
        messages.unshift(row);
        renderFeed();
      }
      msgInput.value = "";
      if (!currentUser) nameInput.value = "";
    } catch (e) {
      setError("guestbook.err_post");
    } finally {
      busy = false;
      submitBtn.disabled = false;
    }
  }

  // ---------- session ----------

  function refreshSession() {
    if (!supabase) return Promise.resolve();
    return supabase.auth.getSession().then(function (res) {
      currentUser = res.data && res.data.session ? res.data.session.user : null;
    }).catch(function () { currentUser = null; });
  }

  // ---------- init ----------

  function onLangChange() {
    applyTexts();
    renderFeed();
  }

  function init() {
    initClient();
    buildModal();
    var openBtn = document.getElementById("guestbook-open");
    if (openBtn) openBtn.addEventListener("click", showModal);
    document.addEventListener("langchange", onLangChange);
    if (!supabase) return;
    refreshSession();
    supabase.auth.onAuthStateChange(function (event, session) {
      currentUser = session ? session.user : null;
      if (currentUser && nameInput) {
        nameInput.value = emailPrefix();
        nameInput.readOnly = true;
      } else if (nameInput) {
        nameInput.readOnly = false;
      }
    });
  }

  init();
})();
