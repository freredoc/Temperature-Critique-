# Température Critique

Un jeu incrémental de physique : tu refroidis un fil de plomb jusqu'à ce qu'il
devienne supraconducteur, puis tu passes à la fusion, aux étoiles, aux trous
noirs, jusqu'à régler les constantes de l'univers. Un seul fichier HTML, hors
ligne, en 8 bits.

**Jouer : https://freredoc.github.io/Temperature-Critique-/**

## Commandes

Il faut Node 22 ou plus.

```bash
npm ci
```

| Commande | Fait |
|---|---|
| `npm run check` | garde de pureté de la simulation, tests, puis build |
| `npm run build` | construit `dist/index.html`, le jeu en un seul fichier |
| `npm test` | lance les tests |
| `npm run voir` | vérifie le jeu sans écran dans Chromium, captures dans `captures/` |
| `npm run mesure` | joueur automatique : joue la simulation sans écran et écrit les temps face aux cibles dans `mesures/MESURE.md` (hors de `check`) |

`npm run voir` utilise Chromium par Playwright. Au premier lancement, il faut
l'installer une fois :

```bash
npx playwright install chromium
```

`dist/` n'est pas versionné : à chaque fusion dans `main`, la CI construit le
jeu et le publie sur GitHub Pages.

## Licences

Les bibliothèques et les polices intégrées au jeu, avec le texte complet de
leurs licences : [LICENCES-TIERCES.md](LICENCES-TIERCES.md). Le jeu les affiche
aussi dans Options, puis Licences.
