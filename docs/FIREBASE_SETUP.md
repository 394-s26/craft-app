# Firebase Setup

1. Create a Firebase project.
2. Add a Web app to the project and copy the Firebase config values.
3. Enable Authentication > Sign-in method > Google.
4. Create a Cloud Firestore database.
5. Add your local dev server to authorized domains if needed. Vite normally runs at `localhost:5173`.
6. Copy `.env.example` to `.env` and paste your config values.

## Firestore index

The app queries crafts by `userId` and orders by `updatedAt`. If Firestore asks for a composite index, click the generated Firebase console link and create it.
