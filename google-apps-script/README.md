# Connexion Google Sheet

## 1. Créer la feuille

Créez un Google Sheet nommé, par exemple, `Concours de boules`. Son identifiant est la partie de l'URL située entre `/d/` et `/edit`.

## 2. Installer l'API

Dans la feuille : **Extensions → Apps Script**. Copiez le contenu de `Code.gs`, remplacez `SPREADSHEET_ID`, enregistrez puis exécutez `setupSheet` une fois. Google demandera l'autorisation d'accéder à votre feuille.

La feuille `Concours` et ses colonnes sont créées automatiquement.

## 3. Déployer

Dans Apps Script : **Déployer → Nouveau déploiement → Application web**.

- Exécuter en tant que : **moi**
- Qui a accès : **Tout le monde** (pour que les joueurs puissent consulter les concours)

Copiez l'URL qui se termine par `/exec`, puis remplacez la valeur de `API_URL` au début du fichier `app.js`.

> Important : l'API créée ici permet la lecture publique et la publication depuis l'application. Avant de la mettre publiquement en ligne, il faudra ajouter une authentification fiable pour les associations (par compte Google ou jeton individuel). Sans cela, une personne connaissant l'URL de l'API pourrait envoyer un concours.
