# PASSATION — Température Critique, 27/09/2026

Le document qu'une nouvelle session lit pour reprendre le projet sans rien
perdre. Il vit dans le projet Claude « Jeu Mobile »
(`claude/PASSATION-2026-09-27.md`), et une copie peut aller à la racine du
dépôt.

---

## 1. Le projet, les rôles

- **Le jeu** : *Température Critique*, jeu incrémental de physique, du labo de
  cryogénie jusqu'au cosmos. Troisième jeu d'Ethan, après Foyer Zéro et
  Archipel Industry. Un seul fichier HTML, hors ligne, en 8 bits sans sprites,
  joué sur son **Samsung S25 FE** (écran de référence : **360 × 780 px CSS**).
- **Ethan** ne code pas. Il décide, teste sur son téléphone et fusionne les
  PR. **Il ne peut pas surveiller Claude Code en continu** : chaque lot doit se
  vérifier seul.
- **Claude, l'architecte** (le projet claude.ai) : il conçoit et écrit les
  briefs au format habituel. Il fait les calculs et relit les rapports.
  **Il ne code pas sans le feu vert d'Ethan** (consigne du projet).
- **Claude Code** tourne sur le PC Windows d'Ethan. Il exécute un brief sur
  une branche `claude/…` et ouvre la PR. **Il ne pousse jamais sur `main`.**
- **Avec Ethan** :
  - on le tutoie ;
  - on lui dit franchement ce qui ne va pas, sans flatterie ;
  - **tout calcul passe par Python, même trivial** ;
  - on mesure avant d'affirmer.

---

## 2. Où est quoi

| Quoi | Où |
|---|---|
| **Le plan complet, v5 du 24/09** | projet Claude : `claude/DESIGN-TEMPERATURE-CRITIQUE.md` (§0 décisions, §4 temps, §6 couche 1, §16 production, §18 arbitrages) |
| Brief du lot 1 (exécuté) | projet : `claude/BRIEF-lotSOCLE.md` ; dépôt : `rapports/BRIEF-lotSOCLE.md` |
| Rapport du lot 1 | dépôt : `rapports/RAPPORT-lotSOCLE.md` |
| **Brief du lot 2 (prêt, pas lancé)** | projet : `claude/BRIEF-lotMACHINES.md` |
| Maquettes (5 schémas, 6 écrans de téléphone) | https://claude.ai/artifact/KZSQyZCHt5WRmZXPRbfQ12 — invisible pour Claude Code |
| Le dépôt (public) | https://github.com/freredoc/Temperature-Critique- |
| Le jeu en ligne | https://freredoc.github.io/Temperature-Critique-/ |
| Le mémo de toute session de code | dépôt : `CLAUDE.md` |
| Les retours d'Ethan | dépôt : `RETOURS.md` (vide au 27/09) |

---

## 3. L'état au 27/09

Lu sur `main` le 27/09 : les fichiers correspondent octet pour octet à ce qui
suit.

| | |
|---|---|
| Dernier lot fusionné | **SOCLE** (lot 1) |
| Version · build | 0.1.0 · build 1 |
| `SAVE_VERSION` | 1 (`migrations` vide) |
| Tests | 2 : SOCLE T1 (sauvegarde), SOCLE T2 (rattrapage) |
| `npm run voir` | 14 étapes, 0 erreur de console |
| `dist/index.html` | 172 907 octets, dont `notations` 51 478 et notre code 23 015 |

**Ce que fait le jeu aujourd'hui** : il affiche « 10 J », sauvegarde, exporte
et importe (`TC1.` + base64url), et rattrape l'absence. Il a un mode test
(7 touchers sur la version) : énergie, sauts +1 min / +1 h / +1 jour,
vitesse, nouvelle partie, mesures, phrase témoin. **Aucune mécanique de jeu
encore.**

**Les écarts du SOCLE**, acceptés et consignés dans son rapport :

- `node --test "test/*.test.js"` (le `test/` nu échoue sous Node 22) ;
- permission `contents: read` ajoutée à la CI ;
- `$d` au format mantisse-exposant ;
- **l'import ne rattrape pas** le temps hors ligne ;
- l'icône ≡ est dessinée en CSS.

---

## 4. Les décisions, dans l'ordre

Le détail est au §0 du plan. L'essentiel :

- **23/09** :
  - AD est la base ; physique et supraconducteurs ;
  - UI qui se dévoile, équilibre simple, ni longueurs ni P2W ;
  - **cible : 1 mois** ;
  - plusieurs couches de prestige, chacune avec une vraie mécanique neuve ;
  - 8 bits, sans sprites ;
  - le hors ligne ne pénalise pas, l'actif reste intéressant.
- **24/09** :
  - **courbe de répétition** 5 h → 1 h 30 → … → quelques secondes vers la
    100ᵉ, même allure à chaque couche (ajustée : T_k ≈ T₁ × k^−1,8) ;
  - défis gardés mais pas trop durs, appelés « **expériences** » ;
  - **pas de glyphes** ;
  - automatismes perdus puis regagnés à chaque prestige (modèle d'AD) ;
  - s'inspirer du code open source ;
  - le vrai nombre de lots vaut ~×7 le prévu, d'où **une tranche 1 de 14 lots,
    puis un point de décision** ;
  - joueur automatique demandé, outil **permanent** dans `tools/`.
- **24/09, soir** :
  - **tower defense en couche 4** ;
  - **couche 2 = seconde cascade façon AD**, avec deux branchements
    (combustibles, Lawson) ;
  - dépôt public créé, titre fixé ;
  - **calendrier : fin de couche 3 à J12, de couche 4 à J20, de couche 5 à
    J30** ;
  - feu vert pour SOCLE.
- **27/09** : « Socle fait. » Demande du brief suivant et de cette passation.

---

## 5. La tranche 1 (plan §16.2)

| # | Lot | État au 27/09 |
|---|---|---|
| 1 | SOCLE | **fait, fusionné** |
| 2 | MACHINES | **brief prêt**, en attente des noms 6 et 7 (§6) |
| 3 | JOUEUR-AUTO | à écrire après le rapport MACHINES |
| 4 | FROID | — |
| 5 | SUPRA ★ | — |
| 6 | RETOURS-C1 | — |
| 7 | ÉQUILIBRAGE-C1 | — |
| 8 | DÉCHARGE | — |
| 9 | RÉACTEURS | — |
| 10 | COMBUSTIBLES | — |
| 11 | LAWSON | — |
| 12 | EXPÉRIENCES-2 ★ | — |
| 13 | RETOURS-C2 | — |
| 14 | ÉQUILIBRAGE-C2 | puis **point de décision** (§16.4) |

Fourchette honnête pour le jeu complet : **45 à 60 lots**, et elle peut
monter. Le ratio réel se mesure au lot 14.

---

## 6. Ce qui attend Ethan

**Avant de lancer MACHINES :**

1. **Les noms des machines 6 et 7.** Le brief propose **Cyclotron** et
   **Synchrotron** (le plan avait Réacteur, en doublon avec la couche 2, et
   Accélérateur). Seules les colonnes `nom` et `pluriel` de
   `src/data/machines.js` changeraient. Une fois tranché, reporter les noms au
   §6.1 du plan et clore l'arbitrage 5 du §18.
2. **Pages en « GitHub Actions » ?** Au SOCLE, Pages était en mode `legacy` :
   le site publiait alors le dépôt brut, pas le jeu construit. Le rapport
   demandait de basculer avant la fusion (Settings → Pages → Source).
   **Non confirmé.** Le geste zéro de MACHINES le vérifie.

**Quand il aura testé :**

3. **Le test du SOCLE sur téléphone** (9 points, fin du rapport SOCLE), et en
   particulier **la phrase témoin** : les symboles Ω τ γ λ α Δ √ ≥ ≤ → ← ☉ ₂ ₃
   ⁶ ⁻ ≡ ✕ ∞ tombent sur la police de secours. Lisibles, ou choquants ?
   `RETOURS.md` est vide pour l'instant.

**Avant la fin de la tranche 1** (plan §18) :

4. Le hors ligne **sans plafond** : c'est ce qui est appliqué ; à confirmer.
5. Les Bc0 de jeu d'Hg-1223, H₃S et du Graal (200 / 300 / 1000 T).
6. L'exposant de la courbe : 1,8, ou plus fort ?

**Au point de décision :**

7. La fin : λ au niveau 10, le plomb supraconducteur à 300 K ?

---

## 7. Les règles de travail

- **Le brief**, au format habituel :
  - MODÈLE ET EFFORT ;
  - geste zéro (lire, lister, `npm ci && npm run check`, `npm run voir`,
    branche, copie du brief dans `rapports/`) ;
  - « Ce que tu verras à l'écran » en phrases simples ;
  - tests falsifiables, et « ce qui n'est PAS dans ce lot » ;
  - rapport finissant par **« À tester sur ton téléphone, en 10 minutes »**.
- **Plancher : Opus 5, effort extra.** Fable 5 seulement si le lot en profite
  vraiment.
- **Deux tests au maximum par lot**, sur le vrai verrou, falsifiés au rapport.
  Aucun test d'équilibrage ni de rendu : le rendu se vérifie par
  `npm run voir`.
- **Version et build bougent ensemble**, avec le numéro disponible à
  l'exécution : le brief n'en propose pas. `SAVE_VERSION` ne bouge qu'avec une
  migration.
- **Les retours** s'accumulent dans `RETOURS.md`. Un lot RETOURS par couche
  les traite d'un coup ; seul un bloquant passe devant.
- **Relecture hostile** de chaque brief avant de le donner. On confronte chaque
  ancre au code réel de `main` : noms de fichiers, étapes de `voir`,
  expressions régulières des tests, textes affichés.
- **Le joueur automatique** (lot 3) est un outil permanent, demandé par Ethan.

---

## 8. L'accès au dépôt, depuis claude.ai

Mesuré pendant la préparation des lots 1 et 2, encore vrai le 27/09 :

- **Ce qui marche** : `curl` sur `raw.githubusercontent.com`, pour un chemin
  connu (`…/freredoc/Temperature-Critique-/main/<chemin>`). La liste des
  fichiers se déduit de `CLAUDE.md` et des rapports.
- **Ce qui est bloqué** (« GitHub access to this repository is not enabled ») :
  - codeload (les archives `.tar.gz`) ;
  - l'API GitHub ;
  - `github.io`.

  L'état de Pages ne se vérifie donc pas d'ici : le geste zéro de Claude Code
  le fait.
- Le code d'AD se lit de la même façon :
  `raw.githubusercontent.com/IvarK/AntimatterDimensionsSourceCode/master/…`.

---

## 9. Les pièges connus

- **Polices** : VT323 et Pixelify Sans, sous-ensemble `latin` seulement.
  - Les symboles du §6 point 3 n'y sont pas.
  - L'espace fine U+202F n'y est pas : on utilise U+00A0.
  - `×` (U+00D7) et `·` (U+00B7) y sont.
- **Le rattrapage hors ligne est approché**, pas exact : 1000 pas au plus,
  sans plafond. Sur une cascade, les grands pas **sous-estiment** la
  production. C'est accepté en MACHINES, et se mesurera au lot 3.
- **La règle de production** est **Euler explicite sur les valeurs du début
  du pas**, comme la simulation du 23/09 (`sim2.py`). Elle a calé le plan :
  Graal ~5 h, transition du plomb 29 min 11 s.
- **Écart voulu avec AD : pas de division par 10.** Dans AD, une dimension
  produit la précédente au dixième (`diff / 10`, ligne 664 de
  `antimatter-dimension.js`) ; ici, au plein.
- **`formater` sous 1000** affiche jusqu'à 3 décimales : l'énergie défile
  (« 0,05 J » dès 50 ms). La question est posée à Ethan dans la liste de test
  de MACHINES.
- **`Decimal`** a la précision d'un `Number` (~16 chiffres) : à 10⁴⁰⁰ J,
  payer 10 J ne change rien. C'est normal.
- **`npm run voir`** : l'étape « sauvegarde de version future » bloque
  l'écriture jusqu'au chargement suivant. Toute étape ajoutée après elle doit
  repartir d'un stockage vidé.
- **`SOCLE T1`** ancrait « version 2 » en dur. MACHINES le réancre sur
  `SAVE_VERSION + 1`.
- **`notations`** pèse 51 Ko sur les 173 Ko du fichier. C'est le premier poste
  à regarder si la taille devient un sujet.
- **Node** : ≥ 22. Sur le PC d'Ethan, un Node 22 portable est en tête du PATH.

---

## 10. La suite

1. Ethan tranche les noms 6 et 7, et confirme Pages.
2. **Lot MACHINES** (brief prêt) : 8 machines en cascade dont 4 ouvertes,
   cartes qui se dévoilent, achats ×1 / Jusqu'à 10 / TOUT ACHETER,
   `SAVE_VERSION` 2 avec copie d'avant migration.
3. Relire son rapport. Ranger les retours d'Ethan dans `RETOURS.md`.
4. **Brief JOUEUR-AUTO** (lot 3) :
   - `tools/joueur-auto/`, qui rejoue la stratégie « tout acheter » sous Node,
     face aux cibles du plan (§4, §6.5) ;
   - il mesure l'écart hors ligne laissé ouvert par MACHINES (§4.2 de son
     brief).
