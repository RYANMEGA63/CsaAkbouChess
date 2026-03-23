# Guide de configuration Supabase — Échiquier Royal

## 1. Créer un projet Supabase

Allez sur [supabase.com](https://supabase.com) et créez un nouveau projet.

## 2. Configurer la base de données

Dans **SQL Editor**, copiez-collez tout le contenu du fichier `supabase/schema.sql` et exécutez-le.

## 3. Créer les buckets de stockage

Dans **Storage**, créez ces 4 buckets en les mettant **Public** :
- `tournament-fiches`
- `tournament-photos`
- `post-images`
- `gallery`

## 4. Créer un compte admin

Dans **Authentication > Users**, cliquez "Invite user" et entrez votre email.
Vous recevrez un lien pour définir votre mot de passe.

## 5. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```
VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_publique
```

Trouvez ces valeurs dans **Project Settings > API**.

## 6. Lancer le projet

```bash
npm install
npm run dev
```

## 7. Se connecter à l'admin

Allez sur `/admin` et connectez-vous avec l'email/mot de passe créé à l'étape 4.

## Ce qui est personnalisable via l'admin :

- **Tournois** : créer, modifier, supprimer (à venir, passés, fiches techniques, photos)
- **Publications** : posts style Facebook (photos, annonces, résultats)
- **Galerie** : photos de la page d'accueil
- **Contenu du site** : nom du club, description, adresse, email, horaires, FAQ, textes hero, etc.
