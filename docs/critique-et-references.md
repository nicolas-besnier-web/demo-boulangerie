# Critique du site et références (15/10/2026)

## 1. Critique (skill impeccable, deux évaluations indépendantes)

**Méthode :** dual-agent. A = revue de design (jugement, captures bureau et mobile), B = détecteur impeccable + contrôles navigateur.

**Verdict de spécificité :** propre, chaud, lisible, mais « un très bon site Essentiel » plutôt qu'un site Pro. 6/10 pour une boulangerie, 4/10 pour une vitrine à 1 390 €. Score heuristique 23/32 (« Bon »).

**Ce qui fonctionne :** hiérarchie typographique (Young Serif / Hanken), direction « fournil à l'aube » tenue, détails métier (carte à points de conduite, tampon « 6 h 30 », statut ouvert en direct, jour en cours).

**Problèmes prioritaires retenus :**
- P1 — Aucun moment « signature » : tout est statique, une seule animation. → section narrative « Une journée au fournil », animations de défilement variées.
- P1 — Rien ne distingue visiblement l'Essentiel : même gabarit partout (titre, chapeau, zigzag photo/texte). → accueil immersif, cartes produits avec photos, galerie avec visionneuse, rythme clair/sombre, gabarits variés.
- P1 — Photos génériques et recyclées d'une page à l'autre. → une photo par usage quand c'est possible, cadrages variés, une galerie dédiée.
- P2 — Fin de page plate, pied de page pauvre. → double appel à l'action, pied de page riche (horaires, téléphone cliquable).
- P2 — Formulaire peu abouti (confirmation sous le bouton, sans `aria-live`). → confirmation visible et annoncée.

**Détecteur (31 avertissements, tous « warning ») :** presque tous des faux positifs (interlignage du logo, étiquettes courtes en majuscules, filets de séparation pris pour des boîtes, palette crème voulue). Deux points réels : liens du pied de page trop petits au toucher (22 px de haut) et hiérarchie typographique un peu plate sur la page Histoire. Contraste, débordement, ordre de tabulation et focus : rien à signaler.

**Suggestions écartées volontairement :**
- Fausse presse, faux labels, fausse note moyenne : on n'invente pas de preuves, même pour une démo. Les avis restent des exemples étiquetés.
- Précommande, carte interactive, filtres produits : hors du périmètre demandé ; à présenter comme options complémentaires.

## 2. Références haut de gamme (sites consultés)

Chambelland, Poilâne, Fabrique, Yann Couvreur, Bluebird Bakery. Principes retenus, sans rien copier :
- **Photographie d'abord** : image pleine largeur à l'ouverture, titre court posé dessus (Poilâne), format de photo homogène sur la page (Chambelland).
- **Retenue** : peu de texte, titres courts, beaucoup d'air, palette crème et tons naturels sombres (Fabrique, Bluebird).
- **Alternance** de blocs portés par l'image et de blocs portés par le texte, pour un rythme lent (tous).
- **Fiches produit** : photo, nom, prix, pastille discrète (« meilleure vente », « à partir de »), jamais plus d'une action (Yann Couvreur, Poilâne).
- **Récit d'atelier** : mains, four, gestes, plutôt que des produits seuls (Poilâne).
- **Détails de confiance** : annonce d'heure limite de commande, année de fondation, cartes d'adresse avec horaires et téléphone (Yann Couvreur, Poilâne, Bluebird).
- **Pied de page organisé** en colonnes (Poilâne, Bluebird).

Limite : les pages ont été lues sous forme de texte extrait, sans rendu visuel ; ces principes viennent de la structure et des textes, pas de captures. Le contenu de la page Chambelland récupérée contenait des blocs parasites : seule sa structure a été retenue.
