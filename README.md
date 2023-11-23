# GamerHub

## Qu'est-ce que c'est ?

GamerHub est une plateforme regroupant plusieurs jeux multijoueurs. Les jeux principaux sont :

### Codenames

Un jeu se jouant à deux équipes de minimum 2.

Sur le plateau, on retrouve des mots qui peuvent soit appartenir à l'équipe A, soit appartenir à l'équipe B, soit appartenir à aucune équipe ou encore être le mot noir.

Dans chaque équipe il y a :

- Des agents, qui ne voient que les mots du plateau
- Un espion, qui possède toutes les informations sur la propriété des mots du plateau ainsi que sur le mot noir.

L'objectif en tant qu'espion est de faire deviner la totalité des mots de son équipe à l'agent en lui donnant des mots.

Si les agents sélectionnent le mot noir, la partie est perdue et instantanément terminée. Autrement, l'équipe qui a fait deviner tous ses mots aux agents gagne la partie.

### Imposteur

Un jeu se jouant au minimum à 3 où l'objectif est de trouver les imposteurs.

Au début de la partie, un mot est donné à chaque joueur innocent et un mot différent en lien avec le premier aux imposteurs. À chaque tour de jeu, chaque joueur donne un mot en lien avec le mot de départ pour justifier de son innocent. À la fin du tour, chaque joueur désigne celui qu'il pense être l'imposteur et le plus voté est éliminé.

On peut également avoir un troisième rôle, le Mr. White, qui n'a aucun mot au début et doit deviner le mot des innocents. S'il est éliminé par vote, il peut alors proposer un mot qu'il pense être la réponse, si elle est correcte, il gagne la partie.

En tant qu'innocents, les joueurs doivent éliminer par vote tous les imposteurs ainsi que le Mr. White pour gagner la partie.

En tant qu'imposteur, le joueur doit éviter de se faire éliminer par vote pendant toute la partie en identifiant le plus rapidement possible qu'il est imposteur et se fondre dans la masse des innocents. S'il est parmi les deux joueurs restants à la fin, il remporte la partie.

## Stack technique

### Front

- Vue.js
- Vite
- Tailwindcss

### Back

- Node.js
- Express
- Socket.io

### BDD

- MongoDB

## Démarrage du projet

- ?
