# RAPPORT — lot MACHINES

Deuxième lot de **Température Critique**, branche `claude/machines-cascade`.
Exécuté les 27–28/09/2026 par Claude Code, dans un conteneur cloud.

**En bref.** Les huit machines sont en place, en cascade à la manière d'AD. La
Dynamo fait l'énergie, l'Alternateur fait les dynamos, et ainsi de suite. Les
quatre premières sont ouvertes. `SAVE_VERSION` passe de 1 à 2, avec une
migration ; la sauvegarde du SOCLE est copiée telle quelle avant la première
réécriture. Les cartes se dévoilent une à une. Trois modes d'achat : ×1,
« Jusqu'à 10 » et « TOUT ACHETER ».

`npm run check` est vert, avec **4 tests**. Les six falsifications font toutes
tomber leur test. `npm run voir` passe ses **22 étapes** dans Chromium, avec
zéro erreur console. « TOUT ACHETER » à 10⁴⁰⁰ J prend **1,1 à 1,4 ms**.

⚠ **Pages n'est très probablement toujours pas réglé sur « GitHub Actions »**
(voir §1). Si c'est le cas, **ce que tu joues sur
`freredoc.github.io/Temperature-Critique-/` n'est pas le jeu**. Règle-le
**avant** de fusionner : Settings → Pages → Source → **GitHub Actions**.

---

## 1. Le geste zéro

- **Base** : `main` à `a6269bf`. La branche `claude/machines-cascade` en part.
- **Lu avant de toucher quoi que ce soit** : `CLAUDE.md`,
  `PASSATION-2026-09-27.md` et `rapports/RAPPORT-lotSOCLE.md`. Les dossiers
  ont été listés.
- **Brief** : recopié dans `rapports/BRIEF-lotMACHINES.md`. `cmp` le donne
  identique à l'envoi, sans aucun CR.
- **Outils** : Node `v22.22.2`, npm `10.9.7`, Chromium `141.0.7390.37`, piloté
  par Playwright `1.63.0`.
- **État de départ, mesuré** : `npm run check` vert.

  | Mesure | Valeur |
  |---|---|
  | Tests | **2** |
  | `dist/index.html` | **172 907 octets** |
  | Version · build | **0.1.0 · build 1** |
  | `SAVE_VERSION` | **1** |

  `npm run voir` : **14/14 étapes** avant le moindre changement. Le chemin de
  Chromium est donné par `TC_CHROMIUM=/opt/pw-browsers/chromium`, voir §5.5.

### Le mode de Pages : pas lisible par l'API, mais déduit des faits

La commande du brief échoue ici :

```
$ gh api repos/freredoc/Temperature-Critique-/pages
HTTP 403
```

Le jeton du conteneur n'a pas ce droit, donc `build_type` n'est pas lisible.
Ce qui est lisible, ce sont les exécutions d'Actions sur `main`.

**Chaque push sur `main` lance DEUX publications** :

| Commit | Workflow « Pages » (le nôtre) | « pages build and deployment » (le mode legacy de GitHub) |
|---|---|---|
| `a6269bf` (la base de ce lot) | run 36342665645 | run 36342665175 |
| `9860bfc` (fusion du SOCLE) | run 36314046464 | run 36314046045 |

« pages build and deployment » est le workflow que GitHub lance **lui-même**
quand la source est « Deploy from a branch ». S'il tourne encore, **la source
est toujours legacy**, comme au SOCLE. Deux publications concourent alors pour
la même adresse. En legacy, ce qui est servi est la racine de `main` :
`README.md` et les documents, **pas `dist/index.html`**.

**Le geste** : Settings → Pages → Build and deployment → Source → **GitHub
Actions**. Si le lot est déjà fusionné quand tu le fais, relance à la main le
workflow « Pages » (onglet Actions → Pages → Run workflow). Le build affiché
dans Options doit alors dire **0.2.0 · build 2**.

## 2. `npm run check`

```
$ npm run check
garde-sim : src/sim/ est pur (6 fichiers lus)
# tests 4
# pass 4
# fail 0
```

`garde-sim` lit **six** fichiers au lieu de cinq : `src/sim/machines.js` entre.
Il ne touche ni `window`, ni `document`, ni `Date`, ni `Math.random`.

Les quatre tests :

1. `SOCLE T1`, la sauvegarde rend les grands nombres tels quels ;
2. `SOCLE T2`, le rattrapage rend tout le temps ;
3. `MACHINES T1`, une sauvegarde v1 devient v2 ;
4. `MACHINES T2`, la cascade suit ses règles.

**Build** : `dist/index.html` fait **189 877 octets**. Il était à 172 907 au
SOCLE, soit **+16 970**. La ventilation est celle du SOCLE :

| Poste | SOCLE | MACHINES | Écart |
|---|---|---|---|
| JavaScript | 100 774 | 113 823 | **+13 049** |
| CSS | 7 606 | 9 010 | +1 404 |
| Polices (base64) | 45 129 | 45 129 | 0 |
| Licences | 14 513 | 16 391 | +1 878 |
| Balisage | 4 885 | 5 524 | +639 |
| **Total** | **172 907** | **189 877** | **+16 970** |

- **Dans le JavaScript**, notre code (`src/`) passe de 23 015 à 35 986 octets,
  soit **+12 971**. Les trois fichiers neufs y pèsent :
  - `src/ui/machines.js` : 5 788 octets ;
  - `src/sim/machines.js` : 2 801 ;
  - `src/data/machines.js` : 795.

  Les dépendances passent de 75 846 à 75 796 octets (−50). C'est du bruit
  d'emballage d'esbuild : aucune dépendance n'a changé.
- **Les licences** gagnent la notice MIT d'Antimatter Dimensions (© 2017
  IvarK). La cascade, le ×2 par lot de 10 et le facteur de coût par lot en
  sont repris.
- **Les polices ne bougent pas d'un octet.** Aucun glyphe neuf ; « × » était
  déjà dans le sous-ensemble latin.
- **Le build se garde toujours lui-même.** Il refuse une ressource réseau, une
  deuxième copie de break_infinity.js et une couleur hors des 16. Les cartes
  n'emploient que des variables de `theme.css`.

## 3. T1 et T2

### MACHINES T1 — une sauvegarde v1 devient v2, et les machines se relisent

**Assertions** :

1. **L'enveloppe exacte d'un joueur du SOCLE** : `saveVersion: 1`, `build: 1`,
   énergie 1e400, mode test utilisé, 5 000 ms joués. `relire(serialiser(v1))`
   rend, de la migration :
   - `ok: true`, `saveVersion: 2`, `migreeDepuis: 1` ;
   - **huit** machines, chacune avec une `quantite` **instance de `Decimal`**
     et nulle, et `achetees: 0` ;
   - `decouvertes.machines: 0` et `preferences.modeAchat: "un"`.

   Et rien d'autre ne bouge : énergie **toujours 1e400**, `modeTestUtilise`
   toujours vrai, `totalMs` toujours 5 000.
2. **Un code TC1 garde une machine à 1,23e45 et 37 achats.** Le 3ᵉ Turbine est
   posé à ces valeurs, avec `decouvertes.machines: 3`, puis passe par
   `importer(exporter(…))`. Il en ressort un `Decimal` égal à 1,23e45,
   `achetees` vaut 37 et `decouvertes` vaut 3.
3. **Une machine de moins** (sept entrées) : l'import est **refusé**
   (`ok: false`), et le message nomme `machines`.

### MACHINES T2 — la cascade suit ses règles, pas à pas

Partie neuve à 1 000 J, où l'on achète neuf dynamos puis un alternateur. On
avance ensuite d'**un seul pas** d'une seconde, puis on fait le dixième achat,
et l'on avance encore d'une seconde.

| Étape | Énergie | Dynamos (quantité) | Achetées | Prix | Mult. |
|---|---|---|---|---|---|
| 1. neuf dynamos + un alternateur | 810 | 9 | 9 | 10 | ×1 |
| 2. une seconde | **819** | 10 | 9 | 10 | ×1 |
| 3. dixième ACHAT | 809 | 11 | **10** | **10 000** | **×2** |
| 4. une seconde | **831** | 12 | 10 | 10 000 | ×2 |

Chaque ligne fixe une règle :

- l'étape 2 donne +9 et non +10 : **Euler sur le début du pas**. La dynamo que
  l'alternateur vient de faire ne produit pas encore ;
- l'étape 3 fixe **le prix et le multiplicateur sur les achats**, pas sur la
  quantité. Il y avait déjà 10 dynamos à l'étape 2, et le prix n'avait pas
  bougé ;
- l'étape 4 donne +22, soit **onze dynamos au ×2**.

### Falsifications exécutées, puis défaites

Chaque fichier a été restauré à l'octet (sha1 vérifié) et les tests sont
revenus au vert.

| Falsification | Résultat |
|---|---|
| **T1a** — la migration 1 → 2 retirée | **TOMBE** : « la migration 1 → 2 manque / false !== true » |
| **T1b** — la migration pose `quantite: 0` (un `Number`) | **TOMBE**, comme prévu, au point 2 : « l'état est incomplet : « machines[0].quantite » manque ou n'est pas un nombre positif ». T2 tombe aussi : « m.quantite.plus is not a function » |
| **T1c** — le contrôle de forme des machines retiré | **TOMBE** au point 3 : « true !== false » (sept machines acceptées) |
| **T2a** — Euler sur les quantités de FIN de pas | **TOMBE**, comme prévu : « étape 2 : énergie 820, attendu 819 » |
| **T2b** — prix et multiplicateur lus sur `quantite` | **TOMBE**, comme prévu : « étape 2 : prix 10000, attendu 10 » |
| **T2c** — le ×2 au 11ᵉ achat au lieu du 10ᵉ | **TOMBE** : « étape 3 : prix 10, attendu 10000 ». Il tombe **une étape plus tôt** que le brief ne l'annonçait, voir §6.1 |

## 4. `npm run voir`

**Exécuté** le 28/09/2026 dans Chromium 141.0.7390.37 (Playwright 1.63.0), en
360 × 780 à DPR 3, sur un serveur local, avec
`TC_CHROMIUM=/opt/pw-browsers/chromium`.

| # | Étape | Résultat |
|---|---|---|
| 1 | Chargement sans erreur | PASSE |
| 2 | « 10 J » visible | PASSE |
| 3 | Options affiche « 0.2.0 · build 2 » (lu dans `package.json`) | PASSE |
| 4 | Sept touchers sur la version : mode test | PASSE |
| 5 | 1e400 saisi → « 1,00e400 J » | PASSE |
| 6 | Sauvegarder, puis recharger | PASSE |
| 7 | Exporter : code `TC1.` | PASSE |
| 8 | Nouvelle partie, puis Importer | PASSE |
| 9 | « +1 h » : « 3 600 000 ms en 1000 pas » | PASSE |
| 10 | Absence de 2 h, bandeau | PASSE |
| 11 | Page cachée puis revenue, rattrapée une seule fois | PASSE |
| 12 | Sauvegarde illisible mise de côté | PASSE |
| 13 | Version future refusée, laissée intacte | PASSE |
| 14 | **M1** — partie neuve : « 10 J », la phrase d'aide, la Dynamo seule | PASSE |
| 15 | **M2** — toucher la Dynamo : « +1 J/s », l'Alternateur paraît « Nouveau », la phrase d'aide s'en va | PASSE |
| 16 | **M3** — « +1 min » : au moins 60 J | PASSE |
| 17 | **M4** — 1e6 J et neuf dynamos de plus : « 10 · ×2 · lot 0/10 », prix « 10 000 J », les commandes d'achat encore cachées | PASSE |
| 18 | **M5** — un Alternateur : les commandes paraissent ; « Jusqu'à 10 » : « 900 J », « 100 000 J » | PASSE |
| 19 | **M6** — 1e400 J, TOUT ACHETER : **moins de 50 ms**, Centrale à 660, cartes 5 à 8 cachées, aucun débordement | PASSE |
| 20 | **M7** — Sauvegarder et recharger : Centrale à 660, quatre cartes | PASSE |
| 21 | **M8** — une sauvegarde SOCLE v1 injectée : chargée, **copiée telle quelle**, réécrite en v2 | PASSE |
| 22 | Zéro erreur console, aucune requête hors de l'origine | PASSE |

**TOUT ACHETER à 10⁴⁰⁰ J**, M6 :

- durée : **1,1 à 1,4 ms** dans Chromium d'une exécution à l'autre (1,2 ms à la
  dernière), et 3,39 ms sous Node ;
- **3 786 achats** ;
- quantités finales : Dynamo 1 328, Alternateur 999, Turbine 799, Centrale
  **660**.

Le seuil du brief est 50 ms : on est quarante fois dessous.

**Erreurs console** : zéro, et aucun avertissement.

**Captures**, dans `captures/` (non versionné), toutes regardées :

- `debut.png` : « 10 J », la phrase « Une dynamo produit de l'énergie. », et
  la carte Dynamo, qui porte :
  - le badge **NOUVEAU** en cyan ;
  - la bordure orange (payable) ;
  - « 0 · X1 · lot 0/10 ».
- `couche1.png`, après TOUT ACHETER à 1e400 : 9,70e396 J, +1,72e71 J/s.

  | Carte | Quantité | Multiplicateur | Lot | Prix |
  |---|---|---|---|---|
  | Dynamo | 3,17e31 | X5,44e39 | 8/10 | 1,00e397 J, « plus tard » |
  | Alternateur | 2,41e25 | X6,34e29 | 9/10 | |
  | Turbine | 2,43e21 | X6,04e23 | 9/10 | |
  | Centrale | 660 | X7,38e19 | 0/10 | 1,00e402 J |

  Avec des nombres de cette taille, la ligne d'état **passe à la ligne**. Elle
  reste lisible, sans débordement.
- Celles du SOCLE, toujours justes : `principal.png`, `options.png`,
  `mode-test.png`, `absence.png`, `phrase-temoin.png`.

## 5. Les écarts déclarés

### 5.1 La sous-estimation hors ligne

`rattraper` rejoue une absence en 1000 pas au plus. Avec une cascade, un grand
pas **sous-estime**, parce qu'Euler n'y voit pas les machines faites pendant
le pas.

**Mesuré** : 4 machines à 10 chacune, énergie 0, et le rattrapage comparé au
pas-à-pas de 50 ms.

| Absence | Rattrapé / pas-à-pas |
|---|---|
| 1 h | 0,9941 |
| 8 h | 0,9940 |
| 24 h | 0,9940 |

Soit environ **−0,6 %, constant**. C'est ce que donne la théorie pour k étages
et N pas : k(k−1)/(2N) = 12/2000. Avec huit machines, ce serait environ
2,8 %.

**Non corrigé**, comme le demande le brief (§4.2) : l'écart est petit, il va
dans le sens prudent (le joueur retrouve un peu moins, jamais plus), et une
intégration exacte de la cascade est un autre chantier.

⚠ Ce n'est mesuré que sur **un seul montage**. Le lot 3 devra le mesurer
proprement.

### 5.2 Le réancrage de `SOCLE T1`

`SOCLE T1` vérifiait qu'une sauvegarde d'une version future est refusée, avec
un message écrit en dur : `/version 2.*plus récente/`. Depuis que la version
courante **est** 2, ce message est devenu faux ; le test tombait, et c'était
son travail.

Il lit désormais la constante :
`new RegExp(\`version ${SAVE_VERSION + 1}.*plus récente\`)`. Il ne s'assouplit
pas : il exige toujours le refus d'une version plus récente, et le message qui
la nomme.

### 5.3 Pas de division par 10 — écart voulu avec AD

Dans AD, la dimension n produit la dimension n − 1 **divisée par 10**
(`antimatter-dimensions`, ligne 664). Ici elle produit **au plein**, comme le
demande le brief (§4.1).

C'est écrit à trois endroits pour qu'on ne le « corrige » pas :

- dans `src/sim/machines.js` ;
- dans `src/data/machines.js` ;
- dans `CLAUDE.md` (« écart voulu, ne pas corriger »).

### 5.4 Les noms 6 et 7, en attente de toi

| Machine | Nom | Coût | Facteur par lot |
|---|---|---|---|
| 1 | Dynamo | 10 | 1e3 |
| 2 | Alternateur | 100 | 1e4 |
| 3 | Turbine | 1e4 | 1e5 |
| 4 | Centrale | 1e6 | 1e6 |
| 5 | Réseau | 1e9 | 1e8 |
| 6 | **Cyclotron** | 1e13 | 1e10 |
| 7 | **Synchrotron** | 1e18 | 1e12 |
| 8 | Collisionneur | 1e24 | 1e15 |

Le plan disait « Réacteur » et « Accélérateur » pour 6 et 7. Les deux noms
retenus ici sont une **proposition** : un cyclotron puis un synchrotron puis
un collisionneur se suivent vraiment, dans l'ordre de l'histoire des
accélérateurs.

Les machines 5 à 8 sont verrouillées (`machinesDebloquees = 4`) : aucun de ces
noms n'est visible en jeu aujourd'hui. **Tu tranches** ; c'est une ligne de
`src/data/machines.js`.

### 5.5 Les autres choix de ce lot, à connaître

- **« plus tard »** remplace l'attente sur une carte quand rien ne produit
  l'énergie, ou quand l'attente dépasse une heure. Un compte à rebours de
  quarante ans n'apprend rien.
- **La bordure orange** dit « payable, ou payable dans moins de 10 s ».
  L'attente se calcule sur la production **du moment**, donc elle surestime
  (la production monte pendant qu'on attend) : c'est le sens prudent.
- **Le badge NOUVEAU est sur la Dynamo dès le début** : `decouvertes.machines`
  vaut 0, et la Dynamo est la machine 1 (§5.2 du brief : « nouvelle tant que
  jamais achetée »). Il part au premier achat.
- **« × » s'affiche comme un X** dans la police 8 bits. Il est bien dans le
  sous-ensemble ; c'est le dessin de la police.
- **Le nom accessible d'un bouton** vaut « Acheter 1 : Dynamo, 10 J », là où
  le brief écrivait « Acheter : Dynamo, 10 J ». Le nombre y entre parce que
  « Jusqu'à 10 » achète plus d'une machine d'un coup, et qu'un lecteur d'écran
  doit l'entendre.
- **Un achat ne force pas de sauvegarde.** La sauvegarde automatique passe
  dans les 10 s, comme pour le reste du jeu. Les modes d'achat, eux, se
  sauvegardent avec la partie (`preferences.modeAchat`).
- **`npm run voir`** :
  - l'étape 3 **lit** la version dans `package.json` au lieu de l'écrire en
    dur ;
  - M1 part d'une sauvegarde vidée (écriture bloquée pendant le
    rechargement) ;
  - `TC_CHROMIUM` permet de désigner un Chromium déjà installé, ce qui était
    le cas ici ;
  - le favicon est servi en 204, pour qu'une requête 404 ne compte pas comme
    une erreur console.
- **Les citations d'AD ont été revérifiées** dans le source :
  - ligne 337 pour le coût par lot ;
  - ligne 339 pour le ×2 ;
  - ligne 664 pour la division par 10 qu'on n'applique pas.

  La précision de `Decimal` à 1e400 est celle qu'attend le brief.

### 5.6 Corrigé à la relecture hostile, avant la PR

- **Qui d'autre écrit `decouvertes.machines` ?** Deux écrivains seulement :
  - `src/sim/machines.js`, par `Math.max`, donc jamais à la baisse ;
  - la migration 1 → 2, qui le pose à 0.

  `defautDeForme` le valide au chargement.
- **Qui le lit ?** `src/data/devoilement.js` (les cartes) et le badge NOUVEAU.
- **Est-il atteignable ?** Oui, jusqu'à 4 : au-delà, les machines ne
  s'achètent pas.
- **Un défaut trouvé et corrigé** : la carte comparait l'attente à
  `null`, alors que la fonction rend `undefined` quand c'est payable. Une
  carte payable pouvait donc perdre sa bordure orange selon le chemin pris.
  L'attente n'est plus calculée du tout quand c'est payable, et le test
  accepte les deux (`secondes != null`).

## 6. Ce qui contredit ce brief

1. **T2c tombe à l'étape 3, pas à l'étape 4.** Le brief annonçait que le ×2 au
   11ᵉ achat ferait lire **820 au lieu de 831** à l'étape 4. C'est exact
   (mesuré sans les assertions : 820). Mais l'étape 3 vérifie **déjà** le prix,
   qui reste à 10 au lieu de 10 000, et le test tombe là. La falsification
   mord plus tôt, pas moins.
2. **Le mode de Pages n'est pas vérifiable par `gh api`** ici (403). Il est
   déduit des deux publications par push (§1). Le brief demandait
   `build_type: workflow` en clair ; je ne peux pas l'écrire.
3. **La copie du document de design est à la racine du dépôt**, pas seulement
   dans le projet Claude comme l'écrivait l'ancien `CLAUDE.md`. C'est corrigé
   dans `CLAUDE.md` : l'original du projet fait foi en cas d'écart.
4. **L'exemple du point 7 du test téléphone est « 12,35 J »**, mais `formater`
   affiche **jusqu'à trois décimales tronquées**, donc « 12,351 J ». C'est la
   règle du SOCLE, pas un changement de ce lot. Le point 7 ci-dessous le dit.
5. **Le réancrage de `SOCLE T1`** n'est pas une contradiction : c'est le test
   qui a fait son travail (§5.2). Il est ici parce que le brief ne l'annonçait
   pas.

---

## 7. À tester sur ton téléphone, en 10 minutes

**Avant de fusionner** : sur GitHub, Settings → Pages → Build and deployment
→ Source → **GitHub Actions** (voir §1). Puis fusionne la PR. Attends que
l'action « Pages » soit verte, dans l'onglet Actions (environ une minute).
Options doit afficher **0.2.0 · build 2** ; sinon, relance l'appli, qui prend
la nouvelle version au démarrage.

1. **Ta partie du SOCLE s'ouvre, et l'énergie est toujours là.** Elle est
   migrée en v2 ; l'ancienne est gardée à côté, telle quelle.
2. **Mode test → Nouvelle partie** : « 10 J », une seule carte, la Dynamo.
3. **Achète une Dynamo** : l'énergie remonte toute seule, et l'Alternateur
   apparaît avec « Nouveau ».
4. **Achète jusqu'à 10 dynamos** : ×2, et le prix saute de 10 à 10 000 J.
5. **Achète un Alternateur** : les dynamos se multiplient toutes seules.
6. **Essaie « Jusqu'à 10 » et « TOUT ACHETER »**. Les commandes paraissent
   dès ton premier Alternateur.
7. **Lis les cartes à bout de bras** : les nombres se lisent-ils bien ?
   Sous 1000 J, l'énergie défile avec des décimales, jusqu'à trois
   (« 12,351 J ») : ça te gêne, ou c'est vivant ?
8. **Quitte l'appli 5 minutes, puis reviens** : le bandeau d'absence, et
   l'énergie a monté.

Tes retours vont dans `RETOURS.md`.
