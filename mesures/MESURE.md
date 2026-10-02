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
