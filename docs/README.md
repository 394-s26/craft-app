# Crafter

Crafter is a non-addictive craft project progress tracker for sewists, crocheters, knitters, scrapbookers, and other makers.

## Features

- Google Sign-In with Firebase Authentication
- Cloud Firestore persistence
- Create craft cards with photos, descriptions, materials, folder status, and optional inspiration source links
- Three main folders: Inspiration, Work in Progress, and Completed
- Move any craft between folders, including marking work-in-progress projects as completed
- Edit or delete crafts
- Local image upload preview stored as a Firestore data URL for class/demo use

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a Firebase project.
3. Enable Authentication > Google provider.
4. Create a Cloud Firestore database.
5. Create `.env` file in root directory and fill in your Firebase web app values.
6. Run locally:

```bash
npm run dev
```

## Run production environment

1. **TypeScript check + production build**

   ```bash
   npm run build
   ```

2. **Deploy schema + connectors + hosting to production**

   ```bash
   firebase deploy
   ```

## Firebase notes

Firestore collection used by the app:

```text
crafts/{craftId}
```

Each craft stores:

- userId
- title
- description
- materials
- photos
- status
- sourceUrl
- createdAt
- updatedAt

Suggested starting Firestore rules for authenticated users:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /crafts/{craftId} {
      allow read, create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run format
```
