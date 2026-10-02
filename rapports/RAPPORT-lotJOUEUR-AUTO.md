# RAPPORT — lot JOUEUR-AUTO

Troisième lot de **Température Critique**, branche `claude/joueur-auto`.
Exécuté du 28/09 au 01/10/2026 par Claude Code, dans un conteneur cloud.

**En bref.** Le joueur automatique existe : `npm run mesure` joue une partie
neuve sous Node, sans écran, avec les règles mêmes du jeu, et écrit
`mesures/MESURE.md`. **10⁹ J arrive à 3 min 42 s pour une cible de 3 min
43 s (−0,3 %)**, et le hors ligne rend **0,1 à 0,6 % de moins** qu'une appli
restée ouverte, quelle que soit la durée de l'absence. Toutes les valeurs de
contrôle du brief (§4.3) sont retrouvées, sans exception.

**Le jeu n'a pas changé d'un octet** : `dist/index.html` garde son SHA-256
`9ff6d56a…4791` et ses 189 877 octets. Version 0.2.0, build 2 et
`SAVE_VERSION` 2 inchangés.

`npm run check` est vert, avec **6 tests**. La garde lit désormais **12
fichiers au lieu de 6**. Les **sept falsifications** (cinq de test, deux de
garde) tombent toutes. `npm run voir` passe toujours ses **22 étapes**.

⚠ **L'état de Pages n'a pas pu être lu depuis ce conteneur** : le proxy
refuse `github.io` (403), donc le `curl … | grep -c 'valeur-energie'` du brief
n'a pas pu tourner. Ce qu'on sait, par l'onglet Actions : le workflow
**« Pages »** de la CI a réussi deux fois sur `main` à `608ccbc`, au push puis
lancé à la main. Mais le workflow automatique de GitHub
(**« pages-build-deployment »**, celui du mode « Deploy from a branch ») a lui
aussi tourné au même moment. **C'est probablement le jeu, sans preuve.** Voir
§1 et le test téléphone (§7).

---

## 1. Le geste zéro

- **Base** : `main` à `608ccbc` (« Merge pull request #2 from
  freredoc/claude/machines-cascade »). La branche `claude/joueur-auto` en part.
- **Lu avant de toucher quoi que ce soit** : `CLAUDE.md`,
  `PASSATION-2026-09-27.md`, `rapports/RAPPORT-lotMACHINES.md` et la copie
  du plan. Les dossiers ont été listés.
- **Brief** : recopié dans `rapports/BRIEF-lotJOUEUR-AUTO.md`.
- **Outils** : Node `v22.22.2`, Chromium de `/opt/pw-browsers`
  (`TC_CHROMIUM=/opt/pw-browsers/chromium`).
- **État de départ, mesuré** : `npm run check` vert.

  | Mesure | Valeur |
  |---|---|
  | Tests | **4** |
  | Garde | « garde-sim : src/sim/ est pur (**6** fichiers lus). » |
  | `dist/index.html` | **189 877 octets** |
  | SHA-256 de `dist/index.html` | `9ff6d56a8c36675539c5c13e4e8cceb5bc3ca74d2a6270384102f42b8f464791` |
  | Version · build | **0.2.0 · build 2** |

  Le SHA-256 est **celui que le brief annonce**.
- **`npm run voir` avant travail** : 22 étapes, zéro erreur et zéro
  avertissement console, « Tout acheter » à 10⁴⁰⁰ J en **2,1 ms**.

### L'état de Pages : pas lisible ici, déduit des runs

`curl -sL https://freredoc.github.io/Temperature-Critique-/` est refusé par le
proxy du conteneur (403), et l'API de configuration de Pages aussi. Le grep
n'a donc **pas pu être fait** : ni 1 ni 0.

Les runs Actions sur `608ccbc` :

| Run | Workflow | Déclencheur | Date (UTC) | Résultat |
|---|---|---|---|---|
| 36377323030 | « Pages » (le nôtre, `.github/workflows/`) | push | 28/09 04:20:58 | succès |
| 36377322675 | « pages-build-deployment » (celui de GitHub) | dynamic | 28/09 04:20:58 | succès |
| 36395211583 | « Pages » | lancé à la main | 28/09 08:04:38 | succès |

Le lancement à la main de 08:04, quatre heures après le push, ressemble à la
consigne du lot MACHINES (régler la source puis relancer). C'est **probable,
pas prouvé** : « pages-build-deployment » tourne quand la source est « Deploy
from a branch », et rien ici ne dit lequel des deux a publié en dernier. Ce
lot n'en dépend pas : il ne touche pas au jeu.

---

## 2. `npm run check`

Vert, en fin de lot :

```
garde-sim : src/sim/ et tools/joueur-auto/ sont purs (12 fichiers lus).
…
# tests 6
# pass 6
# fail 0
…
dist/index.html : 189877 octets (js 113823 · css 9010 · polices 45129 · licences 16391 · balisage 5524)
```

- **6 tests** : les 4 d'avant, inchangés, et `JOUEUR-AUTO T1`, `T2`.
- **La garde passe de 6 à 12 fichiers lus** : les 6 de `src/sim/`, plus les
  6 fichiers purs de `tools/joueur-auto/` (tous sauf `lancer.js`).
- **`dist/index.html` en fin de lot** :
  `9ff6d56a8c36675539c5c13e4e8cceb5bc3ca74d2a6270384102f42b8f464791`,
  189 877 octets. **C'est celui du geste zéro**, au bit près. Aucun fichier de
  `src/` n'est touché ; `package.json` ne gagne que le script `mesure`.

### Ce que fait la garde, désormais

`tools/garde-sim.js` garde `src/sim/` comme avant, et **`tools/joueur-auto/`
sauf `lancer.js`** :

- les mêmes noms interdits que pour `src/sim/` (`window`, `document`,
  `localStorage`, `Date`, `performance`, `Math.random`, minuteries), **plus
  `process`** ;
- **les imports** ne peuvent venir que de `./…` (sauf `./lancer.js`), de
  `src/sim/`, de `src/data/` et de `src/ui/format.js`. La comparaison se fait
  sur le **chemin résolu**, pas sur le texte : un `./../../src/ui/ecran.js`
  ne passe pas ;
- un **import dynamique non littéral** (`import(nom)`) est refusé : la garde
  ne pourrait pas dire ce qu'il charge.

Le message nomme le fichier, la ligne, la ligne fautive, et ce qui est permis.

---

## 3. T1 et T2

### `JOUEUR-AUTO T1` — deux mesures de suite donnent le même texte

Montage du brief, au mot près : stratégie `machines`, cadence 250 ms, jusqu'à
10⁶ J, un instantané à 10³ J, une absence de 600 000 ms, en-tête
`{ version: "test", build: 0 }`. Dans le même processus : `A1`, puis `B`
(cadence 1000 ms), puis `A2`.

1. `A2 === A1`, au caractère près.
2. `B` et `A1` **privés de leur en-tête** (tout ce qui précède la première
   ligne `##`) diffèrent : la cadence change la mesure elle-même. Avec une
   cadence de 1000 ms, 10⁶ J arrive à **130,35 s** au lieu de 128,3 s (le
   brief dit 130,5 s ; voir §6). Aucune assertion sur un temps.

### `JOUEUR-AUTO T2` — l'instrument du hors ligne compare les bonnes choses

Montage du brief : `etatInitial(0)`, énergie 0, Dynamo et Alternateur à
`quantite` 10 et `achetees` 0. Puis `mesurerHorsLigne(etat, 3_600_000)`.

1. `gainRattrape` = **64 771 200 J** à 10⁻⁹ près (`rattraper` : 1000 pas de
   3,6 s).
2. `gainPasAPas` = **64 835 100 J** à 10⁻⁹ près (72 000 pas de 50 ms).
3. L'état d'entrée n'a pas bougé : énergie 0, quantités 10 et 10,
   `temps.totalMs` 0.

Les deux valeurs sont retrouvées **au joule près**.

### Falsifications exécutées, puis défaites

| Falsification | Résultat |
|---|---|
| **T1, état de module** : l'ensemble des machines « déjà vues » déclaré hors de `jouer`, dans `partie.js` | T1 **TOMBE** au point 1 : « deux mesures des mêmes options ont rendu deux textes » |
| **T1, cadence ignorée** : 250 écrit en dur dans `partie.js` | T1 **TOMBE** au point 2 : « une cadence de 1000 ms rend la même mesure qu'une cadence de 250 ms : la cadence est ignorée » |
| **T2, pas-à-pas par `rattraper`** | T2 **TOMBE** au point 2 : « gain appli ouverte (N = 72 000) : obtenu 64771200, attendu 64835100 (écart relatif 0.0009855772567636974) » |
| **T2, pas de clone** : les deux calculs sur l'état d'entrée | T2 **TOMBE** au point **1** : « gain rendu au retour (N = 1000) : obtenu 0, attendu 64771200 (écart relatif 0.9999999999999999) » |
| **T2, un seul `avancer(etat, 3_600_000)`** pour le rattrapé | T2 **TOMBE** au point 1 : « gain rendu au retour (N = 1000) : obtenu 36000, attendu 64771200 (écart relatif 0.9994441974210759) » |
| **Garde, `Date.now()` dans `rapport.js`** | `npm run check` **ÉCHOUE** : « garde-sim : « Date (Date.now, new Date) » interdit dans tools/joueur-auto/ (tools/joueur-auto/rapport.js:25) » |
| **Garde, import de `../../src/ui/ecran.js` dans `partie.js`** | `npm run check` **ÉCHOUE** : « garde-sim : import « ../../src/ui/ecran.js » interdit dans tools/joueur-auto/ (tools/joueur-auto/partie.js:1) » |

Chaque fichier a été restauré à l'octet (sha1 vérifié) et les tests sont
revenus au vert.

Le « pas de clone » tombe au **premier** point, pas au deuxième ou au
troisième comme le brief l'annonçait : sans clone, le rattrapé avance l'état
d'entrée lui-même, et `gainRattrape = etat.energie − etat.energie = 0`. C'est
la même faute, vue plus tôt.

---

## 4. `npm run mesure`

**Durée d'exécution** : la console affiche « (mesure écrite dans
mesures/MESURE.md en 6.3 s) », pour **6,6 s** au mur. Trois exécutions :
6,3 s, 6,4 s et 6,9 s. Le brief demande moins d'une minute.

**Le texte est stable** : trois exécutions de `npm run mesure` rendent
`mesures/MESURE.md` **identique au caractère**.

### Le texte complet de `mesures/MESURE.md`

```markdown
# Mesure — Température Critique 0.2.0 · build 2

Le joueur automatique joue une partie neuve. Stratégie : à chaque décision, le joueur achète tout ce que son énergie paie, de la machine la plus chère à la moins chère, lot par lot.

Il décide une fois toutes les 0,25 s de jeu, et s'arrête à 1,00e9 J ou après 2 h 0 min de jeu.

## 1. Repères face au plan

Une durée est « dans la cible » si elle tient à ±20,0 % de la cible, sinon « hors cible ».

| Repère | Mesuré | Cible | Écart | Verdict |
|---|---|---|---|---|
| Seuil du palier 1 (10⁹ J), partie neuve, 4 machines | 3 min 42 s (222,75 s) | 223,5 s | −0,3 % | dans la cible |
| Plus long écart sans achat possible | 19 s (19,25 s), de 49,75 s à 69 s | plafond 31 s | −37,9 % | sous le plafond |

## 2. Les décades

Le temps de jeu pour atteindre chaque puissance de dix.

| Énergie | Atteinte à |
|---|---|
| 10¹ J | 10 s |
| 10² J | 33 s (33,5 s) |
| 10³ J | 54 s (54,2 s) |
| 10⁴ J | 1 min 9 s (69 s) |
| 10⁵ J | 1 min 54 s (114,35 s) |
| 10⁶ J | 2 min 8 s (128,3 s) |
| 10⁷ J | 3 min 0 s (180,7 s) |
| 10⁸ J | 3 min 22 s (202,35 s) |
| 10⁹ J | 3 min 42 s (222,75 s) |

## 3. Les premiers achats

Quand chaque machine est achetée pour la première fois, et où elle en est à la fin.

| Machine | Premier achat | Achetées | Possédées à la fin |
|---|---|---|---|
| Dynamo | 0 s | 30 | 8,60e6 |
| Alternateur | 33 s (33,5 s) | 20 | 91 818 |
| Turbine | 1 min 9 s (69 s) | 10 | 1 331 |
| Centrale | 2 min 8 s (128,5 s) | 10 | 10 |

Énergie à la fin : 1,00e9 J.

## 4. Le hors ligne

Quand tu reviens, le jeu calcule en une fois ce que tes machines ont produit pendant ton absence. On compare à ce qu'elles auraient produit si l'appli était restée ouverte sans toi. Aucun achat pendant l'absence, des deux côtés.

| Moment de la partie | Absence | Gain rendu au retour | Gain appli ouverte | Écart |
|---|---|---|---|---|
| 1 000 J, à 54,2 s, 2 machines en marche | 1 h 0 min | 2,60e8 J | 2,60e8 J | −0,1 % |
| 1 000 J, à 54,2 s, 2 machines en marche | 8 h 0 min | 1,66e10 J | 1,66e10 J | −0,1 % |
| 1 000 J, à 54,2 s, 2 machines en marche | 1 j 0 h | 1,49e11 J | 1,49e11 J | −0,1 % |
| 1,00e6 J, à 128,3 s, 3 machines en marche | 1 h 0 min | 1,27e12 J | 1,28e12 J | −0,3 % |
| 1,00e6 J, à 128,3 s, 3 machines en marche | 8 h 0 min | 6,37e14 J | 6,39e14 J | −0,3 % |
| 1,00e6 J, à 128,3 s, 3 machines en marche | 1 j 0 h | 1,72e16 J | 1,72e16 J | −0,3 % |
| 1,00e9 J, à 222,75 s, 4 machines en marche | 1 h 0 min | 9,58e15 J | 9,64e15 J | −0,6 % |
| 1,00e9 J, à 222,75 s, 4 machines en marche | 8 h 0 min | 3,68e19 J | 3,70e19 J | −0,6 % |
| 1,00e9 J, à 222,75 s, 4 machines en marche | 1 j 0 h | 2,96e21 J | 2,98e21 J | −0,6 % |

Quand tu reviens, le jeu te rend 0,1 à 0,6 % de moins que s'il était resté ouvert.
L'écart ne change pas avec la durée de l'absence. Il grandit avec le nombre de machines en marche (2, 3 puis 4).
Pas de verdict : la cible n'est pas encore chiffrée.

## 5. Pas encore mesurable

Ces repères du plan demandent une mécanique que le jeu n'a pas encore.

| Repère | Cible | Source | Mesurable avec |
|---|---|---|---|
| Palier 2 atteint | 8 min 58 s | simulation du 23/09 | FROID (lot 4) |
| Palier 3 atteint | 14 min 42 s | simulation du 23/09 | FROID |
| Palier 4 atteint | 21 min 41 s | simulation du 23/09 | FROID |
| Palier 5 atteint, transition du plomb | 29 min 11 s | plan §6.5 | FROID, puis SUPRA (lot 5) |
| Palier 6 atteint | ~35 min 36 s | simulation du 23/09 | FROID |
| Premier matériau (NbTi) | 35,6 min | plan v1 §6.2 | SUPRA |
| Un nouveau matériau toutes les… | 34 à 52 min | plan §6.5 | SUPRA |
| Le Graal | ~5 h (301,4 min) | plan §6.5 | SUPRA |
| Couche 1 entière | ~5 h | plan §4.1 | SUPRA |
```

### Attendu / obtenu (§4.3 du brief)

| Mesure | Attendu | Obtenu |
|---|---|---|
| **10⁹ J atteint** | **222 750 ms** | **222 750 ms** |
| Décades 10¹ … 10⁹ J (s) | 10 · 33,5 · 54,2 · 69 · 114,35 · 128,3 · 180,7 · 202,35 · 222,75 | 10 · 33,5 · 54,2 · 69 · 114,35 · 128,3 · 180,7 · 202,35 · 222,75 |
| Premiers achats (s) | Dynamo 0 · Alternateur 33,5 · Turbine 69 · Centrale 128,5 | Dynamo 0 · Alternateur 33,5 · Turbine 69 · Centrale 128,5 |
| **Plus long écart entre deux achats** | **19,25 s**, de 49,75 à 69 s | **19,25 s**, de 49,75 à 69 s |
| Dynamos | 8 597 479,44 (30 achetées) | 8 597 479,4425 (30) |
| Alternateurs | 91 818,3 (20) | 91 818,3 (20) |
| Turbines | 1 331,5 (10) | 1 331,5 (10) |
| Centrales | 10 (10) | 10 (10) |
| Énergie finale | 1 002 544 326,5 J | 1 002 544 326,548 J |

| Hors ligne, rattrapé / pas-à-pas | Attendu 1 h · 8 h · 24 h | Obtenu 1 h · 8 h · 24 h |
|---|---|---|
| Instantané 10³ J (54,2 s) | 0,99902 · 0,99900 · 0,99900 | 0,99902 · 0,99900 · 0,99900 |
| Instantané 10⁶ J (128,3 s) | 0,99710 · 0,99701 · 0,99701 | 0,99710 · 0,99701 · 0,99701 |
| Instantané 10⁹ J (222,75 s) | 0,99431 · 0,99405 · 0,99402 | 0,99431 · 0,99405 · 0,99402 |

**Tout tombe juste**, aux arrondis du brief près. Le joueur joue donc bien
les règles du jeu. Les valeurs obtenues ont été relevées par un script jetable
qui appelle les mêmes fonctions que `mesurer`, puis comparées une à une.

---

## 5. `npm run voir`

**22 étapes réussies**, zéro erreur et zéro avertissement console.
« Tout acheter » à 10⁴⁰⁰ J en **2,3 ms** (2,1 ms au geste zéro : du bruit).
Rien n'a changé à l'écran, et c'est attendu : le HTML est identique au bit.

---

## 6. Les écarts déclarés, et ce qui contredit ce brief

### 6.1 Les écarts déclarés

1. **Les décades se lisent avec `gte`, pas avec `energie.log10()`.** Le joueur
   compare l'énergie à `new Decimal(\`1e${n}\`)`, décade par décade. C'est une
   comparaison exacte entre deux `Decimal`, sans arrondi flottant à la
   frontière d'une puissance de dix, et elle ne calcule aucune règle du jeu.
   Les valeurs de contrôle tombent juste.
2. **La garde va plus loin que le brief** : elle refuse aussi `./lancer.js`
   (le seul fichier impur), compare les chemins **résolus** et refuse l'import
   dynamique non littéral. Sans cela, un `./lancer.js` ou un
   `import(variable)` ferait passer `node:fs` par la porte de derrière.
3. **Le hors ligne a une colonne de plus** : « N machines en marche », et
   trois phrases dérivées des chiffres (plage de l'écart, indépendance de la
   durée, croissance avec le nombre de machines). Elles se calculent sur les
   chiffres de la mesure ; rien n'est écrit en dur.
4. **Les durées portent une espace insécable** (U+00A0) entre le nombre et
   l'unité, comme le reste du jeu (`CLAUDE.md`, « Espace insécable :
   U+00A0 »).
5. **La ligne « Seuil du palier 1 »** lit la décade d'exposant 9, pas le
   temps d'arrivée de la partie : les deux coïncident aujourd'hui (la partie
   s'arrête à 10⁹ J), mais la ligne doit rester juste si une partie va plus
   loin.
6. **Une ligne « Mesure »** entre dans le tableau d'état de `CLAUDE.md`, en
   plus des lignes que le brief demande de mettre à jour.
7. **La découpe** est celle du §3 du brief : `cibles.js`, `horsligne.js`,
   `lancer.js`, `mesurer.js`, `partie.js`, `rapport.js`, `strategies.js`.
   `lancer.js` est le seul fichier impur.

### 6.2 Corrigé à la relecture hostile, avant la PR

- **Une durée affichée en double** dans le rapport (la valeur arrondie suivie
  de la même entre parenthèses quand elle tombait juste) : corrigé, la
  parenthèse n'apparaît que si elle apporte une décimale ou si la
  durée dépasse la minute (« 1 min 9 s (69 s) »).
- **La ligne du palier 1 lisait le temps d'arrivée** de la partie : elle lit
  maintenant la décade 9 (voir 6.1, point 5).

Les trois questions du brief :

- **Le joueur calcule-t-il quelque part un prix, une production ou un seuil
  lui-même ?** Non. Il appelle `etatInitial`, `avancer`, `toutAcheter`,
  `rattraper`, `serialiser` et `deserialiser`, et ne compare que par `gte` et
  `gt`. Aucun import de `src/data/machines.js` ne sert à calculer : seuls les
  noms des machines sont lus pour le texte.
- **Deux appels de `mesurer` partagent-ils quoi que ce soit ?** Non : aucun
  `let` ni objet mutable au niveau d'un module, et T1 le vérifie en trois
  appels dans le même processus.
- **Le hors ligne passe-t-il par `rattraper`, et le pas-à-pas par
  `PAS_MS` ?** Oui : `rattraper(clone, ms)` d'un côté, `avancer(clone,
  PAS_MS)` répété `ms / PAS_MS` fois de l'autre, chacun sur son propre clone
  (`deserialiser(serialiser(etat))`). Une absence qui n'est pas un multiple
  de `PAS_MS` lève une erreur.

### 6.3 Ce qui contredit ce brief

1. **T1 : 130,35 s, pas 130,5 s.** Avec une cadence de 1000 ms, 10⁶ J arrive
   à 130,35 s. Le test n'en dépend pas (aucune assertion sur un temps) ; seul
   son commentaire porte le nombre.
2. **T2, « pas de clone » : le premier point tombe**, pas le deuxième ou le
   troisième (voir §3).
3. **Les décades par `log10()`** : remplacé par `gte` (6.1, point 1).
4. **Le grep de Pages** n'a pas pu tourner : `github.io` est refusé depuis le
   conteneur (§1).

---

## 7. À tester sur ton téléphone, en 10 minutes

1. **Rien de neuf dans le jeu.** Si l'adresse du jeu montre « 10 J » et
   « 0.2.0 · build 2 », fais le test du lot MACHINES (les 8 points de son
   rapport). Sinon, règle d'abord Pages : Settings → Pages → Source → GitHub
   Actions, puis Actions → Pages → Run workflow.
2. **Ouvre `mesures/MESURE.md` sur GitHub**, depuis ton téléphone. Le
   comprends-tu sans aide ? Qu'est-ce qui te manque ?

Tes retours vont dans `RETOURS.md`.
