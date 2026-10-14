import {P} from './palette.js';

// Boss silhouettes use the same 100 × 110 canvas and flat material rules as
// the rest of the art kit. Large facial features stay readable at game scale.
export function bossShapes(variant=0){
 const shapes=[];
 const path=(d,fill,outline=true)=>shapes.push({type:'path',d,fill,stroke:outline?P.ink:null});
 const ellipse=(cx,cy,rx,ry,fill,outline=false)=>shapes.push({type:'ellipse',cx,cy,rx,ry,fill,stroke:outline?P.ink:null});
 const rect=(x,y,width,height,fill,radius=0,outline=false)=>shapes.push({type:'rect',x,y,width,height,radius,fill,stroke:outline?P.ink:null});
 ellipse(50,96,43,6,P.ink);
 switch((Number(variant)>>>0)%7){
  case 0: // Rei Geodo: a crowned boulder with a clear, heavy boxing stance.
   path('M 27 80 L 44 80 L 43 97 L 20 97 L 21 88 Z M 57 80 L 74 80 L 80 89 L 80 97 L 57 97 Z',P.steel);
   path('M 35 83 L 44 80 L 43 97 L 32 97 Z M 67 83 L 74 80 L 80 89 L 80 97 L 68 97 Z',P.slate,false);
   path('M 24 51 Q 24 37 39 37 L 62 37 Q 77 37 77 52 L 74 78 Q 73 91 60 92 L 40 92 Q 25 90 25 78 Z',P.steel);
   path('M 63 38 Q 77 38 77 52 L 74 78 Q 73 91 60 92 L 44 92 Q 65 81 65 59 Z',P.slate,false);
   path('M 10 48 L 18 29 L 31 34 L 37 52 L 28 64 L 12 61 Z M 66 48 L 73 32 L 86 28 L 94 48 L 90 62 L 75 63 Z',P.cyan);
   path('M 23 34 L 31 34 L 37 52 L 28 64 L 23 52 Z M 86 28 L 94 48 L 90 62 L 77 63 L 83 48 Z',P.blue,false);
   path('M 5 69 Q 5 55 20 56 Q 33 55 35 68 L 35 77 Q 34 89 20 88 Q 5 88 5 76 Z M 66 68 Q 67 56 81 56 Q 95 55 97 68 L 97 76 Q 96 89 82 88 Q 67 87 66 76 Z',P.steel);
   path('M 25 57 Q 34 59 35 68 L 35 77 Q 34 89 20 88 Q 9 88 6 81 Q 29 86 25 57 Z M 87 57 Q 96 59 97 68 L 97 76 Q 96 89 82 88 L 71 84 L 70 79 Q 92 86 87 57 Z',P.slate,false);
   path('M 31 34 Q 31 20 43 20 L 60 20 Q 73 20 72 34 L 69 50 Q 68 61 55 61 L 45 61 Q 32 60 32 50 Z',P.cyan);
   path('M 59 20 Q 73 20 72 34 L 69 50 Q 68 61 55 61 L 45 61 Q 61 51 60 37 Z',P.blue,false);
   path('M 32 27 L 28 9 L 41 16 L 50 3 L 59 16 L 72 9 L 68 27 Z',P.cyan);
   path('M 50 3 L 51 27 L 68 27 L 72 9 L 59 16 Z',P.blue,false);
   path('M 35 37 L 47 40 L 47 49 L 36 46 Z M 54 40 L 66 37 L 65 46 L 54 49 Z',P.ink,false);
   rect(38,41,6,4,P.lemon,1);rect(57,41,6,4,P.lemon,1);
   path('M 50 64 L 60 72 L 50 84 L 40 72 Z',P.cyan);
   path('M 50 64 L 60 72 L 50 84 Z',P.blue,false);
   path('M 12 65 L 17 62 L 17 70 L 12 71 Z M 77 64 L 82 62 L 82 70 L 77 71 Z',P.silver,false);
   break;
  case 1: // Matriarca Raiz: antlers and a broad crown above a living root trunk.
   path('M 31 40 L 15 26 L 10 10 L 18 14 L 21 25 L 30 28 L 27 12 L 34 19 L 40 38 Z M 62 39 L 69 20 L 77 11 L 76 27 L 84 24 L 88 11 L 94 9 L 92 27 L 77 42 Z',P.clay);
   path('M 28 17 L 34 19 L 40 38 L 31 40 L 21 31 L 28 32 Z M 88 11 L 94 9 L 92 27 L 77 42 L 69 40 L 85 26 Z',P.wood,false);
   path('M 13 46 Q 5 31 24 25 Q 28 11 44 18 Q 58 7 70 23 Q 92 21 93 39 Q 94 52 80 55 L 23 55 Z',P.green);
   path('M 70 23 Q 92 21 93 39 Q 94 52 80 55 L 23 55 L 15 48 Q 64 55 76 37 Z',P.forest,false);
   path('M 35 40 Q 50 34 65 41 L 71 76 Q 78 91 94 96 Q 96 101 79 99 Q 70 99 60 92 Q 53 102 49 101 Q 43 100 39 92 Q 25 102 8 97 Q 20 90 26 78 Z',P.clay);
   path('M 58 40 L 65 41 L 71 76 Q 78 91 94 96 Q 96 101 79 99 Q 70 99 60 92 Q 53 102 49 101 L 48 86 Q 61 77 58 40 Z',P.wood,false);
   path('M 32 55 L 23 59 L 16 74 L 5 81 L 6 88 L 24 81 L 35 69 Z M 68 55 L 79 60 L 85 73 L 96 80 L 94 88 L 78 82 L 64 69 Z',P.clay);
   path('M 29 61 L 35 69 L 24 81 L 6 88 L 5 81 L 20 76 Z M 76 64 L 85 73 L 96 80 L 94 88 L 78 82 L 70 72 Z',P.wood,false);
   path('M 26 42 Q 20 31 29 27 Q 39 28 40 39 Z M 61 40 Q 66 25 78 29 Q 80 40 69 46 Z',P.lime);
   path('M 37 49 L 47 53 L 46 61 L 36 58 Z M 54 53 L 64 49 L 64 58 L 55 61 Z',P.ink,false);
   rect(39,53,5,4,P.lemon,1);rect(57,53,5,4,P.lemon,1);
   path('M 50 66 L 58 74 L 50 85 L 42 74 Z',P.lime);
   path('M 50 66 L 58 74 L 50 85 Z',P.green,false);
   path('M 28 87 L 36 79 L 36 87 L 29 93 Z M 66 85 L 69 78 L 77 89 L 77 94 Z',P.bark,false);
   break;
  case 2: // Titã Fóssil: a massive skull, blunt tusks and readable rib openings.
   path('M 25 78 L 43 78 L 44 96 L 20 96 L 19 89 Z M 58 78 L 76 78 L 82 89 L 80 96 L 56 96 Z',P.sand);
   path('M 36 79 L 43 78 L 44 96 L 31 96 Z M 69 80 L 76 78 L 82 89 L 80 96 L 69 96 Z',P.ochre,false);
   path('M 22 57 L 31 48 L 71 48 L 79 58 L 73 84 L 61 92 L 38 92 L 26 82 Z',P.sand);
   path('M 69 50 L 79 58 L 73 84 L 61 92 L 49 92 L 63 78 Z',P.ochre,false);
   path('M 34 65 L 45 68 L 45 73 L 33 71 Z M 55 68 L 67 65 L 67 71 L 55 73 Z M 35 77 L 45 80 L 45 85 L 36 82 Z M 55 80 L 65 77 L 64 82 L 55 85 Z',P.ink,false);
   path('M 8 60 L 18 51 L 30 57 L 31 76 L 23 87 L 10 84 L 5 75 Z M 70 57 L 82 51 L 94 60 L 96 75 L 89 86 L 76 85 L 68 75 Z',P.sand);
   path('M 24 55 L 30 57 L 31 76 L 23 87 L 10 84 L 10 78 L 21 77 Z M 85 53 L 94 60 L 96 75 L 89 86 L 76 85 L 76 78 L 85 77 Z',P.ochre,false);
   path('M 31 34 L 17 30 L 7 15 L 11 7 L 18 18 L 33 19 Z M 66 20 L 81 18 L 89 7 L 94 15 L 83 31 L 68 35 Z',P.sand);
   path('M 11 7 L 18 18 L 33 19 L 31 29 L 18 25 Z M 89 7 L 94 15 L 83 31 L 68 35 L 70 27 L 82 25 Z',P.ochre,false);
   path('M 25 33 Q 29 15 48 15 Q 70 14 77 33 L 75 51 Q 74 59 65 62 L 61 70 L 39 70 L 35 62 Q 25 58 25 49 Z',P.sand);
   path('M 62 17 Q 73 21 77 33 L 75 51 Q 74 59 65 62 L 61 70 L 49 70 L 57 59 Q 71 49 62 17 Z',P.ochre,false);
   path('M 30 36 L 46 39 L 45 51 L 32 49 Z M 54 39 L 70 35 L 69 49 L 55 51 Z',P.ink,false);
   rect(36,41,6,5,P.orange,1);rect(58,41,6,5,P.orange,1);
   path('M 50 47 L 55 58 L 45 58 Z',P.ink,false);
   path('M 35 60 L 41 63 L 40 74 L 35 69 Z M 59 63 L 65 60 L 65 69 L 61 74 Z',P.sand);
   path('M 45 63 L 55 63 L 54 69 L 46 69 Z',P.ink,false);
   break;
  case 3: // Boss Místico: open hood, levitating sleeves and an exposed arcane core.
   path('M 25 49 Q 29 38 41 38 L 61 38 Q 73 38 76 50 L 86 91 Q 88 99 75 96 L 66 92 Q 60 102 56 101 L 48 94 Q 35 104 29 99 Q 17 101 15 94 Z',P.plum);
   path('M 61 38 Q 73 38 76 50 L 86 91 Q 88 99 75 96 L 66 92 Q 60 102 56 101 L 48 94 Q 62 81 61 38 Z',P.aubergine,false);
   path('M 25 50 L 17 54 L 8 76 L 23 82 L 35 65 Z M 74 50 L 84 56 L 94 77 L 77 83 L 65 65 Z',P.pink);
   path('M 20 65 L 8 76 L 23 82 L 35 65 L 30 57 Z M 82 60 L 94 77 L 77 83 L 69 70 L 79 71 Z',P.rose,false);
   path('M 23 43 Q 25 25 39 18 Q 50 11 62 18 Q 76 24 78 43 Q 75 57 65 61 L 35 61 Q 25 57 23 43 Z',P.pink);
   path('M 62 18 Q 76 24 78 43 Q 75 57 65 61 L 51 61 Q 68 42 62 18 Z',P.rose,false);
   path('M 34 36 L 50 28 L 66 36 L 62 53 L 38 53 Z',P.ink);
   path('M 37 40 L 47 43 L 46 48 L 38 46 Z M 54 43 L 64 40 L 62 46 L 54 48 Z',P.lemon,false);
   path('M 31 25 L 26 8 L 41 16 L 50 3 L 59 16 L 75 8 L 69 25 Z',P.yellow);
   path('M 50 3 L 51 25 L 69 25 L 75 8 L 59 16 Z',P.gold,false);
   path('M 32 57 L 44 63 L 37 90 L 25 93 Z M 68 57 L 57 64 L 64 91 L 77 94 Z',P.pink);
   path('M 37 75 L 43 65 L 57 65 L 65 75 L 58 86 L 44 86 Z',P.blue);
   path('M 50 61 L 61 73 L 50 87 L 39 73 Z',P.cyan);
   path('M 50 68 L 54 73 L 50 79 L 46 73 Z',P.white,false);
   path('M 13 65 L 22 70 L 21 79 L 12 82 L 6 75 Z M 86 65 L 94 73 L 89 82 L 79 79 L 78 70 Z',P.cyan);
   path('M 16 72 L 22 70 L 21 79 L 12 82 L 9 78 Z M 87 71 L 94 73 L 89 82 L 79 79 L 79 75 Z',P.blue,false);
   break;
  case 6: // Barão Cenoura: a broad, expressive burrow rabbit with one oversized harvest weapon.
   path('M 21 55 Q 7 34 18 8 Q 28 -4 40 13 L 45 48 Z M 56 48 L 62 13 Q 74 -4 84 8 Q 95 34 79 56 Z',P.white);
   path('M 28 42 Q 18 21 25 12 Q 30 8 35 19 L 39 44 Z M 63 44 L 68 19 Q 73 8 78 12 Q 85 21 74 42 Z',P.blush,false);
   path('M 19 76 Q 16 51 32 39 Q 48 28 67 39 Q 84 50 82 77 Q 78 96 54 99 L 43 99 Q 23 98 19 76 Z',P.white);
   path('M 65 39 Q 84 49 82 77 Q 78 96 54 99 L 43 99 Q 68 88 68 59 Z',P.silver,false);
   path('M 23 79 Q 14 75 11 83 Q 9 96 26 97 L 37 90 Z M 75 82 Q 90 75 94 85 Q 97 97 81 99 L 68 92 Z',P.white);
   path('M 26 86 Q 19 83 13 88 Q 14 97 26 97 L 37 90 Z M 82 86 Q 91 82 94 88 Q 94 98 81 99 L 68 92 Z',P.silver,false);
   ellipse(50,76,17,15,P.sand);ellipse(54,80,12,11,P.ochre);
   path('M 24 52 Q 28 43 39 46 Q 46 49 44 60 Q 34 67 25 60 Z M 57 47 Q 67 42 75 52 Q 76 62 65 64 Q 55 60 57 47 Z',P.white);
   ellipse(36,55,5,7,P.ink);ellipse(65,55,5,7,P.ink);ellipse(34,52,2,2,P.white);ellipse(63,52,2,2,P.white);
   path('M 31 68 Q 49 61 70 68 Q 73 83 52 87 Q 34 86 31 68 Z',P.maroon);
   path('M 38 68 Q 45 66 50 68 L 49 76 Q 43 79 39 75 Z M 51 68 Q 57 65 64 68 L 62 75 Q 56 78 51 76 Z',P.white,false);
   ellipse(50,64,6,4,P.blush);ellipse(48,62,2,1,P.rose);
   path('M 77 65 Q 83 60 90 63 Q 96 67 94 74 L 87 81 L 77 76 Z',P.white);
   path('M 83 70 Q 91 69 94 74 L 87 81 L 78 77 Z',P.silver,false);
   path('M 87 75 Q 98 72 98 82 Q 91 84 84 79 Z',P.lime);
   path('M 90 80 Q 97 76 99 80 Q 96 85 89 84 Z',P.green,false);
   path('M 85 80 Q 96 84 94 92 Q 91 102 75 106 Q 73 102 78 96 Q 83 88 85 80 Z',P.orange);
   path('M 89 86 Q 96 86 94 92 Q 91 102 75 106 Q 74 102 79 97 Q 88 96 89 86 Z',P.clay,false);
   break;
  case 5: // Rei das Tocas: velvet body, pink snout and oversized shovel paws.
   path('M 21 85 Q 9 87 9 96 L 31 99 L 40 91 Z M 72 84 Q 90 85 93 95 L 72 100 L 60 92 Z',P.clay);
   path('M 24 73 Q 16 33 37 22 Q 51 12 68 25 Q 86 42 77 78 L 67 94 L 36 95 Z',P.wood);
   path('M 61 22 Q 85 34 80 65 L 77 78 L 67 94 L 45 95 L 51 82 Q 70 63 61 22 Z',P.bark,false);
   path('M 35 63 Q 51 52 66 63 L 69 86 Q 51 99 33 86 Z',P.ochre);
   path('M 59 62 L 66 63 L 69 86 Q 51 99 33 86 L 35 80 Q 58 91 59 62 Z',P.clay,false);
   path('M 26 53 Q 12 50 7 61 L 3 78 L 15 93 L 31 90 L 39 74 Z M 72 54 Q 86 49 94 62 L 98 80 L 86 94 L 69 91 L 61 74 Z',P.ochre);
   path('M 27 59 L 39 74 L 31 90 L 15 93 L 8 85 L 24 82 Z M 86 55 Q 94 61 98 80 L 86 94 L 69 91 L 65 83 L 82 83 Z',P.clay,false);
   path('M 6 78 L 15 77 L 14 96 L 8 91 Z M 18 82 L 26 81 L 25 101 L 19 96 Z M 30 79 L 37 76 L 36 93 L 30 98 Z M 64 77 L 71 80 L 71 99 L 65 94 Z M 76 82 L 84 82 L 83 101 L 77 96 Z M 87 79 L 95 77 L 93 93 L 87 98 Z',P.sand);
   path('M 29 38 Q 27 22 44 24 L 59 24 Q 74 21 76 39 L 69 57 L 51 70 L 31 57 Z',P.wood);
   path('M 59 24 Q 74 21 76 39 L 69 57 L 51 70 L 49 60 Q 65 49 59 24 Z',P.bark,false);
   path('M 32 35 L 44 37 L 41 43 L 32 42 Z M 57 37 L 69 34 L 69 41 L 60 43 Z',P.ink,false);
   ellipse(38,39,2,2,P.white);ellipse(63,38,2,2,P.white);
   path('M 38 48 Q 39 42 50 43 Q 61 43 61 49 Q 59 64 53 69 Q 49 73 45 67 Q 39 60 38 48 Z',P.blush);
   path('M 55 44 Q 61 45 61 49 Q 59 64 53 69 Q 50 72 48 70 L 48 65 Q 58 56 55 44 Z',P.rose,false);
   path('M 44 62 Q 50 58 57 62 L 53 68 L 48 68 Z',P.pink);
   ellipse(47,63,1,1,P.ink);ellipse(53,63,1,1,P.ink);
   path('M 37 26 L 34 12 L 43 16 L 50 5 L 58 17 L 67 11 L 65 27 Z',P.yellow);
   path('M 50 5 L 58 17 L 67 11 L 65 27 L 50 27 Z',P.gold,false);
   path('M 46 71 L 51 66 L 58 73 L 52 83 Z',P.yellow);
   break;
  case 4: // Soberano Micelial: broad mushroom crown, floating spirit and stone orbit.
   path('M 14 67 Q 8 81 27 86 L 31 93 Q 7 94 4 79 Z M 88 53 Q 99 62 96 77 L 87 82 Q 94 66 84 61 Z',P.slate);
   path('M 33 53 L 67 53 Q 61 67 70 78 Q 76 90 64 92 L 54 89 Q 47 106 42 94 L 38 90 Q 20 99 29 86 Q 40 73 33 53 Z',P.cyan);
   path('M 55 54 L 67 53 Q 61 67 70 78 Q 75 85 65 91 L 53 87 L 47 99 L 44 87 Q 59 80 53 69 Z',P.blue,false);
   path('M 28 64 Q 18 64 18 76 L 27 73 L 34 69 Z M 71 65 Q 82 66 84 76 L 74 72 L 66 69 Z',P.cyan);
   path('M 5 48 Q 11 17 34 12 Q 56 4 76 19 Q 90 29 95 48 Q 95 55 80 60 L 23 60 Q 5 55 5 48 Z',P.pink);
   path('M 67 14 Q 87 24 95 48 Q 95 55 80 60 L 23 60 Q 10 57 7 52 Q 61 60 80 39 Z',P.rose,false);
   path('M 7 48 Q 50 62 93 48 L 86 58 Q 50 71 15 58 Z',P.plum);
   path('M 26 55 Q 51 61 77 55 L 71 60 Q 50 67 31 60 Z',P.sand);
   ellipse(29,33,8,6,P.lemon);ellipse(54,22,10,6,P.lemon);ellipse(74,39,6,5,P.lemon);
   path('M 39 69 L 47 72 L 46 78 L 39 75 Z M 53 72 L 61 69 L 61 75 L 54 78 Z',P.ink,false);
   rect(41,72,3,3,P.white,1);rect(56,72,3,3,P.white,1);
   path('M 44 84 L 50 81 L 56 84 L 50 89 Z',P.white,false);
   path('M 3 64 L 9 57 L 19 60 L 22 68 L 15 75 L 5 72 Z M 80 46 L 86 39 L 96 42 L 98 51 L 91 57 L 82 54 Z M 66 87 L 72 79 L 84 82 L 87 91 L 80 99 L 68 96 Z',P.steel);
   path('M 15 59 L 19 60 L 22 68 L 15 75 L 5 72 L 6 68 L 14 68 Z M 91 41 L 96 42 L 98 51 L 91 57 L 82 54 L 84 49 L 91 50 Z M 78 81 L 84 82 L 87 91 L 80 99 L 68 96 L 69 91 L 78 92 Z',P.slate,false);
   break;
 }
 return shapes;
}
