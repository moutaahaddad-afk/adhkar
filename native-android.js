/* =====================================================================
   Adhkar — pont natif Android (Capacitor)
   Ce fichier ne fait STRICTEMENT RIEN sur le web (PWA / navigateur).
   Il fournit les rappels quotidiens planifiés au niveau Android
   (AlarmManager via @capacitor/local-notifications) pour que le rappel
   de 20:00 et les rappels de wird fonctionnent même application fermée.
   ===================================================================== */
(function () {
  "use strict";

  var Cap = window.Capacitor;
  var IS_NATIVE = !!(Cap && typeof Cap.isNativePlatform === "function" && Cap.isNativePlatform());
  var CHANNEL_ID = "adhkar-reminders";
  var IDS = { daily: 1001, wirdM: 1002, wirdE: 1003, morning: 1004, evening: 1005, mushaf: 1006 };

  var permission = "unknown";   // granted | denied | prompt | unknown
  var channelReady = false;

  function plugin() {
    if (!IS_NATIVE) return null;
    return (Cap.Plugins && Cap.Plugins.LocalNotifications) || null;
  }

  function pad2(n) { return String(n).padStart(2, "0"); }

  /* "05:30" -> { hour: 5, minute: 30 } ; null si invalide */
  function parseHM(hm) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(hm || "").trim());
    if (!m) return null;
    var h = parseInt(m[1], 10), mi = parseInt(m[2], 10);
    if (!(h >= 0 && h <= 23 && mi >= 0 && mi <= 59)) return null;
    return { hour: h, minute: mi };
  }

  async function ensureChannel() {
    var ln = plugin();
    if (!ln || channelReady) return;
    try {
      await ln.createChannel({
        id: CHANNEL_ID,
        name: "Rappels Adhkar",
        description: "Rappels quotidiens des أذكار الأسماء الحسنى",
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: "#D4AF37"
      });
      channelReady = true;
    } catch (e) { console.warn("[native] createChannel:", e); }
  }

  function buildNotifications() {
    var s = (typeof state !== "undefined" && state && state.s) ? state.s : {};
    var name = (typeof curName === "function") ? curName() : "";
    var list = [];

    function add(id, title, body, hm) {
      var at = parseHM(hm);
      if (!at) return;
      list.push({
        id: id,
        title: title,
        body: body,
        channelId: CHANNEL_ID,
        smallIcon: "ic_stat_adhkar",
        iconColor: "#D4AF37",
        schedule: {
          on: { hour: at.hour, minute: at.minute },
          repeats: true,
          allowWhileIdle: true,
          androidScheduleMode: "exactAllowWhileIdle"
        }
      });
    }

    /* Rappel principal (heure configurée dans l'app, 20:00 par défaut) */
    add(
      IDS.daily,
      "أذكار الأسماء الحسنى",
      "تذكير: 5,000 ذكر الليلة" + (name ? " — " + name : "") + ". افتح التطبيق وأكمل وردك.",
      pad2(s.hour != null ? s.hour : 20) + ":" + pad2(s.minute != null ? s.minute : 0)
    );

    /* Aurores (wird) matin / soir.
       Attention : une notification planifiée par l'OS se répète à heure fixe et
       ne peut pas savoir si le wird du jour est déjà fait (contrairement au web,
       cf. checkWirdReminder). Les textes sont donc des invitations, jamais des
       affirmations du type « tu n'as pas encore terminé ». */
    if (s.wirdM !== false) add(IDS.wirdM, "الورد الصباحي", "أذكار الصباح بانتظارك — افتح التطبيق وأتمّها.", s.wirdMTime || "05:30");
    if (s.wirdE !== false) add(IDS.wirdE, "الورد المسائي", "أذكار المساء بانتظارك — افتح التطبيق وأتمّها.", s.wirdETime || "17:30");

    /* Rappels matin / soir */
    if (s.morningReminder !== false) add(IDS.morning, "بداية اليوم", "ابدأ وردك اليومي: 5,000 ذكر" + (name ? " — " + name : "") + ".", s.morningReminderTime || "04:30");
    if (s.eveningReminder !== false) add(IDS.evening, "ختام اليوم", "وردك الليلة بانتظارك — أكمل ما تبقّى قبل النوم.", s.eveningReminderTime || "23:00");

    /* Rappel du mushaf */
    if (s.mushafReminder !== false) add(IDS.mushaf, "ورد المصحف", "صفحتك التالية من المصحف بانتظارك.", s.mushafTime || "21:00");

    return list;
  }

  async function syncReminders() {
    var ln = plugin();
    if (!ln) return false;
    if (permission !== "granted") return false;
    await ensureChannel();
    var wanted = buildNotifications();
    var wantedIds = wanted.map(function (n) { return { id: n.id }; });
    try {
      var pending = await ln.getPending();
      var pendingIds = (pending && pending.notifications ? pending.notifications : []).map(function (n) { return { id: n.id }; });
      if (pendingIds.length) await ln.cancel({ notifications: pendingIds });
    } catch (e) { console.warn("[native] cancel:", e); }
    try {
      if (wanted.length) await ln.schedule({ notifications: wanted });
      return wanted.length;
    } catch (e) {
      console.warn("[native] schedule:", e);
      return false;
    }
  }

  async function refreshPermission() {
    var ln = plugin();
    if (!ln) return "unknown";
    try {
      var st = await ln.checkPermissions();
      permission = (st && st.display) || "unknown";
    } catch (e) { permission = "unknown"; }
    return permission;
  }

  async function requestPermission() {
    var ln = plugin();
    if (!ln) return "unknown";
    try {
      var st = await ln.requestPermissions();
      permission = (st && st.display) || "unknown";
    } catch (e) { permission = "denied"; }
    return permission;
  }

  /* Notification immédiate (équivalent natif de fireNotification) */
  async function notifyNow(title, body) {
    var ln = plugin();
    if (!ln || permission !== "granted") return false;
    await ensureChannel();
    try {
      await ln.schedule({
        notifications: [{
          id: Math.floor(Date.now() / 1000) % 100000,
          title: title,
          body: body,
          channelId: CHANNEL_ID,
          smallIcon: "ic_stat_adhkar",
          iconColor: "#D4AF37"
        }]
      });
      return true;
    } catch (e) { console.warn("[native] notifyNow:", e); return false; }
  }

  async function init() {
    if (!IS_NATIVE) return;
    await refreshPermission();
    if (permission === "prompt" || permission === "unknown") {
      /* On ne force pas la demande au 1er lancement : le bouton de l'app
         déclenche requestPermission(). On planifie si déjà accordé. */
      await refreshPermission();
    }
    if (permission === "granted") await syncReminders();

    /* Reprogrammation à chaque retour au premier plan (heures modifiées,
       fuseau, réveil, mise à jour de l'app). */
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        refreshPermission().then(function (p) {
          if (p === "granted") syncReminders();
        });
      }
    });

    var App = Cap.Plugins && Cap.Plugins.App;
    if (App && App.addListener) {
      App.addListener("appStateChange", function (st) {
        if (st && st.isActive) {
          refreshPermission().then(function (p) { if (p === "granted") syncReminders(); });
        }
      });

      /* Gestion intelligente du bouton retour Android (geste ou touche physique) */
      App.addListener("backButton", function (data) {
        // 1. Quitter le plein écran du Mushaf
        if (document.body.classList.contains("mu-fullscreen")) {
          if (typeof window.muExitFS === "function") {
            window.muExitFS();
            return;
          }
        }
        // 2. Quitter le plein écran de la Burdah
        if (document.body.classList.contains("bd-fullscreen")) {
          if (typeof window.bdExitFS === "function") {
            window.bdExitFS();
            return;
          }
        }
        // 3. Quitter le plein écran du Tasbih
        var fsTasbih = document.getElementById("fsTasbih");
        if (fsTasbih && fsTasbih.classList.contains("open")) {
          if (typeof window.closeFullscreen === "function") {
            window.closeFullscreen();
            return;
          }
        }
        // 4. Fermer la modale de sélection de ville si ouverte
        var citySheet = document.getElementById("citySheetOverlay");
        if (citySheet && citySheet.classList.contains("show")) {
          citySheet.classList.remove("show");
          return;
        }
        // 5. Fermer la modale des parties du Mushaf si ouverte
        var gridOverlay = document.getElementById("muGridOverlay");
        if (gridOverlay && gridOverlay.classList.contains("show")) {
          gridOverlay.classList.remove("show");
          return;
        }
        // 6. Navigation arrière standard ou fermer l'application
        if (data && data.canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    }
  }

  window.NativeReminders = {
    isNative: IS_NATIVE,
    init: init,
    permission: function () { return permission; },
    refreshPermission: refreshPermission,
    requestPermission: requestPermission,
    sync: syncReminders,
    notifyNow: notifyNow
  };

  if (IS_NATIVE) {
    document.addEventListener("DOMContentLoaded", function () { init(); });
  }
})();
