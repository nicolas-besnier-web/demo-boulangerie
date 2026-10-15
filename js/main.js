// Maison Levain-Doré — site de démonstration réalisé par BALD
// Aucun cookie, aucun traceur, aucune ressource externe. Les contenus viennent du dossier content/.
(function () {
  "use strict";

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function charger(fichier) {
    return fetch("content/" + fichier).then(function (r) {
      if (!r.ok) throw new Error(fichier);
      return r.json();
    });
  }

  function erreur(zone) {
    zone.textContent = "Ce contenu n'a pas pu être chargé. Appelez-nous au 02 00 00 00 00 (numéro fictif).";
  }

  var euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
  var dateLongue = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

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

  // Horaires et statut
  var zonesHoraires = document.querySelectorAll("[data-horaires]");
  var zonesStatut = document.querySelectorAll("[data-statut]");
  if (zonesHoraires.length || zonesStatut.length) {
    charger("horaires.json").then(function (h) {
      var now = maintenantParis();
      var auj = h.jours.filter(function (j) { return j.jour === now.jour; })[0];

      zonesHoraires.forEach(function (zone) {
        var table = el("table", { "class": "horaires" }, [
          el("caption", { "class": "visuellement-cache", text: "Horaires d'ouverture" }),
          el("tbody", {}, h.jours.map(function (j) {
            var tr = el("tr", j.jour === now.jour ? { "class": "aujourdhui" } : {}, [
              el("th", { scope: "row", text: j.jour }),
              el("td", j.ouvert ? {} : { "class": "ferme" }, [])
            ]);
            tr.lastChild.textContent = j.ouvert ? heure(j.ouverture) + " – " + heure(j.fermeture) : "Fermé";
            return tr;
          }))
        ]);
        zone.replaceChildren(table);
        if (h.note) zone.appendChild(el("p", { "class": "note-horaires", text: h.note }));
      });

      zonesStatut.forEach(function (zone) {
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
    }).catch(function () {
      zonesHoraires.forEach(erreur);
      zonesStatut.forEach(function (z) { z.textContent = "Horaires : voir la page Contact"; });
    });
  }

  // Produits
  function ligneProduit(p, avecPastille) {
    var nom = el("span", { "class": "nom", text: p.nom });
    if (avecPastille && p.momentane) nom.appendChild(el("span", { "class": "pastille", text: "du moment" }));
    return el("li", {}, [
      nom,
      el("span", { "class": "points", "aria-hidden": "true" }),
      el("span", { "class": "prix", text: euros.format(p.prix) }),
      el("p", { "class": "desc", text: p.description })
    ]);
  }
  document.querySelectorAll("[data-produits]").forEach(function (zone) {
    charger("produits.json").then(function (data) {
      var cat = zone.getAttribute("data-produits");
      var liste = data.produits.filter(function (p) { return cat === "moment" ? p.momentane : p.categorie === cat; });
      zone.replaceChildren.apply(zone, liste.map(function (p) { return ligneProduit(p, cat !== "moment"); }));
    }).catch(function () { erreur(zone); });
  });

  // Actualités
  document.querySelectorAll("[data-actus]").forEach(function (zone) {
    var limite = parseInt(zone.getAttribute("data-limite") || "0", 10);
    charger("actualites.json").then(function (data) {
      var liste = data.actualites.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
      if (limite) liste = liste.slice(0, limite);
      zone.replaceChildren.apply(zone, liste.map(function (a, i) {
        var d = new Date(a.date + "T12:00:00");
        var img = el("img", { src: a.image, alt: a.alt || "", width: "933", height: "700", loading: "lazy" });
        return el("li", { "class": "actu apparait" }, [
          el("div", { "class": "actu-photo" }, [img]),
          el("div", {}, [
            el("time", { datetime: a.date, text: dateLongue.format(d) }),
            el("h2", { text: a.titre }),
            el("p", { text: a.texte })
          ])
        ]);
      }));
      observer(zone.querySelectorAll(".apparait"));
    }).catch(function () { erreur(zone); });
  });

  // Formulaire de démonstration : rien n'est envoyé, jamais.
  var form = document.getElementById("formulaire-contact");
  if (form) {
    var msg = document.getElementById("message-demo");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      msg.hidden = false;
      msg.textContent = "Ceci est un site de démonstration : aucun message n'est envoyé.";
      form.reset();
    });
  }

  // Apparition douce
  function observer(noeuds) {
    if (!("IntersectionObserver" in window)) { noeuds.forEach(function (n) { n.classList.add("vu"); }); return; }
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("vu"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    noeuds.forEach(function (n) { io.observe(n); });
  }
  observer(document.querySelectorAll(".apparait"));
})();
