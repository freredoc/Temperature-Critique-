# PLAN — Température Critique

Jeu incrémental de physique, du labo de cryogénie jusqu'au cosmos. C'est le
troisième projet, à côté de Foyer Zéro et d'Archipel Industry.

**Ce document est le plan complet du jeu**, et il n'est **pas un lot** : aucun
code ne s'écrit à partir de lui. Chaque lot aura son brief au format habituel
(MODÈLE ET EFFORT, geste zéro, tests falsifiables, « ce qui n'est PAS dans ce
lot », rapport), et seulement après le feu vert d'Ethan.

Version 5, du 24/09/2026 (soir). Elle remplace la v4 de l'après-midi.

**Ce qui change :**

- La **couche 2 est réécrite** (§7) : une seconde cascade façon AD, sur
  laquelle se branchent les combustibles puis le critère de Lawson.
- Le **tower defense passe à la couche 4** (§9.4).
- La **tranche 1 est revue** en conséquence (§16.2).
- Le **dépôt existe** : `freredoc/Temperature-Critique-`, public.

Rappel des versions précédentes : la v4 a introduit la tranche 1, les outils
de test et le point de décision (§16) ; la v3, la courbe de répétition (§4.2),
les automatismes perdus puis regagnés (§11.1), les défis (§7.5, §8.5) et la
reprise open source (§5).

---

## 0. Les décisions d'Ethan

**23/09 :**

- **Genre et références** : AD est la base. « Cookie Clicker : bien trop lent
  et idle. » « AD : mon préféré, sauf vers la fin où il faut un guide. »
  « The Tower : p2w mais j'aime le principe. »
- **Thème** : physique, supraconducteur.
- **Exigences** : une UI simple qui se dévoile, un équilibre simple, ni
  longueurs ni P2W.
- **Durée** : « 5 h, c'est hyper léger ». Ethan a mis 20 jours sur AD, même en
  speedrun. **Cible : 1 mois.**
- **Structure** : plusieurs couches de prestige, **chacune avec une vraie
  nouvelle mécanique**. « Ok pour les couches » (les 5 du §3).
- **Systèmes à reprendre** : les études temporelles d'AD, sans que ça exige un
  guide, et un automate qu'on programme soi-même.
- **Ajout** : un tower defense ou un city builder basique.
- **Rythme** : le hors ligne ne doit pas pénaliser, l'actif doit rester
  intéressant.
- **Visuel** : pas de sprites, « du 8 bits bête et méchant ».

**24/09 :**

- **Courbe de prestige.** Première fois 5 h, puis environ ÷3 (1 h 30),
  1 h, 30 min, 15 min, et **quelques secondes vers la 100ᵉ**, puis quasi
  instantané vers la 1000ᵉ. **Même allure pour chaque couche.** « Qu'on sente :
  boum, un ralentissement, et très vite on reprend. »
- **Exemples de durée** : environ 5 jours pour la couche 2, et « 15 jours en
  tout » à la fin de la couche 3. Refaire la couche 3 une deuxième fois prend
  encore 3 à 4 jours.
- **Richesse** : « pas juste un plateau et deux boutons ». Il faut s'inspirer
  de tout ce qui marche : AD, The Tower, Revolution Idle.
- **Défis** : ils sont à garder, mais **pas trop durs**.
- **Glyphes** : **à éviter**. Ils sont difficiles à équilibrer et forcent à
  suivre un guide. Les boosts de ce genre se prennent « avec des pincettes ».
- **Automatismes** : à chaque prestige, on perd quasiment tous ses
  automatismes, puis on les regagne. C'est le modèle d'AD.
- **Code** : **s'inspirer des codes open source**, pour ne pas tout réinventer,
  ni le code ni l'équilibrage.
- **Priorité** : savoir **combien de lots** il faut.

**24/09, après-midi :**

- **Le vrai nombre de lots.** Sur ses deux autres jeux, Ethan compte **environ
  7 fois plus de lots** que prévu. La moitié sont des retours d'ergonomie, des
  tests, des ajouts, des modules, des rééquilibrages, des reprises, et des
  problèmes de relevé d'informations. Pour 15 lots prévus, il faudrait donc
  s'attendre à 75 ou plus : **un mois de Claude Code, pas une semaine.**
- **Les pièges à éviter.**
  - Une ergonomie ratée.
  - Des calculs faux, qui obligent à rééquilibrer et à **recommencer la partie
    de test à zéro**.
  - Un tower defense qui se révèle vide.
  - Sur Archipel, des mécaniques qui ne marchaient pas, ou une incompréhension.
- **Le contexte.** Ethan ne code pas, et il **ne pourra pas regarder Claude
  Code tourner en permanence** sur ce jeu.
- **Accord (« Ok »)** sur la réponse proposée :
  - tranche 1 = couches 1 et 2 complètes, puis décision ;
  - mode test et **joueur automatique** construits avant le contenu ;
  - prototype du tokamak en premier ;
  - retours regroupés en un lot par couche ;
  - lots qui se vérifient seuls.

  Le joueur automatique est un outil de mesure qui vit dans `tools/`, hors de
  la suite de tests. Il est **demandé par Ethan**, ce qui respecte sa règle
  (« un script de mesure seulement à sa demande »). La seule différence avec
  l'usage habituel : cet outil est **permanent**, pas jetable.

**24/09, soir :**

- Ethan teste **Evolve** : « pas trop mal ».
- **Le tower defense quitte la couche 2** et passe **à la couche 4, voire 5**.
  La couche 2 (fusion) doit donc trouver une autre mécanique. Voir l'encadré
  en tête du §7.
- **Le dépôt sera public**, créé par Ethan. Le jeu se testera donc sur le
  téléphone par GitHub Pages.
- **La couche 2 sera « une seconde cascade façon AD. Simple, mais on peut
  brancher d'autres mécanismes. Comme ce que tu as proposé »**, c'est-à-dire
  les combustibles (façon Evolve) et le critère de Lawson (§7).
- **Le dépôt est créé** : https://github.com/freredoc/Temperature-Critique-
  (public). Son nom fixe le titre : **Température Critique**.
- **Calendrier** : « fin de couche 3 : 12 j, couche 4 : 20 j, couche 5 :
  30 j » (§4.1).
- **« Ok tu commences »** : feu vert pour le brief du lot SOCLE.
- Ethan demande des **schémas et des maquettes**. Ils sont faits dans une page
  de design, « Température Critique — maquettes » : 5 schémas et 6 écrans de
  téléphone.

---

## 1. Le jeu en une page

Tu commences dans un labo à température ambiante, avec un fil de plomb. Tu
refroidis jusqu'à ce qu'il devienne **supraconducteur**, puis tu cherches des
matériaux à température critique de plus en plus haute. Avec ces aimants, tu
confines un plasma de **fusion**. La fusion t'amène aux **étoiles**, qui
meurent en supernovas, et les plus grosses laissent des **trous noirs**, qui
déforment le temps. Pour finir, tu relances l'univers en réglant ses
**constantes physiques**.

**La fin boucle sur le début** : la couche 5 se termine quand tu as réglé un
univers où **le plomb supraconduit à 300 K**, ce qui n'existe pas dans le
nôtre.

Les températures, les seuils et les formules viennent de la vraie physique.
Chaque simplification est déclarée, et chaque valeur inventée pour le jeu est
signalée comme telle dans le jeu.

---

## 2. Les neuf piliers

| # | Pilier | Règle vérifiable |
|---|---|---|
| P1 | L'écran se dévoile | Au lancement, **un nombre et un bouton**. Chaque couche ajoute **un seul onglet**. |
| P2 | Équilibre simple | **Une table de constantes par couche**, une formule par système, chaque formule affichée dans le jeu. **Aucun système ne crée d'exception à la règle d'un autre.** |
| P3 | Pas de longueurs | Jamais plus de **~2 h de jeu actif** sans un nouveau déblocage, ni plus d'**un jour** sans un jalon. |
| P4 | Zéro P2W | Ni achat, ni pub, ni monnaie premium, **ni minuteur à attendre**. Tout marche hors ligne. |
| P5 | Jamais besoin d'un guide | L'**objectif suivant est toujours affiché**, aucune condition n'est cachée, et un **aperçu** s'affiche avant chaque choix. Le **carnet de labo** est le guide. **Pas de glyphes** ni d'objets aléatoires à optimiser. |
| P6 | Hors ligne non pénalisant, actif intéressant | Le hors ligne avance au même rythme que l'appli laissée ouverte sans toi. L'actif rapporte **×2 à ×3 de plus**, jamais ×10. |
| P7 | Une vraie mécanique neuve par couche | Chaque couche apporte **un nouveau verbe** et plusieurs systèmes (§3), pas « un plateau et deux boutons ». |
| P8 | La courbe de prestige | Refaire une couche suit **T_k ≈ T₁ × k^−1,8** (§4.2). |
| P9 | Boum, puis ça repart | Un nouveau prestige **retire la plupart des automatismes**, et les **jalons** les rendent vite (§11.1). Le ralentissement doit se sentir, et la reprise aussi. |

⚠ **P5 EST CE QUI A GÂCHÉ LA FIN D'AD POUR ETHAN.** Toute proposition qui ajoute
une exception, une condition cachée, ou un objet aléatoire à optimiser
(le modèle des glyphes) se discute avant d'être écrite.

---

## 3. Les cinq couches d'un coup d'œil

| Couche | Physique | Verbe | Prestige | Monnaie | Systèmes | Équivalent AD |
|---|---|---|---|---|---|---|
| **1** | Supraconductivité | refroidir | **Quench** | Webers | 8 machines, 6 paliers de froid, 8 matériaux, transition, labo (3 lignes), 3 automatismes | l'avant-Infinity |
| **2** | Fusion | cascader | **Décharge** | Neutrons | 8 réacteurs en cascade, combustibles (D, T, lithium), critère de Lawson (Q), grille de neutrons 4×4, jalons de décharge, 8 expériences | Infinity (et ses Infinity Dimensions) |
| **3** | Étoiles | choisir une masse | **Supernova** | Noyaux | gaz, étoile (masse, vie, chaîne de 6 éléments, 3 fins), métallicité, tableau périodique (81 configurations), jalons de supernova, 5 expériences répétables | Eternity |
| **4** | Trous noirs | plonger (et défendre) | **Horizon** | Entropie | dilatation du temps (r, γ, poussée), **tower defense** (le disque d'accrétion), ~20 jalons d'entropie, programmateur (règles et séquences) | Reality, **sans les glyphes** |
| **5** | Cosmologie | régler | **Big Crunch** | Réglages | 4 constantes, univers accordé, fin, bac à sable | aucun |

Et, pour toutes les couches : **succès, carnet de labo, hors ligne**.

---

## 4. Le temps

### 4.1 Le calendrier : un mois

C'est un mois de calendrier, avec **1 à 2 h de jeu actif par jour** (30 à 60 h
actives au total), et le reste hors ligne. **Les fins de couche sont celles
d'Ethan (24/09 au soir) : couche 3 à J12, couche 4 à J20, couche 5 à J30.**
Pour les couches 1 et 2, on garde ses exemples du 24/09 : ~5 h, puis J5.

| Couche | Fin visée | Durée de la couche |
|---|---|---|
| 1 | J0 + 5 h | ~5 h |
| 2 | J5 | ~4,8 j |
| 3 | J12 | 7 j |
| 4 | J20 | 8 j |
| 5 | J30 | 10 j |

Chaque couche dure plus longtemps que la précédente, comme dans AD.

⚠ **SEULE LA COUCHE 1 EST MESURÉE**, par simulation. Le reste, ce sont des
cibles, calées couche par couche avant leurs lots.

### 4.2 La courbe de répétition : « boum, puis ça repart »

Une seule loi pour toutes les couches :

```
T_k ≈ T₁ × k^(−1,8)      T₁ = durée de la 1re fois, k = rang de la répétition
```

L'exposant 1,8 n'est pas choisi au hasard : il vient de l'exemple d'Ethan. Un
ajustement sur ses six points (5 h, 1 h 30, 1 h, 30 min, 15 min, et ~5 s à la
100ᵉ) donne **1,796**.

| k | Couche 1 (T₁ = 5 h) | Couche 2 (T₁ = 5 j) | Couche 3 (T₁ = 7 j) |
|---|---|---|---|
| 1 | 5 h | 5 j | 7 j |
| 2 | 1,4 h | 1,4 j | 2 j |
| 3 | 42 min | 17 h | 23 h |
| 5 | 17 min | 6,6 h | 9,3 h |
| 10 | 5 min | 1,9 h | 2,7 h |
| 100 | 4,5 s | 2 min | 2,5 min |
| 1000 | 0,07 s | 1,7 s | 2,4 s |

- La **deuxième fois est ~3,5 fois plus rapide** (2^1,8), ce qui correspond au
  « tu divises par 3 » d'Ethan.
- Dans l'exemple d'Ethan pour la couche 2 (1 j, puis 6 h, puis 3 h), les
  durées tombent plus vite qu'avec cette loi. Si c'est le ressenti voulu,
  **c'est un seul nombre à changer** : l'exposant.
- **Le ralentissement à chaque nouveau prestige** vient de la perte des
  automatismes. La **reprise** vient des jalons qui les rendent (§11.1).
  Ensemble, ils dessinent la courbe.

⚠ **CETTE LOI EST UNE CIBLE D'ÉQUILIBRAGE, PAS UNE FORMULE DU JEU.** Personne
n'écrit « k^−1,8 » dans le code. Ce sont les tables de chaque couche (prix,
jalons, multiplicateurs) qui doivent la produire. C'est le joueur
automatique qui la vérifie (§13), à chaque lot d'équilibrage. Pour la couche 1
répétée, c'est au lot 14.

---

## 5. Ce qu'on reprend de l'open source

### 5.1 Les sources, et ce que leur licence permet

| Source | Licence (vérifiée) | Ce qu'on en prend | Comment |
|---|---|---|---|
| **Antimatter Dimensions** (© 2017 IvarK) | **MIT** | les formules et les tables (coûts, prestiges), la structure des jalons, des défis et de la grille d'améliorations, les idées de l'automate et du trou noir | copie autorisée, **avec la mention MIT dans le fichier** |
| **break_infinity.js** (la bibliothèque de nombres d'AD) | **MIT** | les très grands nombres | intégrée telle quelle |
| **@antimatter-dimensions/notations** | **MIT** | l'affichage des nombres (scientifique, ingénieur…) | intégrée telle quelle |
| **Incremental Mass Rewritten** (© 2021 MrRedShark77) | **MIT** | un incrémental **de physique** qui a déjà des couches trou noir et supernova : des formules de référence pour nos couches 3 et 4 | copie autorisée, avec mention |
| **The Modding Tree** (© 2020 Acamaeda) | **MIT** | la gestion générique des couches de prestige | lecture seulement : c'est un framework Vue, on ne l'adopte pas |
| Evolve | MPL-2.0 | des idées | **pas de copie de code** (le copyleft s'applique fichier par fichier) |
| The Tower, Revolution Idle | **fermés** | des idées de mécaniques (§5.3) | **idées seulement**. Une mécanique ne se protège pas, mais le code, les textes et les visuels, si. |

### 5.2 Sur la phrase « l'équilibrage est déjà là »

C'est vrai en partie, et il faut savoir où s'arrête ce qui est vrai.

- **Vrai pour ce qui est calqué sur AD.** Les coûts des machines (déjà repris
  tels quels), la *forme* des formules de prestige, les courbes de prix, la
  structure des jalons et des défis ont été éprouvés par des milliers de
  joueurs. On part de leurs nombres.
- **À recaler quand les échelles diffèrent.** AD fait tout tourner autour de
  1,8e308, alors que nos webers démarrent à 0,05. Certaines formules passent
  **en forme** (exposants, pentes), mais pas en nombres bruts.
- **Faux pour ce qui est neuf** : le tower defense, la masse d'étoile, la
  poussée près de l'horizon, les constantes. Rien d'open source ne les équilibre
  à notre place. C'est là que la simulation sert.
- **AD n'est pas un modèle au-delà d'Eternity**, et c'est Ethan qui l'a dit. On
  s'arrête aux parties d'AD qui ne demandent pas de guide (avant Reality), et
  **les glyphes sont exclus**.

⚠ **ON NE FORKE PAS AD.** Son code, c'est Vue 2, Firebase et des centaines de
fichiers. Le forker donnerait vite un jeu qui tourne, mais il faudrait ensuite
en arracher du contenu pour chaque couche, ce qui est l'inverse de P1 et de
P5, et ça sortirait du format fichier unique sans framework des deux autres
jeux. On **porte** les formules et les tables, module par module, dans notre
structure, avec la mention MIT.

### 5.3 Ce qu'on prend à chaque jeu, idée par idée

| Idée | Vient de | Où elle va |
|---|---|---|
| Machines en cascade | AD (dimensions) | couche 1 |
| Seconde cascade qui multiplie la première | AD (Infinity Dimensions) | couche 2 : réacteurs |
| Grille d'améliorations 4×4 achetées colonne par colonne | AD (Infinity upgrades) | couche 2 : grille de neutrons |
| **Un défi réussi débloque ou améliore un automatisme** | AD (Normal Challenges) | couche 2 : expériences |
| **Jalons qui rendent les automatismes** selon le nombre de prestiges | AD (Eternity milestones) | couches 2 et 3 |
| Défis répétables, avec des objectifs qui montent | AD (Eternity Challenges) | couche 3 |
| Arbre à trois voies Actif / Passif / Hors ligne, réinitialisable | AD (Time Studies) | couche 3 : tableau périodique |
| Automate programmable | AD (Automator, mode blocs) | couche 4 : programmateur |
| Accélération du temps | AD (Black Hole) et Incremental Mass | couche 4, avec une autre mécanique : la poussée |
| Supernova, trou noir comme couches | Incremental Mass Rewritten | couches 3 et 4 |
| Tour au centre, ennemis radiaux, atelier permanent | The Tower | couche 4 : tower defense |
| **Choisir 1 bonus parmi 3** pendant le run | The Tower (perks) | couche 4 : tower defense |
| **Capacités actives avec temps de recharge** | The Tower (ultimate weapons) | couche 4 : l'actif (P6) |
| Choisir 1 buff parmi plusieurs au moment d'un reset | Revolution Idle (promotion) | couche 3 : l'héritage de supernova |
| Chaîne de ressources interdépendantes | Evolve (idées seulement, MPL-2.0) | couche 2 : combustibles |
| **Succès** qui donnent chacun un petit multiplicateur | Revolution Idle, AD | toutes les couches |

---

## 6. Couche 1 — Supraconductivité (le labo)

**Verbe : refroidir.** C'est la seule couche entièrement calée et simulée. Les
chiffres de la v1 et de la v2 restent valides.

### 6.1 Les machines

Huit machines en cascade : **la machine 1 produit de l'énergie, et la machine
n produit la machine n − 1.**

- Noms (tranchés le 02/10) : Dynamo, Alternateur, Turbine, Centrale, Réseau,
  Cyclotron, Synchrotron, Collisionneur.
- Prix constant par lot de 10, puis ×facteur. Chaque lot complet **double** la
  production.
- 4 machines au début d'un run, +1 par palier, 8 au maximum.
- Coûts `[10, 100, 1e4, 1e6, 1e9, 1e13, 1e18, 1e24]` et facteurs
  `[1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12, 1e15]` : **ceux d'AD**, vérifiés
  dans `src/core/dimensions/antimatter-dimension.js` (MIT).

### 6.2 Les paliers de froid

Franchir un palier coûte un seuil d'énergie, et c'est le joueur qui appuie.
Effet : retour à 10 J et zéro machine, la température descend d'un cran,
**toutes les machines passent à ×2** (cumulatif sur le run), et une machine
de plus se débloque.

| Palier | Technique | T (K) | Seuil |
|---|---|---|---|
| 0 | Ambiante | 300 | — |
| 1 | Glace carbonique | 194,65 | 1e9 J |
| 2 | Azote liquide | 77,36 | 1e15 J |
| 3 | Néon liquide | 27,10 | 1e22 J |
| 4 | Hydrogène liquide | 20,28 | 1e30 J |
| 5 | Hélium liquide | 4,22 | 1e39 J |
| 6 | Hélium pompé | 1,5 | 1e44 J |

### 6.3 Le matériau, la transition, le quench

- Sous **Tc** : la résistance tombe à zéro, **l'énergie de la machine 1 est
  ×10**, et le bouton **Quench** apparaît.
- Le quench rapporte `Flux (Wb) = Bc0 × (1 − (T/Tc)²) × S`. **Le choix** :
  quencher tout de suite, ou payer un palier de plus pour un champ plus fort.
  Le jeu affiche les deux gains avant.

| Matériau | Tc (K) | Bc0 (T) | Supra dès le palier | Origine | Prix (Wb) |
|---|---|---|---|---|---|
| Plomb | 7,19 | 0,08 | 5 | réelles | départ |
| NbTi | 10 | 15 | 5 | réelles | 0,05 |
| Nb₃Sn | 18,3 | 30 | 5 | réelles | 300 |
| MgB₂ | 39 | 74 | 3 | réelles | 8 000 |
| YBCO | 95 | 120 | 2 | réelles (bas de la fourchette 120–250) | 50 000 |
| Hg-1223 | 135 | 200 | 2 | Tc réelle, Bc0 **de jeu** | 300 000 |
| H₃S | 203 | 300 | 1 | Tc réelle **sous 155 GPa**, Bc0 **de jeu** | 600 000 |
| Graal | 320 | 1000 | 0 | **fictif** | 4 000 000 |

### 6.4 Le labo et les automatismes

| Ligne | Effet | Prix | Plafond |
|---|---|---|---|
| Rendement | toutes les machines ×2 | 0,02 Wb, ×10 par niveau | **3 niveaux** |
| Bobine | surface S ×2 | 0,05 Wb, ×10 par niveau | aucun |
| Matériaux | matériau suivant | table §6.3 | — |

**Automatismes** : l'Assistant d'achat est offert au 1ᵉʳ quench. Le
Régulateur (~10 Wb) et le Déclencheur (~100 Wb) sont à caler. Chacun a son
interrupteur.

### 6.5 Mesures et pièges (simulation du 23/09)

- **Premier run** : transition du plomb à **29 min 11 s**. Jamais plus de
  **31 s** sans un achat possible.
- **Couche entière** : un nouveau matériau toutes les **34 à 52 min**, et le
  **Graal en ~5 h**.

⚠⚠ **PIÈGE 1 — un Rendement sans plafond tue la mécanique de Tc** (mesuré :
323 runs d'une minute). Le plafond ne vaut que pour la couche 1 jouée seule.

⚠⚠ **PIÈGE 2 — sans la Bobine, la fin de la couche est un mur** de 2 h 30 à
plus de 4 h.

⚠ **PIÈGE 3 — un ×10 supra sur toute la cascade rend trivial le choix du
palier.** Il porte donc sur l'énergie seule.

---

## 7. Couche 2 — Fusion (les réacteurs)

**Verbe : cascader.** Décision d'Ethan du 24/09 au soir : « une seconde
cascade façon AD. Simple, mais on peut brancher d'autres mécanismes ». Le
modèle est celui des Infinity Dimensions d'AD. Deux branchements, que
j'avais proposés, s'y greffent l'un après l'autre. Le tower defense est parti
à la couche 4 (§9.4).

### 7.1 Le prestige : la Décharge

Dans un vrai tokamak, chaque tir s'appelle une décharge. Ici, une décharge :

1. **remet à zéro toute la couche 1**, sauf ce que les jalons font garder
   (§7.4) ;
2. paie en **neutrons**.

Formule de départ, dont la forme est à recaler :
`Neutrons = √(Wb gagnés depuis la dernière décharge ÷ 10⁶) × (1 + Q)`.

- **Q vient du critère de Lawson** (branchement 2). Tant qu'il n'est pas
  débloqué, Q = 0.
- Juste après le premier Graal, la formule donne ~2,2 neutrons à Q = 0, ~4,5 à
  Q = 1 et ~13 à Q = 5.

### 7.2 Les réacteurs, puis les branchements

**La seconde cascade (modèle : Infinity Dimensions d'AD).** Même règle que
les machines :

- **8 réacteurs**, et **chacun produit le précédent**. Le réacteur 1 produit la
  **puissance de fusion**, en MW.
- Ce sont de vrais concepts de fusion, du plus simple au plus exotique :
  1. Fusor
  2. Z-pinch
  3. Miroir magnétique
  4. Stellarator
  5. Tokamak
  6. Sphéromak
  7. FRC (configuration à champ inversé)
  8. Confinement inertiel (laser)
- On les **achète en neutrons**. Le prix est constant par lot de 10, et chaque
  lot complet double la production.
- Les réacteurs 2 à 8 se débloquent par jalons de décharge.
- **La puissance de fusion multiplie la production de la couche 1.** Dans AD,
  c'est la puissance d'Infinity élevée à une puissance. La forme est à
  reprendre, l'exposant à caler.
- **Une vraie décision** : les neutrons vont soit dans la cascade, soit dans la
  grille (§7.3), soit dans les branchements.

**Branchement 1 — les combustibles (façon Evolve).** Il est débloqué par un
jalon de décharge (à caler).

- Le **deutérium** vient de l'eau de mer, et il se régénère tout seul.
- Le **tritium** se fabrique à partir du **lithium bombardé de neutrons**,
  dans la couverture du réacteur. C'est le vrai procédé. On monte le niveau de
  la couverture lithium en neutrons.
- Les réacteurs consomment D et T. **Si le tritium manque, ils ralentissent**,
  au prorata de ce qui manque.
- Le **TBR** (taux de régénération du tritium) est affiché. **TBR ≥ 1** : le
  tritium se renouvelle. C'est un vrai critère de conception des centrales à
  fusion, et ici c'est un jalon.
- **La décision** : les neutrons vont dans les réacteurs ou dans la couverture.

**Branchement 2 — le critère de Lawson.** Il est débloqué par un jalon plus
tardif.

- **Trois réglages** : la densité n, la température T et le temps de
  confinement τ. On règle leur niveau.
- **Ils se gênent** : monter T abaisse τ (chauffer dégrade le confinement), et
  n est plafonné par une limite de densité. Il y a donc un **optimum**, que
  l'aperçu montre avant chaque réglage (P5).
- Le produit **n·T·τ** est comparé au seuil d'ignition D-T, ~3 × 10²¹
  keV·s·m⁻³. Il donne **Q**, qui entre dans la formule de la décharge.
- **C'est le levier actif de la couche (P6)** : en jouant, on suit l'optimum.
  Hors ligne, le dernier réglage tient.
- **Les jalons de Q suivent la vraie physique :**

| Q | Jalon |
|---|---|
| 1 | seuil de rentabilité |
| 5 | plasma en combustion |
| 10 | objectif d'ITER |
| 30 | jalon de jeu |
| **100** | **débloque la couche 3** |

⚠ **UN BRANCHEMENT N'A PAS LE DROIT DE CHANGER LA RÈGLE DE LA CASCADE (P2).**
Il agit par un seul multiplicateur sur la production des réacteurs
(combustibles), ou sur les neutrons (Lawson). C'est ce qui permet d'en ajouter
d'autres plus tard sans rien casser, et c'est tout le sens de « on peut brancher
d'autres mécanismes ».

### 7.3 La grille de neutrons (modèle : Infinity upgrades d'AD)

**16 améliorations en 4 colonnes de 4**, achetées de haut en bas dans chaque
colonne :

- **Labo** : production de la couche 1.
- **Froid** : seuils des paliers.
- **Réacteurs** : production et déblocage des réacteurs.
- **Neutrons** : gain de neutrons.

Plus une ligne répétable, **gain de neutrons ×2**.

### 7.4 Les jalons de décharge (modèle : Eternity milestones d'AD)

C'est le mécanisme de P9. Au début de la couche 2, on a **tout perdu**, puis
on regagne :

| Décharges | Tu gardes |
|---|---|
| 1 | l'Assistant d'achat |
| 2 | le Régulateur |
| 3 | tu démarres avec NbTi |
| 5 | le Déclencheur |
| 10 | tu démarres avec tous les matériaux jusqu'à YBCO |
| 25 | tu démarres avec le labo complet |
| 50 | tu démarres avec le Graal |
| 100 | **la Décharge automatique** |

La table est à caler, mais la **forme est celle d'AD** : le dernier jalon est
l'automatisme du prestige lui-même, à la 100ᵉ fois. C'est ce qui fait qu'à la
100ᵉ décharge la couche 1 ne prend plus que quelques secondes (§4.2).

### 7.5 Les expériences (défis, modèle : Normal Challenges d'AD)

**8 expériences.** Chacune rejoue la couche 1 **jusqu'au Graal**, sous une
contrainte **affichée en entier**. La réussir **débloque ou améliore un
automatisme**, ou donne un bonus permanent.

Exemples, à écrire au lot :

- **Fil résistif** : le ×2 des paliers devient ×1,5.
- **Pompe fatiguée** : chaque seuil ×10.
- **Sans assistant** : les automatismes de la couche 1 sont coupés.
- **Bobine unique** : la ligne Bobine est bloquée.
- **Cuivre impur** : machine 1 ÷10, les autres ×2.
- **Quench spontané** : le run se quenche tout seul à la transition.
- **Budget serré** : 3 matériaux au maximum.
- **Tout à la fois** : trois des précédentes en même temps.

⚠ **« PAS TROP DURS » SE CHIFFRE.** Chaque expérience doit se réussir en
**moins de 2 fois** le temps d'un run normal au même stade. On peut
l'abandonner à tout moment sans rien perdre, et elle rappelle sa contrainte à
l'écran pendant tout le run.

---

## 8. Couche 3 — Étoiles (et le tableau périodique)

**Verbe : choisir une masse.** C'est la structure d'Eternity dans AD.

### 8.1 L'étoile

- Le **gaz interstellaire** (en M☉) se régénère avec le temps. Former une
  étoile de masse M consomme M de gaz, jusqu'à un maximum M_max qui monte avec
  l'arbre.
- **Durée de vie ∝ M^−2,5**. Une étoile de 8 M☉ vit 1/181 de la durée du
  Soleil, une de 25 M☉ 1/3125. La vitesse de combustion dépend aussi de la
  couche 2.
- La **chaîne H → He → C → O → Si → Fe** est simplifiée, et le jeu le dit.
  Chaque élément donne **un seul bonus** :

| Élément | Bonus |
|---|---|
| He | seuils des paliers ÷ (c'est le cryogène) |
| C | production de la couche 1 × |
| O | neutrons × |
| Si | automatismes plus rapides |
| Fe | production des réacteurs × |
| au-delà du fer | débloque les rangées lourdes de l'arbre |

- **Trois fins, selon les vrais seuils :**
  - **< 8 M☉ → naine blanche** : pas de prestige, seulement des éléments
    légers. C'est la « petite partie », quand on ne veut pas tout recommencer.
  - **≥ 8 M☉ → supernova** : c'est le prestige.
  - **≥ 25 M☉ → trou noir**, la 1ʳᵉ fois : **débloque la couche 4**. Le vrai
    seuil est incertain (~20 à 25 M☉), donc c'est un seuil de jeu, et le jeu le
    dit.

### 8.2 Le prestige : la Supernova

**Choisir la masse, c'est choisir le moment du prestige.** C'est ce qui est
nouveau par rapport à AD.

- **Remet à zéro** les couches 1 et 2, **décompte des décharges compris** :
  c'est le « boum » de P9.
- **Paie des Noyaux**. Point de départ : `M × log10(neutrons gagnés depuis la
  dernière supernova)`.
- **Enrichit la galaxie** : du gaz revient, la **métallicité** monte (les vraies
  générations d'étoiles), et elle sert de multiplicateur permanent.
- **L'héritage (idée de Revolution Idle)** : à chaque supernova, tu choisis
  **1 bonus parmi 3** pour le cycle suivant.

### 8.3 Le tableau périodique (modèle : Time Studies d'AD)

- La **racine est gratuite** (H et He).
- **4 rangées** (périodes 2 à 5) et **3 colonnes**, qui sont les trois styles
  de jeu :

| Période | **Actif** : alcalins | **Passif** : groupe 14 | **Hors ligne** : gaz nobles |
|---|---|---|---|
| 2 | Li | C | Ne |
| 3 | Na | Si | Ar |
| 4 | K | Ge | Kr |
| 5 | Rb | Sn | Xe |

- **Une seule colonne par période**, soit **81 configurations**. Un jalon
  tardif permet d'en prendre deux dans une même période.
- Les nœuds au-delà du fer (Ge, Kr, Rb, Sn, Xe) demandent des éléments lourds,
  donc des supernovas.
- On achète en Noyaux, **tout est remboursé à chaque supernova**, et on peut
  garder **3 configurations** sauvegardées.
- Chaque nœud affiche **son effet exact** et un **aperçu avant l'achat**.
- **Actif** : un bonus fort pendant 60 s après chaque action. **Passif** : des
  multiplicateurs constants. **Hors ligne** : un bonus qui grandit avec le temps
  sans agir.

⚠ **LA COLONNE ACTIF BAT LA COLONNE HORS LIGNE DE ×2 À ×3, PAS PLUS** (P6).

### 8.4 Les jalons de supernova

Même principe qu'au §7.4 :

| Supernovas | Tu gardes |
|---|---|
| 1 | les jalons de décharge 1 à 5 |
| 3 | tous les jalons de décharge |
| 5 | la grille de neutrons complète |
| 10 | les expériences de la couche 2 réussies |
| 25 | la Décharge automatique dès le départ |
| 100 | **la Supernova automatique** (masse choisie par le joueur) |

### 8.5 Les expériences de la couche 3 (modèle : Eternity Challenges d'AD)

**5 expériences, chacune répétable 5 fois**, avec un objectif qui monte et une
récompense qui grandit. Exemples :

- **Étoile sans métaux** : métallicité à zéro.
- **Sans lithium** : la couverture ne produit plus de tritium.
- **Arbre verrouillé sur une colonne.**
- **Gaz rare** : régénération ÷10.
- **Nucléosynthèse courte** : la chaîne s'arrête à O.

⚠ **Même règle qu'au §7.5 : pas trop durs, contrainte affichée, abandon
toujours sans perte.**

---

## 9. Couche 4 — Trous noirs (et le programmateur)

**Verbe : plonger.** C'est la place de Reality dans AD, **sans les glyphes**.

### 9.1 La dilatation du temps

- Ton labo se tient **immobile** à une distance r de l'horizon. Pour lui, le
  reste de l'empire (couches 1 à 3) tourne plus vite, d'un facteur
  `γ = 1/√(1 − r_s/r)` : **1,41 à 2 r_s, 3,3 à 1,1 r_s, 10 à 1,01 r_s, 100 à
  1,0001 r_s.**
- **Tenir la position coûte de la poussée** : `a = GM / (r²√(1 − r_s/r))`, qui
  diverge à l'horizon. Elle se paie **en énergie de la couche 1**. Plonger
  accélère tout, mais mange une part de la production. C'est le dosage à
  trouver.
- **Plus le trou noir est massif, moins la plongée coûte** : à r/r_s égal, a
  varie en 1/M. C'est vrai, et ça sert de progression.
- Si la poussée manque, **le labo remonte tout seul**. On ne perd jamais sa
  partie en tombant.
- **En actif**, on plonge au plus près. **Hors ligne**, le labo reste à sa
  position de croisière, que la colonne Hors ligne améliore.

### 9.2 Le prestige : l'Horizon

- **Remet à zéro** les couches 1 à 3, **décomptes de supernovas compris**
  (P9). Les configurations de l'arbre sont gardées.
- **La masse du trou noir augmente** en fonction de ce que la couche 3 avait
  accumulé.
- **Rapporte de l'entropie**, avec la formule de Bekenstein-Hawking
  (S ∝ M²) : ~1,05 × 10⁷⁷ k_B pour une masse solaire, de 6,6 × 10⁷⁹
  (25 M☉) à 1,7 × 10⁹⁰ (4 millions de M☉).
- **L'entropie ne se dépense jamais** (c'est le second principe). La couche 4
  **n'a pas de boutique** : elle a **~20 jalons d'entropie**, un par
  demi-décade. Ils débloquent le programmateur, la supernova automatique dès
  le départ, la double colonne de l'arbre, une rangée 6, etc., et ils rendent
  les jalons de supernova (P9).
- **Couche 5** débloquée à **4 millions de M☉**, la masse de Sagittarius A*.

⚠ **PAS DE GLYPHES, PAS D'OBJETS ALÉATOIRES.** Ethan, 24/09 : ils « obligent à
suivre un guide ». Dans cette couche, tout ce qui se gagne est un jalon fixe,
visible à l'avance.

### 9.3 Le programmateur (modèle : Automator d'AD, mode blocs)

Rien ne se tape au clavier : tout se construit avec des menus déroulants.

- **Règles** : `SI [variable] [>, <, =] [valeur] (ET …) ALORS [action]`,
  évaluées dans l'ordre à chaque pas.
  - Variables : énergie, palier, flux prévu, Wb, Q, vague, gaz, masse,
    entropie, temps depuis le dernier prestige…
  - Actions : refroidir, quencher, décharger, former une étoile de masse X,
    charger une configuration d'arbre, horizon, régler r.
  - 8 règles au départ, davantage avec les jalons.
- **Séquences**, débloquées par un jalon plus tardif : des étapes numérotées
  avec `ATTENDRE JUSQU'À [condition]`.
- **Export et import en texte.**

⚠ **Pas de boucles ni de variables libres** : c'est ce qui le garde lisible
sans guide.

### 9.4 Le tower defense : le disque d'accrétion

Venu de la couche 2 par décision d'Ethan du 24/09 au soir. **À concevoir en
détail à la passe de conception de la couche 4.** Voici ce qui est déjà
acquis :

- **C'est le modèle de The Tower**, sans carte ni chemin. Ton **labo en vol
  stationnaire** est au centre, et la **matière du disque d'accrétion** arrive
  sur lui en ligne droite. Tu ne poses rien : tu améliores, tu choisis, tu
  déclenches.
- **Le lien avec la plongée (§9.1)** : plonger plus près accélère le temps
  (γ), mais **densifie les débris**. Défendre, c'est ce qui permet de tenir une
  plongée plus profonde. C'est le « défendre » de la couche 4, et ça remplace
  une partie du coût de la poussée.
- **Ce qui vient de la conception v3**, et reste valable :
  - plusieurs familles d'ennemis aux comportements distincts (rapide et
    fragile, lent et résistant, en bouffées) ;
  - des stats en trois familles (attaque, défense, rendement) ;
  - deux monnaies (une gagnée pendant le run et perdue à la fin, une
    permanente) ;
  - **choisir 1 bonus parmi 3** toutes les 10 vagues ;
  - **deux capacités actives** avec un temps de recharge, qui sont le levier
    actif (P6) ;
  - l'achat automatique en run, par jalon.
- **La fin d'un run** : le labo **remonte tout seul** à une distance sûre
  (§9.1). On ne perd jamais sa partie.
- ⚠ **Le principe du prototype tient** : c'est la mécanique la plus neuve du
  jeu, donc elle aura un lot de prototype avant sa construction, au début de la
  couche 4.

---

## 10. Couche 5 — Cosmologie (et la fin)

**Verbe : régler.**

- **Big Crunch** : remet à zéro les couches 1 à 4. Il **garde** les réglages,
  les scripts, les configurations, le carnet, les succès et **tous les
  automatismes**. À partir d'ici, plus de « boum » : c'est la dernière couche.
- **Il rapporte des réglages** : +1 par crunch, plus un bonus si l'univers a
  été mené vite.

**Les quatre constantes.** Tout est remboursé à chaque crunch, donc on teste
librement :

| Constante | Bonus | Malus | Couche |
|---|---|---|---|
| **λ**, couplage électron-phonon | Tc ×1,5 par niveau (en théorie BCS, Tc croît avec λ) | paliers plus chers (un bon supra est un mauvais conducteur normal) | 1 |
| **α**, structure fine (plus petite) | barrière coulombienne plus basse, donc Q plus haut | la paroi s'érode plus, donc des vagues plus denses | 2 |
| **G** | étoiles plus rapides, seuil du trou noir abaissé | masse maximale réduite | 3 et 4 |
| **c** (plus petite) | r_s plus grand, donc plongée moins chère | E = mc² plus petit, donc moins de neutrons | 4 et 2 |

**La fin : l'univers accordé.** Au niveau 10 de λ, le plomb a une Tc de
7,19 × 1,5¹⁰ ≈ 415 K, et il supraconduit à température ambiante. Au niveau 9,
on n'est qu'à 276 K. Pour y arriver, il faut compenser les malus de λ avec les
trois autres constantes. **Scène de fin** : un labo à 300 K, un fil de plomb,
déjà supraconducteur. Ensuite, un **bac à sable**.

---

## 11. Les systèmes transverses

### 11.1 Les automatismes : perdus, puis rendus (P9)

**Une seule règle** : un prestige remet à zéro tout ce qui est en dessous de
lui, **automatismes compris**, sauf ce qu'un **jalon** ou une amélioration du
dessus fait explicitement garder.

| Prestige | Ce qui repart de zéro | Ce qui rend les automatismes |
|---|---|---|
| Quench | l'énergie, les machines, la température | rien n'est perdu |
| Décharge | toute la couche 1 | les jalons de décharge (§7.4) |
| Supernova | les couches 1 et 2, décomptes compris | les jalons de supernova (§8.4) |
| Horizon | les couches 1 à 3, décomptes compris | les jalons d'entropie (§9.2) |
| Big Crunch | les couches 1 à 4 | rien : **tout est gardé** |

⚠ **AUCUNE « PETITE EXCEPTION » DANS LE CODE D'UN PRESTIGE.** Ce qui est gardé
l'est parce qu'un jalon ou une amélioration le dit, et le jeu affiche cette
liste avant chaque prestige.

### 11.2 Les succès

C'est l'idée d'AD et de Revolution Idle : **~60 succès**, environ 12 par
couche. Chacun donne **+1 % de production partout** (multiplicatif), et
certains un petit bonus nommé. Ce sont des objectifs secondaires, jamais
cachés : le jeu affiche la condition de chacun.

### 11.3 Le hors ligne

- Au retour, le jeu **rejoue le temps écoulé** avec les mêmes formules et les
  automatismes actifs, **par grands pas (1000 au plus, comme AD)**. Ce n'est
  **pas exact** : un grand pas n'intègre pas une cascade comme mille petits.
  Corrigé le 24/09 au soir (lot SOCLE), et l'écart se mesure avec le joueur
  automatique.
- Les décharges automatiques se rejouent comme le reste. Le tower defense
  (couche 4), lui, rapporte hors ligne la moyenne de tes 10 derniers runs.
  L'étoile continue de vivre. Le trou noir reste à la position de croisière.
- **Écran de retour** : ce qui s'est passé pendant l'absence.
- **Pas de plafond** : c'est une proposition, à arbitrer (§18).

### 11.4 L'écran qui se dévoile, et le carnet

- **Couche 1** : « 10 J » et un bouton. Les cartes de machine arrivent une à
  une, puis la barre de température, la fiche du matériau, le bouton Quench, et
  l'onglet Labo.
- **Ensuite, un onglet par couche** : Labo · Fusion · Étoile · Trou noir ·
  Univers, plus un menu (Expériences, Succès, Programmateur, Carnet, Options).
- La **ligne « Objectif »** est toujours visible.
- **Le carnet de labo** : pour chaque découverte, la mécanique en une phrase,
  sa formule, et la vraie physique en trois lignes. Chaque nouveauté affiche une
  carte une seule fois, qui reste relisible dans le carnet.

---

## 12. La direction visuelle : 8 bits

- **Aucun sprite, aucune image** : tout est dessiné par le code, donc **pas de
  pipeline graphique**.
- **16 couleurs**, définies dans la table.
- L'étoile, le trou noir et le tower defense sont dessinés sur un canvas en
  basse résolution, agrandi avec des pixels nets.
- Les listes et les boutons sont en HTML, avec une **police pixel libre**,
  intégrée et vérifiée (accents français, licence) au lot SOCLE.
- Mobile en portrait, une colonne. L'appareil de test est le S25 FE, où seule
  la marge basse est active.

---

## 13. La technique

- **Même famille que les deux autres jeux** : un seul fichier HTML, hors ligne,
  sans CDN, puis un wrapper Android WebView.
- **Nouveau dépôt** (nom à choisir), avec la structure de Foyer Zéro :
  `src/data/` (une table par couche), `src/sim/` (logique pure), `src/ui/`,
  `tools/build.js` → `dist/index.html`, et `npm run check`.
- **Les nombres : `break_infinity.js`, la bibliothèque d'AD** (MIT). La v2
  prévoyait `break_eternity.js`. Changer permet de porter les formules d'AD
  sans conversion, et `break_infinity.js` suffit : elle va jusqu'à ~10^(9×10¹⁵),
  loin au-delà de ce que le jeu atteint. **Le choix se fait au lot SOCLE, avant
  le format de sauvegarde.**
- **L'affichage des nombres : `@antimatter-dimensions/notations`** (MIT).
- **La simulation est pure et déterministe** : pas fixe, et un hasard semé
  (graine sauvegardée) pour les vagues et les choix 1 parmi 3. Elle tourne
  sous Node, ce qui rend les tests falsifiables et le hors ligne reproductible
  (même résultat à chaque fois, mais approché, voir §11.3).
- **Sauvegarde** locale, avec export et import en texte, et `SAVE_VERSION` dès
  le premier lot.
- **Les mentions MIT** d'AD, de break_infinity, de notations et d'Incremental
  Mass sont regroupées dans un fichier `LICENCES-TIERCES`, et affichées dans
  les Options.
- **Les tests** suivent les règles habituelles : deux au maximum par lot, sur
  le vrai verrou, et aucun test d'équilibrage.
- **Le mode test**, dès le lot 1, caché derrière un geste dans les Options. Il
  permet :
  - d'accélérer le temps (×10, ×100, ×1000) ;
  - de sauter directement à une couche ;
  - de se donner n'importe quelle ressource ;
  - de modifier la sauvegarde champ par champ ;
  - d'ouvrir les prototypes.

  **Plus jamais on ne recommence une partie de test à zéro** pour vérifier
  quelque chose. Il ne rapporte rien et **ne compte pour aucun succès**, et une
  partie qui l'a utilisé le garde marqué dans sa sauvegarde.
- **Le joueur automatique**, dans `tools/joueur-auto/` et lancé par
  `npm run mesure` (hors de `npm run check`). Il joue la simulation pure, sans
  écran, en accéléré, avec une stratégie simple et écrite noir sur blanc. Il
  produit un rapport des temps réels face aux cibles du §4 : « couche 1 en
  4 h 52, cible 5 h ; plus long écart sans achat : 34 s ». **Chaque lot qui
  ajoute une mécanique ajoute sa stratégie au joueur automatique** : c'est
  écrit dans son brief.
- **Tester sur le téléphone dès le lot 1.** Le jeu est publié sur GitHub Pages
  à chaque fusion, si le dépôt est public. Sinon, le fichier `dist/index.html`
  s'ouvre directement sur le téléphone. Le wrapper Android vient après le point
  de décision.

---

## 14. La méthode d'équilibrage

L'équilibrage reste le travail d'Ethan. Le plan fixe les formules et les cibles.

1. **Une table par couche**, et aucun nombre de jeu ailleurs.
2. **Avant les lots d'une couche, une passe de conception** (pas un lot de
   code). Elle pose la table en partant de la source open source correspondante
   (§5.3), et ses cibles : le calendrier du §4.1 et la courbe du §4.2.
3. **Le lot d'équilibrage de chaque couche** lance le joueur automatique, compare
   le rapport aux cibles, ajuste **la table seule**, et recommence jusqu'à ce que
   les écarts tiennent dans ±20 %. Ethan n'a pas à jouer un mois pour savoir si
   les chiffres tiennent.
4. **Ethan joue** ensuite, en mode test si besoin, pour ce que le joueur
   automatique ne mesure pas : le plaisir, la lisibilité, l'ergonomie.
5. **Trois pièges à éviter partout** (§6.5) : un accélérateur sans plafond qui
   tue la mécanique, une récompense sans multiplicateur empilable qui finit en
   mur, un bonus trop large qui rend une décision triviale.

---

## 15. La richesse, couche par couche

La réponse à « pas juste un plateau et deux boutons » :

| Couche | Ce que le joueur fait | Ce qu'il décide |
|---|---|---|
| 1 | acheter 8 machines, refroidir sur 6 paliers, changer de matériau, quencher, améliorer le labo | jusqu'où refroidir avant de quencher, Rendement ou Bobine |
| 2 | acheter 8 réacteurs, gérer deutérium, tritium et lithium, régler n, T et τ, acheter une grille de 16, réussir 8 expériences | neutrons dans la cascade, la grille ou la couverture ; où tenir l'optimum de Lawson ; quand décharger |
| 3 | former des étoiles, collectionner 6 éléments, construire l'arbre, réussir 5 × 5 expériences | quelle masse (donc quand faire le prestige), quelle configuration d'arbre, quel héritage sur 3 |
| 4 | plonger, défendre le labo contre le disque d'accrétion, nourrir le trou noir, écrire des scripts | jusqu'où plonger, quel bonus sur 3, quand lancer les capacités, quoi automatiser et comment |
| 5 | régler 4 constantes | quels compromis pour accorder l'univers |

---

## 16. Le plan de production

### 16.1 Le principe : une tranche, puis une décision

On ne s'engage pas sur les cinq couches. La **tranche 1** construit les
**couches 1 et 2 complètes**, retours et équilibrage compris. À la fin, il y a
un **point de décision** avec, cette fois, un vrai ratio mesuré.

**Même si on s'arrête là, la tranche 1 est un jeu fini** : environ 5 jours de
jeu, avec prestige, jalons, défis, deux cascades et deux branchements. On n'a
pas la moitié d'un jeu d'un mois.

**L'ordre suit trois règles :**

1. **Les outils avant le contenu** : le mode test et le joueur automatique
   (§13).
2. **Le risque en premier.** Dans la tranche 1, les branchements de la
   couche 2 arrivent un par un, par-dessus une cascade qui marche. La mécanique
   la plus neuve du jeu, le tower defense, aura son prototype au début de la
   couche 4.
3. **Les retours et l'équilibrage sont des lots écrits dans le plan**, pas des
   imprévus.

### 16.2 La tranche 1 : 14 lots écrits

Revue le 24/09 au soir, après le choix de la seconde cascade. **Le lot
PROTO-TOKAMAK disparaît de la tranche** : la couche 2 repose désormais sur un
modèle éprouvé (les Infinity Dimensions d'AD), et ses deux branchements
arrivent un par un, chacun testable seul. Sa place revient à un lot de
branchement.

| # | Lot | Type | Contenu | Ce que tu testes sur le téléphone |
|---|---|---|---|---|
| 1 | **SOCLE** | outil | dépôt, build vers un fichier unique, `break_infinity` et `notations`, boucle à pas fixe, sauvegarde, export et import, `SAVE_VERSION`, cadre du hors ligne, coquille d'UI 8 bits, police, **mode test**, licences, publication pour le téléphone | ouvrir le jeu, sauvegarder, revenir, ouvrir le mode test |
| 2 | **MACHINES** | fonction | les 8 machines, l'énergie, les cartes qui se dévoilent | acheter et produire, lisibilité des nombres |
| 3 | **JOUEUR-AUTO** | outil | le cadre de `tools/joueur-auto/`, le rapport face aux cibles, la stratégie « machines » | rien : c'est un rapport écrit |
| 4 | **FROID** | fonction | les 6 paliers, la barre de température, la ligne Objectif | refroidir, lire l'objectif |
| 5 | **SUPRA** ★ | fonction | matériaux, transition, quench, labo, automatismes, succès et carnet de la couche 1 | la couche 1 entière (en mode test accéléré) |
| 6 | **RETOURS-C1** | retours | tous tes retours sur la couche 1, **regroupés** : ergonomie, textes, corrections | les points corrigés |
| 7 | **ÉQUILIBRAGE-C1** | équilibrage | joueur automatique contre les cibles, ajustement de la table seule | le rythme ressenti |
| 8 | **DÉCHARGE** | fonction | le prestige 2, les neutrons, la grille 4×4, les jalons de décharge, la règle unique des remises à zéro | décharger, et sentir le « boum » puis la reprise |
| 9 | **RÉACTEURS** | fonction | la seconde cascade (8 réacteurs), la puissance de fusion qui multiplie la couche 1, l'onglet Fusion | la cascade, le multiplicateur |
| 10 | **COMBUSTIBLES** | fonction | branchement 1 : deutérium, tritium, couverture lithium, TBR | l'équilibre D/T, la décision neutrons |
| 11 | **LAWSON** | fonction | branchement 2 : réglages n, T, τ, aperçu de l'optimum, Q et ses jalons | régler, voir Q monter |
| 12 | **EXPÉRIENCES-2** ★ | fonction | les 8 expériences et leurs récompenses, succès et carnet de la couche 2 | les défis |
| 13 | **RETOURS-C2** | retours | tous tes retours sur la couche 2, regroupés | les points corrigés |
| 14 | **ÉQUILIBRAGE-C2** | équilibrage | joueur automatique : couche 2 **et courbe de répétition** de la couche 1 (§4.2) | la tranche entière |

⚠ **LES LOTS 10 ET 11 SONT DES PORTES LÉGÈRES.** Chaque branchement se teste
seul, par-dessus une cascade qui marche déjà. S'il n'apporte rien, on le
retire sans toucher au reste : c'est ce que garantit la règle du §7.2 (un
branchement n'agit que par un multiplicateur).

### 16.3 Les règles de tous les lots

Pour qu'Ethan n'ait pas à surveiller :

- **Chaque brief contient une section « Ce que tu verras à l'écran »**, avec
  des phrases simples. Une incompréhension se repère **avant** de lancer le lot.
- **Chaque lot se vérifie tout seul** : `npm run check`, démarrage sans écran
  avec clics réels, `npm run mesure` dès le lot 3. Le rapport dit ce qui a été
  vu et ce qui ne l'a pas été.
- **Chaque rapport finit par « À tester sur ton téléphone, en 10 minutes »** :
  une liste courte et concrète.
- **Les retours s'accumulent dans `RETOURS.md`**, à la racine du dépôt, au fil
  des tests (Ethan les dicte, Claude les range). **Un lot RETOURS les traite
  tous d'un coup**, au lieu de dix micro-lots. Un retour bloquant (le jeu plante,
  la sauvegarde est perdue) passe devant tout, dans un lot court.
- **Le joueur automatique grandit avec le jeu** : chaque lot qui ajoute une
  mécanique y ajoute sa stratégie.

### 16.4 Le point de décision, après le lot 14

Au vu de trois choses :

1. **Le ratio mesuré** : combien de lots a-t-il fallu réellement, face aux 14
   écrits ? Ce chiffre remplace toutes les estimations de ce document.
2. **Le plaisir** : est-ce qu'Ethan a envie de continuer à y jouer ?
3. **Le budget** : les limites hebdomadaires sont partagées avec Foyer Zéro et
   Archipel.

**Les options :**

- continuer vers la couche 3 comme prévu ;
- **enrichir les couches 1 et 2** plutôt qu'en ajouter (plus d'expériences, de
  jalons, de succès) ;
- **raccourcir la suite** : par exemple, fusionner les couches 4 et 5 ;
- s'arrêter là, avec un jeu fini.

### 16.5 La suite, provisoire

Ces lots ne s'écriront **qu'après** le point de décision, et chaque couche
aura sa passe de conception avant.

| Tranche | Lots écrits aujourd'hui |
|---|---|
| **Couche 3** | ÉTOILE, TABLEAU, JALONS-3 ★, RETOURS-C3, ÉQUILIBRAGE-C3 (5) |
| **Couche 4** | HORIZON, PROTO-DISQUE (le tower defense en jouet), DISQUE, PROGRAMMATEUR ★, RETOURS-C4, ÉQUILIBRAGE-C4 (6) |
| **Couche 5** | CRUNCH ★, RETOURS-C5, ÉQUILIBRAGE-C5 (3) |
| **Fin** | ANDROID (1) |

### 16.6 Combien de lots en vrai

| Compte | Tranche 1 | Jeu complet |
|---|---|---|
| **Écrits dans ce plan** (fonctions, outils, retours, équilibrage) | 14 | 29 |
| **Avec une marge ×1,5 à ×2** pour les imprévus | 21 à 28 | 44 à 58 |
| **Avec le ratio d'Archipel et de Foyer Zéro** (~×7 sur les seules fonctions) | — | jusqu'à ~75–105 |

⚠ **LA FOURCHETTE HONNÊTE, C'EST 45 À 60 LOTS POUR LE JEU COMPLET, ET ELLE
PEUT MONTER.** Ce jeu a moins de sources de reprise que les deux autres : pas
d'art, une logique pure et testable, des formules d'AD éprouvées, un dépôt neuf.
Mais un idle, c'est presque tout de l'équilibrage, et les branchements comme
le tower defense sont neufs. **On
ne le saura vraiment qu'au point de décision**, et c'est pour ça qu'il existe.

- **Le modèle et l'effort** sont posés dans chaque brief. Proposition : le même
  plancher que Foyer Zéro.
- **Pas de parallélisme dans la tranche 1** : chaque lot s'appuie sur le
  précédent.

---

## 17. Hors du plan

- **Les glyphes**, et tout objet aléatoire à optimiser (P5, décision d'Ethan).
- **Le city builder.** Le tower defense couvre l'envie d'un mode différent.
  Une idée reste en réserve : une ville à alimenter pendant la couche 2.
- **Le son.**
- **Les pressions, les dopages, les alliages sur mesure.**
- **Toute monétisation** (P4).

---

## 18. Les arbitrages restants

**Tranchés :**

1. ~~Le nom du dépôt~~ : **`freredoc/Temperature-Critique-`**, créé le 24/09.
2. ~~Public ou privé~~ : **public**. Tests sur le téléphone par GitHub Pages
   dès le lot 1.
3. ~~Le titre~~ : **Température Critique**, fixé par le nom du dépôt.
4. ~~La mécanique de la couche 2~~ : **une seconde cascade et deux
   branchements** (§7).

**Plus rien ne bloque le lot SOCLE.**

**Celui-ci se tranche avant le lot MACHINES (lot 2) :**

5. ~~Les noms des 8 machines~~ : **tranchés le 02/10** : Dynamo, Alternateur,
   Turbine, Centrale, Réseau, Cyclotron, Synchrotron, Collisionneur.

**Ceux-ci se tranchent avant la fin de la tranche 1 :**

6. **Le hors ligne sans plafond** ?
7. **Les Bc0 de jeu** d'Hg-1223, H₃S et du Graal (200 / 300 / 1000 T).
8. **L'exposant de la courbe** : 1,8, calé sur l'exemple de la couche 1, ou
   plus fort, comme l'exemple de la couche 2 ? Il se vérifie au lot 14.

**Ceux-ci se tranchent au point de décision (§16.4) :**

9. ~~Le calendrier~~ : **tranché le 24/09 au soir**, fins de couche à J12, J20
   et J30 (§4.1).
10. **La fin** : λ au niveau 10, le plomb supraconducteur à 300 K ?

**En réserve** : un clin d'œil à LK-99, la fausse découverte de 2023, dans la
fiche du Graal.

---

## 19. Sources

- Code et licence d'AD : [IvarK/AntimatterDimensionsSourceCode](https://github.com/IvarK/AntimatterDimensionsSourceCode) (MIT, © 2017 IvarK). Coûts des machines dans `src/core/dimensions/antimatter-dimension.js` ; dépendances (`break_infinity.js`, `@antimatter-dimensions/notations`) dans `package.json`.
- [break_infinity.js](https://github.com/Patashu/break_infinity.js) (MIT) · [antimatter-dimensions/notations](https://github.com/antimatter-dimensions/notations) (MIT)
- [Incremental Mass Rewritten](https://github.com/MrRedShark77/incremental-mass-rewritten) (MIT, © 2021 MrRedShark77)
- [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) (MIT, © 2020 Acamaeda)
- Jalons d'Eternity d'AD : [Eternity Milestones — Antimatter Dimensions Wiki](https://antimatterdimensions.wiki.gg/wiki/Eternity_Milestones)
- Structure d'AD : [Guide — Antimatter Dimensions Wiki](https://antimatter-dimensions.fandom.com/wiki/Guide)
- Revolution Idle : [Guide:Pre Infinity — Revolution Idle Wiki](https://revolutionidle.wiki.gg/wiki/Guide:Pre_Infinity)
- Tc et champs critiques : [List of superconductors — Wikipedia](https://en.wikipedia.org/wiki/List_of_superconductors) · [Superconductivity — Wikipedia](https://en.wikipedia.org/wiki/Superconductivity)
- Durée de vie en M^−2,5, entropie de Bekenstein-Hawking, dilatation pour un observateur immobile, seuils de 8 et ~20–25 M☉, objectif Q = 10 d'ITER, masse de Sagittarius A* : physique de manuel, calculée en Python (constantes CODATA).
