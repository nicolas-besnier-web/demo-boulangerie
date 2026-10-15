# Maison Levain-Doré — site de démonstration

Site vitrine d'une **boulangerie-pâtisserie fictive à Rennes**, réalisé par l'agence BALD (Rennes) comme exemple de réalisation pour des artisans et commerçants. Aucune entreprise réelle n'est représentée.

## Règles à ne jamais casser
- Nom inventé (« Maison Levain-Doré », vérifié le 15/10/2026 : aucune entreprise de ce nom à Rennes). Adresse, téléphone (02 00 00 00 00) et e-mail (contact@exemple.fr) fictifs.
- Bandeau « Projet de démonstration réalisé par BALD — entreprise fictive » en haut de **chaque** page.
- Aucun faux avis présenté comme réel : les avis de l'accueil portent l'étiquette « Exemple ».
- Le formulaire de contact n'envoie rien : il affiche « Ceci est un site de démonstration : aucun message n'est envoyé. »
- Photos libres de droits (Unsplash) téléchargées dans `assets/img/`, crédits dans `mentions-legales.html`. Polices WOFF2 dans `assets/fonts/`. Aucune ressource chargée depuis un autre site, aucun cookie.

## Génération du site (important)
Les pages du site sont **générées** : `node build.mjs` lit `content/*.json` et `src/`, puis écrit le HTML complet dans `dist/` (contenus visibles sans JavaScript, lisibles par les moteurs de recherche). `dist/` n'est pas versionné. Le script n'a aucune dépendance (Node 18+).
- `src/layout.html` : structure commune de toutes les pages.
- `src/partials/tete.html` et `pied.html` : bandeau de démonstration, en-tête et pied de page (**un seul endroit**).
- `src/pages/*.html` : contenu propre à chaque page, avec un en-tête `---` (title, description, `jsonld: oui` pour ajouter les données structurées Bakery).
- Blocs utilisables dans les pages : `{{site.nom}}`, `{{site.rue}}`, `{{site.telephone}}`… (champs de `content/site.json`), `{{produits:pains}}`, `{{produits:moment}}`, `{{horaires}}`, `{{statut}}`, `{{actus}}`.
- Le script valide les contenus (catégorie inconnue, heures invalides, image absente…) et **échoue avec un message clair** plutôt que de publier un site cassé.
- Netlify : `netlify.toml` lance `node build.mjs` et publie `dist/` à chaque commit, y compris ceux de Pages CMS.
- `content/site.json` → `indexation` : `false` ajoute `noindex` (site de démonstration). Passer à `true` pour un vrai client.

## Structure
- 5 pages + mentions légales, dans `src/pages/` : `index`, `produits`, `histoire`, `actualites`, `contact`, `mentions-legales`.
- `css/style.css` : tout le style (variables de couleur en tête de fichier).
- `js/main.js` : amélioration progressive seulement (menu mobile, jour en cours, statut « ouvert maintenant » (heure de Paris), formulaire de démonstration, apparition douce désactivée si `prefers-reduced-motion`). Le contenu n'en dépend pas.
- `content/` : contenus modifiables sans toucher au code
  - `horaires.json` — horaires et note
  - `produits.json` — produits par catégorie, `momentane: true` = affiché sur l'accueil
  - `actualites.json` — actualités (date, titre, texte, image, alt)
  - `site.json` — coordonnées, textes communs, navigation, indexation
- `.pages.yml` : configuration prête pour Pages CMS (https://pagescms.org).
- `captures/` : captures d'écran pour la page Réalisations du site BALD.

## Direction artistique
Fournil chaleureux : crème farine (`--farine`, `--creme`), brun croûte (`--brun`), brun fournil très sombre (`--fournil`), or de croûte (`--dore`) et rouge braise (`--braise`) pour les boutons. Titres en Young Serif, texte en Hanken Grotesk. Motifs : photo en arche (porte de fournil), tampon « première fournée », carte de menu à points de conduite, étiquettes arrondies.

## Aperçu local
```
npm start        # génère dist/ puis sert http://localhost:8000
node build.mjs   # génération seule
```

## Accessibilité
Lien d'évitement, contrastes AA, focus visible, navigation clavier, `aria-current`, animations réduites sur demande.
