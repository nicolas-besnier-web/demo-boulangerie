// Maison Levain-Doré — site de démonstration réalisé par BALD
// Amélioration progressive : tout le contenu est déjà dans le HTML (généré par build.mjs).
// Ce script ajoute seulement le menu mobile, le statut « ouvert maintenant », le jour en cours,
// la visionneuse de la galerie, le formulaire de démonstration et les animations (coupées si le
// visiteur a demandé de réduire les animations). Aucun cookie, aucune ressource externe.
(function () {
  "use strict";

  // Menu mobile
  var bouton = document.querySelector(".menu-bouton");
  var nav = document.getElementById("nav");
  if (bouton && nav) {
    bouton.addEventListener("click", function () {
      var ouvert = nav.classList.toggle("ouvert");
      bouton.setAttribute("aria-expanded", String(ouvert));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("ouvert")) {
        nav.classList.remove("ouvert");
        bouton.setAttribute("aria-expanded", "false");
        bouton.focus();
      }
    });
  }

  // Heure à Rennes
  function maintenantParis() {
    var parts = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    var out = {};
    parts.forEach(function (p) { out[p.type] = p.value; });
    return { jour: out.weekday.charAt(0).toUpperCase() + out.weekday.slice(1), minutes: parseInt(out.hour, 10) * 60 + parseInt(out.minute, 10) };
  }
  function enMinutes(hhmm) { var p = hhmm.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
  function heure(hhmm) { var p = hhmm.split(":"); return p[0] + " h" + (p[1] === "00" ? "" : " " + p[1]); }

  var now = maintenantParis();

  // Jour en cours dans les tableaux d'horaires
  document.querySelectorAll(".horaires tr[data-jour]").forEach(function (tr) {
    if (tr.getAttribute("data-jour") === now.jour) tr.classList.add("aujourdhui");
  });

  // Statut « ouvert maintenant » (remplace le lien affiché sans JavaScript)
  document.querySelectorAll("[data-statut]").forEach(function (zone) {
    var jours;
    try { jours = JSON.parse(zone.getAttribute("data-jours")); } catch (e) { return; }
    var auj = jours.filter(function (j) { return j.jour === now.jour; })[0];
    var etat = "ferme", texte = "Fermé aujourd'hui";
    if (auj && auj.ouvert) {
      var o = enMinutes(auj.ouverture), f = enMinutes(auj.fermeture);
      if (now.minutes >= o && now.minutes < f) { etat = "ouvert"; texte = "Ouvert maintenant, jusqu'à " + heure(auj.fermeture); }
      else if (now.minutes < o) { texte = "Fermé, ouverture à " + heure(auj.ouverture); }
      else { texte = "Fermé, réouverture demain"; }
    }
    zone.setAttribute("data-etat", etat);
    zone.textContent = texte;
  });

  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Formulaire de démonstration : rien n'est envoyé, jamais.
  var form = document.getElementById("formulaire-contact");
  if (form) {
    var msg = document.getElementById("message-demo");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      msg.hidden = false;
      msg.textContent = "Ceci est un site de démonstration : aucun message n'est envoyé.";
      msg.scrollIntoView({ block: "nearest", behavior: reduit ? "auto" : "smooth" });
    });
  }

  // Visionneuse de la galerie : croix, Échap ou clic à côté pour fermer ; flèches pour naviguer
  var galerie = document.querySelector(".galerie");
  var dlg = document.querySelector(".visionneuse");
  if (galerie && dlg && typeof dlg.showModal === "function") {
    var liens = Array.prototype.slice.call(galerie.querySelectorAll("a"));
    var img = dlg.querySelector("img");
    var legende = dlg.querySelector("figcaption");
    var courant = 0;
    var montrer = function (i) {
      courant = (i + liens.length) % liens.length;
      var a = liens[courant];
      img.src = a.getAttribute("href");
      img.alt = a.getAttribute("data-alt") || "";
      legende.textContent = a.getAttribute("data-legende") || "";
    };
    liens.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        montrer(i);
        dlg.showModal();
        dlg.querySelector(".v-fermer").focus();
      });
    });
    dlg.querySelector(".v-fermer").addEventListener("click", function () { dlg.close(); });
    dlg.querySelector(".v-prec").addEventListener("click", function () { montrer(courant - 1); });
    dlg.querySelector(".v-suiv").addEventListener("click", function () { montrer(courant + 1); });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.hasAttribute("data-fermer")) dlg.close();
    });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") montrer(courant - 1);
      if (e.key === "ArrowRight") montrer(courant + 1);
    });
  }

  // Apparition au défilement, avec un léger décalage entre éléments voisins
  var noeuds = document.querySelectorAll(".apparait");
  noeuds.forEach(function (n) {
    var freres = Array.prototype.filter.call(n.parentNode.children, function (c) { return c.classList.contains("apparait"); });
    n.style.setProperty("--i", String(Math.min(freres.indexOf(n), 5)));
  });
  if (reduit || !("IntersectionObserver" in window)) {
    noeuds.forEach(function (n) { n.classList.add("vu"); });
  } else {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("vu"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    noeuds.forEach(function (n) { io.observe(n); });
  }

  // Léger défilement différé de l'image d'ouverture et du tampon
  var hero = document.querySelector(".hero-immersif");
  if (hero && !reduit) {
    var attente = false;
    window.addEventListener("scroll", function () {
      if (attente) return;
      attente = true;
      window.requestAnimationFrame(function () {
        var p = Math.max(0, Math.min(1, window.scrollY / hero.offsetHeight));
        hero.style.setProperty("--p", p.toFixed(3));
        attente = false;
      });
    }, { passive: true });
  }
})();
