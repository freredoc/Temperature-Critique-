# Mesure — Température Critique 0.3.0 · build 3

Le joueur automatique joue une partie neuve. Stratégie : à chaque décision, le joueur refroidit dès que le seuil est atteint, puis achète tout ce que son énergie paie, de la machine la plus chère à la moins chère.

Il décide une fois toutes les 0,25 s de jeu, et s'arrête au palier 6 (1,5 K) ou après 2 h 0 min de jeu.

## 1. Repères face au plan

Une durée est « dans la cible » si elle tient à ±20,0 % de la cible, sinon « hors cible ».

| Repère | Mesuré | Cible | Écart | Verdict |
|---|---|---|---|---|
| Palier 1 atteint | 3 min 42 s (222,75 s) | 223,5 s | −0,3 % | dans la cible |
| Palier 2 atteint | 8 min 56 s (536,25 s) | 8 min 58 s | −0,3 % | dans la cible |
| Palier 3 atteint | 14 min 38 s (878,5 s) | 14 min 42 s | −0,4 % | dans la cible |
| Palier 4 atteint | 21 min 35 s (1 295,25 s) | 21 min 41 s | −0,4 % | dans la cible |
| Palier 5 atteint | 29 min 1 s (1 741,5 s) | 29 min 11 s | −0,5 % | dans la cible |
| Plus long écart entre deux achats d'un même palier | 30 s (30,75 s), de 1 147,25 s à 1 178 s, au palier 3 | plafond 31 s | −0,8 % | sous le plafond |

## 2. Les paliers

Une ligne par palier joué. « Écart max » : le plus long écart entre deux achats dans le palier. « Attente du seuil » : du dernier achat du palier au refroidissement suivant ; le joueur ne peut plus rien acheter, il regarde la jauge monter.

| Palier | Température | Atteint à | Durée du palier | Machines | Écart max entre deux achats | Attente du seuil |
|---|---|---|---|---|---|---|
| 0 | 300 K, ambiante | 0 s | 3 min 42 s (222,75 s) | 4 | 19,25 s, de 49,75 s à 69 s | 25 s |
| 1 | 194,65 K, glace carbonique | 3 min 42 s (222,75 s) | 5 min 13 s (313,5 s) | 5 | 12,75 s, de 322 s à 334,75 s | 10 s |
| 2 | 77,36 K, azote liquide | 8 min 56 s (536,25 s) | 5 min 42 s (342,25 s) | 6 | 10,5 s, de 684,5 s à 695 s | 66 s |
| 3 | 27,1 K, néon liquide | 14 min 38 s (878,5 s) | 6 min 56 s (416,75 s) | 7 | 30,75 s, de 1 147,25 s à 1 178 s | 20,75 s |
| 4 | 20,28 K, hydrogène liquide | 21 min 35 s (1 295,25 s) | 7 min 26 s (446,25 s) | 8 | 14,25 s, de 1 494 s à 1 508,25 s | 15,75 s |
| 5 | 4,22 K, hélium liquide | 29 min 1 s (1 741,5 s) | 8 min 32 s (512,75 s) | 8 | 16,25 s, de 2 071 s à 2 087,25 s | 7 s |
| 6 | 1,5 K, hélium pompé | 37 min 34 s (2 254,25 s) | — | 8 | — | — |

La partie s'arrête au palier 6, à 37 min 34 s (2 254,25 s) : ce palier n'a encore ni durée, ni attente.

## 3. La montée du premier palier

Le temps de jeu pour atteindre chaque puissance de dix, jusqu'au seuil du palier 1 (1,00e9 J). Plus haut, l'énergie repart de 10 J à chaque palier : une décade n'y voudrait plus rien dire.

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

## 4. Les premiers achats

Quand chaque machine est achetée pour la première fois.

| Machine | Premier achat |
|---|---|
| Dynamo | 0 s |
| Alternateur | 33 s (33,5 s) |
| Turbine | 1 min 9 s (69 s) |
| Centrale | 2 min 8 s (128,5 s) |
| Réseau | 5 min 34 s (334,75 s) |
| Cyclotron | 10 min 43 s (643,5 s) |
| Synchrotron | 16 min 19 s (979,75 s) |
| Collisionneur | 23 min 12 s (1 392 s) |

## 5. Le hors ligne

Quand tu reviens, le jeu calcule en une fois ce que tes machines ont produit pendant ton absence. On compare à ce qu'elles auraient produit si l'appli était restée ouverte sans toi. Aucun achat pendant l'absence, des deux côtés.

| Moment de la partie | Absence | Gain rendu au retour | Gain appli ouverte | Écart |
|---|---|---|---|---|
| 1,00e9 J, à 222,75 s, palier 0, 4 machines en marche | 1 h 0 min | 9,58e15 J | 9,64e15 J | −0,6 % |
| 1,00e9 J, à 222,75 s, palier 0, 4 machines en marche | 8 h 0 min | 3,68e19 J | 3,70e19 J | −0,6 % |
| 1,00e9 J, à 222,75 s, palier 0, 4 machines en marche | 1 j 0 h | 2,96e21 J | 2,98e21 J | −0,6 % |
| 1,00e15 J, à 536,15 s, palier 1, 5 machines en marche | 1 h 0 min | 6,69e22 J | 6,75e22 J | −0,9 % |
| 1,00e15 J, à 536,15 s, palier 1, 5 machines en marche | 8 h 0 min | 1,77e27 J | 1,79e27 J | −1,0 % |
| 1,00e15 J, à 536,15 s, palier 1, 5 machines en marche | 1 j 0 h | 4,21e29 J | 4,25e29 J | −1,0 % |
| 1,00e30 J, à 1 295,1 s, palier 3, 7 machines en marche | 1 h 0 min | 4,84e38 J | 4,93e38 J | −1,8 % |
| 1,00e30 J, à 1 295,1 s, palier 3, 7 machines en marche | 8 h 0 min | 6,19e44 J | 6,32e44 J | −2,0 % |
| 1,00e30 J, à 1 295,1 s, palier 3, 7 machines en marche | 1 j 0 h | 1,29e48 J | 1,32e48 J | −2,1 % |
| 1,00e44 J, à 2 254,15 s, palier 5, 8 machines en marche | 1 h 0 min | 1,03e54 J | 1,05e54 J | −2,3 % |
| 1,00e44 J, à 2 254,15 s, palier 5, 8 machines en marche | 8 h 0 min | 9,87e60 J | 1,01e61 J | −2,7 % |
| 1,00e44 J, à 2 254,15 s, palier 5, 8 machines en marche | 1 j 0 h | 6,11e64 J | 6,28e64 J | −2,7 % |

Quand tu reviens, le jeu te rend 0,6 à 2,7 % de moins que s'il était resté ouvert.
L'écart change un peu avec la durée de l'absence : 0,4 point au plus d'une absence à l'autre.
Il grandit avec le nombre de machines en marche (4, 5, 7 puis 8).
Pas de verdict : la cible n'est pas encore chiffrée.

## 6. Pas encore mesurable

Ces repères du plan demandent une mécanique que le jeu n'a pas encore.

| Repère | Cible | Source | Mesurable avec |
|---|---|---|---|
| Palier 6 atteint | ~35 min 36 s | simulation du 23/09 | SUPRA (lot 5) |
| Premier matériau (NbTi) | 35,6 min | plan v1 §6.2 | SUPRA |
| Un nouveau matériau toutes les… | 34 à 52 min | plan §6.5 | SUPRA |
| Le Graal | ~5 h (301,4 min) | plan §6.5 | SUPRA |
| Couche 1 entière | ~5 h | plan §4.1 | SUPRA |

Palier 6 atteint : 37 min 34 s (2 254,25 s) (§ 2), sans verdict : sa cible supposait le ×10 de la supraconductivité, qui n'existe pas encore.
