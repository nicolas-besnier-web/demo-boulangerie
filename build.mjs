#!/usr/bin/env node
// Génération du site : content/*.json + src/ → dist/ (HTML complet, lisible sans JavaScript).
// Aucune dépendance : Node 18 ou plus suffit. Commande : node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const erreurs = [];
const echec = (m) => erreurs.push(m);

// ---------- Lecture et validation des contenus
function json(nom) {
  try { return JSON.parse(readFileSync(join(ROOT, "content", nom), "utf8")); }
  catch (e) { echec(`content/${nom} : ${e.message}`); return null; }
}
const site = json("site.json");
const horaires = json("horaires.json");
const produits = json("produits.json");
const actualites = json("actualites.json");
if (erreurs.length) sortir();

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const EN = { Lundi: "Monday", Mardi: "Tuesday", Mercredi: "Wednesday", Jeudi: "Thursday", Vendredi: "Friday", Samedi: "Saturday", Dimanche: "Sunday" };
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

for (const k of ["nom", "slogan", "metier", "rue", "codePostalVille", "telephone", "email", "bandeau", "piedDemo", "navigation"]) {
  if (site[k] === undefined) echec(`content/site.json : champ « ${k} » manquant`);
}
for (const n of site.navigation || []) {
  if (!existsSync(join(SRC, "pages", n.fichier))) echec(`content/site.json : la page « ${n.fichier} » n'existe pas dans src/pages`);
}
const vus = new Set();
for (const j of horaires.jours || []) {
  if (!JOURS.includes(j.jour)) echec(`horaires.json : jour inconnu « ${j.jour} » (attendu : ${JOURS.join(", ")})`);
  if (vus.has(j.jour)) echec(`horaires.json : « ${j.jour} » apparaît deux fois`);
  vus.add(j.jour);
  if (j.ouvert) {
    if (!HHMM.test(j.ouverture || "") || !HHMM.test(j.fermeture || "")) echec(`horaires.json : ${j.jour} — heures attendues au format HH:MM`);
    else if (j.ouverture >= j.fermeture) echec(`horaires.json : ${j.jour} — la fermeture doit être après l'ouverture`);
  }
}
for (const j of JOURS) if (!vus.has(j)) echec(`horaires.json : « ${j} » manque`);
const idsCat = new Set((produits.categories || []).map((c) => c.id));
for (const p of produits.produits || []) {
  if (!idsCat.has(p.categorie)) echec(`produits.json : « ${p.nom} » — catégorie inconnue « ${p.categorie} »`);
  if (!p.nom) echec("produits.json : un produit n'a pas de nom");
  if (typeof p.prix !== "number" || p.prix < 0) echec(`produits.json : « ${p.nom} » — prix invalide`);
}
for (const a of actualites.actualites || []) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date || "")) echec(`actualites.json : « ${a.titre} » — date attendue AAAA-MM-JJ`);
  if (!a.titre || !a.texte) echec("actualites.json : une actualité n'a pas de titre ou de texte");
  if (a.image && !existsSync(join(ROOT, a.image))) echec(`actualites.json : « ${a.titre} » — image introuvable (${a.image})`);
  if (a.image && !a.alt) echec(`actualites.json : « ${a.titre} » — description de l'image (alt) manquante`);
}
if (erreurs.length) sortir();

function sortir() {
  console.error("\nÉchec de la génération :\n" + erreurs.map((e) => "  - " + e).join("\n") + "\n");
  process.exit(1);
}

// ---------- Outils
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const dateLongue = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
const heure = (hhmm) => { const [h, m] = hhmm.split(":"); return `${h} h${m === "00" ? "" : " " + m}`; };

function tailleJpeg(fichier) { // lit largeur et hauteur dans l'en-tête JPEG
  const b = readFileSync(fichier);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marqueur = b[i + 1];
    if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

const ICONES = {
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  fleche: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
};
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor"><path d="M15.2 30V12h1.6v18z"/><ellipse cx="16" cy="6" rx="2.4" ry="3.7"/><ellipse cx="11.2" cy="11.5" rx="2.1" ry="3.7" transform="rotate(-35 11.2 11.5)"/><ellipse cx="20.8" cy="11.5" rx="2.1" ry="3.7" transform="rotate(35 20.8 11.5)"/><ellipse cx="11.2" cy="18" rx="2.1" ry="3.7" transform="rotate(-35 11.2 18)"/><ellipse cx="20.8" cy="18" rx="2.1" ry="3.7" transform="rotate(35 20.8 18)"/></svg>`;

// ---------- Blocs générés à partir des contenus
function blocProduits(cat) {
  const liste = (produits.produits || []).filter((p) => (cat === "moment" ? p.momentane : p.categorie === cat));
  if (cat !== "moment" && !idsCat.has(cat)) { echec(`{{produits:${cat}}} : catégorie inconnue`); return ""; }
  if (!liste.length) return `<p>Rien à signaler cette semaine : revenez vite nous voir.</p>`;
  return `<ul class="carte">\n` + liste.map((p) => {
    const pastille = cat !== "moment" && p.momentane ? `<span class="pastille">du moment</span>` : "";
    return `        <li><span class="nom">${esc(p.nom)}${pastille}</span><span class="points" aria-hidden="true"></span><span class="prix">${esc(euros.format(p.prix))}</span><p class="desc">${esc(p.description || "")}</p></li>`;
  }).join("\n") + `\n      </ul>`;
}

function blocHoraires() {
  const lignes = JOURS.map((nom) => {
    const j = horaires.jours.find((x) => x.jour === nom);
    const cellule = j.ouvert ? `${heure(j.ouverture)} – ${heure(j.fermeture)}` : "Fermé";
    return `<tr data-jour="${nom}"><th scope="row">${nom}</th><td${j.ouvert ? "" : ' class="ferme"'}>${cellule}</td></tr>`;
  }).join("");
  const note = horaires.note ? `<p class="note-horaires">${esc(horaires.note)}</p>` : "";
  return `<table class="horaires"><caption class="visuellement-cache">Horaires d'ouverture</caption><tbody>${lignes}</tbody></table>${note}`;
}

function blocStatut() {
  // Lien lisible sans JavaScript ; main.js le remplace par « Ouvert maintenant… » à partir de data-jours.
  const jours = JSON.stringify(horaires.jours);
  return `<p class="statut" data-statut data-jours="${esc(jours)}" role="status"><a href="contact.html#horaires">Voir nos horaires d'ouverture</a></p>`;
}

function blocActus(limite) {
  let liste = [...(actualites.actualites || [])].sort((a, b) => b.date.localeCompare(a.date));
  if (limite) liste = liste.slice(0, Number(limite));
  return `<ul class="actus">\n` + liste.map((a) => {
    let img = "";
    if (a.image) {
      const t = tailleJpeg(join(ROOT, a.image));
      const dim = t ? ` width="${t.w}" height="${t.h}"` : "";
      img = `<div class="actu-photo"><img src="${esc(a.image)}" alt="${esc(a.alt || "")}"${dim} loading="lazy"></div>`;
    }
    const d = new Date(a.date + "T12:00:00");
    return `      <li class="actu apparait">${img}<div><time datetime="${a.date}">${dateLongue.format(d)}</time><h2>${esc(a.titre)}</h2><p>${esc(a.texte)}</p></div></li>`;
  }).join("\n") + `\n    </ul>`;
}

function blocJsonLd() {
  const [cp, ...ville] = site.codePostalVille.split(" ");
  const data = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: site.nom,
    description: site.slogan,
    telephone: site.telephone,
    email: site.email,
    address: { "@type": "PostalAddress", streetAddress: site.rue, postalCode: cp, addressLocality: ville.join(" "), addressCountry: "FR" },
    openingHoursSpecification: horaires.jours.filter((j) => j.ouvert).map((j) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: EN[j.jour], opens: j.ouverture, closes: j.fermeture })),
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

// ---------- Moteur de gabarits : {{nom}} ou {{nom:argument}}
function remplacer(texte, ctx) {
  for (let passe = 0; passe < 6; passe++) {
    let change = false;
    texte = texte.replace(/\{\{\s*([\w.]+)(?::([\w-]+))?\s*\}\}/g, (m, nom, arg) => {
      change = true;
      if (nom.startsWith("site.")) {
        const v = site[nom.slice(5)];
        if (v === undefined) { echec(`{{${nom}}} : champ absent de content/site.json (${ctx.file})`); return ""; }
        return esc(v);
      }
      switch (nom) {
        case "title": return esc(ctx.title);
        case "description": return esc(ctx.description);
        case "robots": return site.indexation ? "" : `<meta name="robots" content="noindex">`;
        case "jsonld": return ctx.jsonld ? blocJsonLd() : "";
        case "tete": return partial("tete");
        case "pied": return partial("pied");
        case "contenu": return ctx.contenu;
        case "logo": return LOGO;
        case "icone": return ICONES[arg] || echec(`{{icone:${arg}}} inconnue`) || "";
        case "nav": return site.navigation.map((n) => `<li><a href="${esc(n.fichier)}"${n.fichier === ctx.file ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`).join("");
        case "navPied": return site.navigation.map((n) => `<li><a href="${esc(n.fichier)}">${esc(n.label)}</a></li>`).join("") + `<li><a href="mentions-legales.html">Mentions légales et crédits</a></li>`;
        case "produits": return blocProduits(arg);
        case "horaires": return blocHoraires();
        case "statut": return blocStatut();
        case "actus": return blocActus(arg);
        default: echec(`{{${nom}}} : bloc inconnu (${ctx.file})`); return "";
      }
    });
    if (!change) break;
  }
  return texte;
}
const partial = (nom) => readFileSync(join(SRC, "partials", nom + ".html"), "utf8").trimEnd();

function pageSource(fichier) {
  const brut = readFileSync(join(SRC, "pages", fichier), "utf8");
  const m = brut.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { echec(`src/pages/${fichier} : en-tête --- title/description --- manquant`); return null; }
  const meta = {};
  m[1].split("\n").forEach((l) => { const i = l.indexOf(":"); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  if (!meta.title || !meta.description) echec(`src/pages/${fichier} : title et description obligatoires`);
  return { ...meta, contenu: m[2].trimEnd() };
}

// ---------- Génération
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
const layout = readFileSync(join(SRC, "layout.html"), "utf8");
const pages = readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html"));
for (const fichier of pages) {
  const p = pageSource(fichier);
  if (!p) continue;
  const html = remplacer(layout, { file: fichier, title: p.title, description: p.description, jsonld: p.jsonld === "oui", contenu: p.contenu });
  if (/\{\{|\}\}/.test(html)) echec(`${fichier} : un {{bloc}} n'a pas été remplacé`);
  writeFileSync(join(DIST, fichier), html);
}
if (erreurs.length) sortir();
for (const dossier of ["assets", "css", "js"]) cpSync(join(ROOT, dossier), join(DIST, dossier), { recursive: true });
console.log(`Site généré dans dist/ : ${pages.length} pages.`);
