# binggge

Petite API pour ma watchlist de séries. Je cherche un show sur TVMaze, je le garde dans une liste.

## Démarrage

npm install
node server.js

## Ce qui marche déjà

- GET /health -> renvoie {status: "ok"}
- GET /shows?q=nom -> cherche sur TVMaze, renvoie id/titre/année/image
- GET /watchlist -> renvoie [] pour l'instant, la vraie base arrive séance 2

## Ce qui manque encore

- pas de base de données, watchlist est vide en dur
- pas moyen d'ajouter un show (POST /watchlist)
- pas moyen d'en supprimer un
- pas d'inscription/connexion
- les tests sont juste des todo pour l'instant, rien n'est vraiment testé
