# Maison Levain-Doré — site de démonstration

Site vitrine d'une **boulangerie-pâtisserie fictive à Rennes**, réalisé par l'agence BALD (Rennes) comme exemple de réalisation pour des artisans et commerçants. Aucune entreprise réelle n'est représentée.

## Règles à ne jamais casser
- Nom inventé (« Maison Levain-Doré », vérifié le 15/10/2026 : aucune entreprise de ce nom à Rennes). Adresse, téléphone (02 00 00 00 00) et e-mail (contact@exemple.fr) fictifs.
- Bandeau « Projet de démonstration réalisé par BALD — entreprise fictive » en haut de **chaque** page.
- Aucun faux avis présenté comme réel : les avis de l'accueil portent l'étiquette « Exemple ».
- Le formulaire de contact n'envoie rien : il affiche « Ceci est un site de démonstration : aucun message n'est envoyé. »
- Photos libres de droits (Unsplash) téléchargées dans `assets/img/`, crédits dans `mentions-legales.html`. Polices WOFF2 dans `assets/fonts/`. Aucune ressource chargée depuis un autre site, aucun cookie.

## Structure
- 5 pages : `index.html`, `produits.html`, `histoire.html`, `actualites.html`, `contact.html` + `mentions-legales.html`.
- `css/style.css` : tout le style (variables de couleur en tête de fichier).
- `js/main.js` : menu mobile, rendu des contenus JSON, statut « ouvert maintenant » (heure de Paris), formulaire de démonstration, apparition douce (désactivée si `prefers-reduced-motion`).
- `content/` : contenus modifiables sans toucher au code
  - `horaires.json` — horaires et note
  - `produits.json` — produits par catégorie, `momentane: true` = affiché sur l'accueil
  - `actualites.json` — actualités (date, titre, texte, image, alt)
  - `site.json` — coordonnées (référence ; les pages les écrivent aussi en dur)
- `.pages.yml` : configuration prête pour Pages CMS (https://pagescms.org).
- `captures/` : captures d'écran pour la page Réalisations du site BALD.

L'en-tête et le pied de page sont dupliqués dans chaque fichier HTML : modifier les 6 fichiers ensemble.

## Direction artistique
Fournil chaleureux : crème farine (`--farine`, `--creme`), brun croûte (`--brun`), brun fournil très sombre (`--fournil`), or de croûte (`--dore`) et rouge braise (`--braise`) pour les boutons. Titres en Young Serif, texte en Hanken Grotesk. Motifs : photo en arche (porte de fournil), tampon « première fournée », carte de menu à points de conduite, étiquettes arrondies.

## Aperçu local
Les contenus sont chargés avec `fetch` : il faut un serveur (pas d'ouverture directe en `file://`).
```
python3 -m http.server 8000
```
Puis http://localhost:8000.

## Accessibilité
Lien d'évitement, contrastes AA, focus visible, navigation clavier, `aria-current`, animations réduites sur demande.
