# Architecture Notes

## Data flow

- `AuthProvider` subscribes to Firebase Authentication through `authService`.
- `CraftProvider` subscribes to the signed-in user's Firestore crafts through `craftService`.
- Pages consume shared state through `useAuth` and `useCrafts`.
- Components never import Firebase SDKs directly.

## Routes

- `/` dashboard
- `/inspiration` inspiration folder
- `/work-in-progress` active project folder
- `/completed` completed project folder
- `/new` create craft form
- `/crafts/:craftId` craft detail, editing, movement, and deletion

## Design choice

Crafter intentionally avoids feeds, likes, recommendations, streaks, and infinite scrolling. It is organized around folders and personal progress so it feels useful without becoming addictive.
