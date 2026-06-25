# Design Document: Uploading cranes data to Firebase Firestore

This document specifies the design for a script to upload the static crane, delivery zone, and blog article data from `src/data/cranes.ts` to Cloud Firestore.

## 1. Background & Goals
The website `kranua.com` has its data (cranes, Kyiv delivery zones, and blog articles) stored as static TypeScript arrays in `src/data/cranes.ts`. To allow dynamic data fetching and management in the future, this data needs to be uploaded to Firebase Cloud Firestore.

Goals:
- Create an automated script to import the static data from `src/data/cranes.ts` and write it to Cloud Firestore.
- Use the Firebase Admin SDK and a local service account credential file.
- The script should run on demand via Node.js using `tsx` to run TypeScript directly.

## 2. Design Specifications

### 2.1 Firebase Admin Initialization
- The script will look for a service account key file in the root directory.
- The user has provided `kran-kiev-ua-firebase-adminsdk-fbsvc-50d930dc7d.json` in the project root. The script will use this file name.
- Initialize the Firebase Admin SDK:
  ```typescript
  import * as admin from 'firebase-admin';
  import * as path from 'path';

  const serviceAccountPath = path.resolve(__dirname, '../kran-kiev-ua-firebase-adminsdk-fbsvc-50d930dc7d.json');
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  ```

### 2.2 Collections and Document Schemas
The data from `src/data/cranes.ts` consists of three exports: `CRANES`, `KYIV_ZONES`, and `BLOG_ARTICLES`.

1. **`cranes` Collection**
   - Documents are keyed by the crane's `id`.
   - Fields: `id`, `name`, `brand`, `capacity`, `boomLength`, `minOrderHours`, `hourlyRate`, `shiftRate`, `image`, `isAvailableToday`, `isSpecialPrice`, `description`.

2. **`kyiv_zones` Collection**
   - Documents are keyed by the zone's `id`.
   - Fields: `id`, `name`, `deliveryCostInsideKp`, `pricePerKmOutsideKp`, `description`.

3. **`blog_articles` Collection**
   - Documents are keyed by the article's `id`.
   - Fields: `id`, `title`, `excerpt`, `content`, `readTime`, `date`, `image`.

### 2.3 Upload Logic
- The script will iterate through each list and write each item as a document inside the corresponding collection using `.doc(id).set(item)`.
- Use Firestore batch writes or individual document writes. Since the data sets are small (5 cranes, 4 zones, 3 articles), individual doc writes are safe and provide clean console logs for each item.
- Log success/error for each document uploaded.

## 3. Alternative Approaches Considered
- **Approach A (Chosen):** Standalone TypeScript script using `npx tsx`. This avoids compiling TS to JS manually or copying the data arrays to a JSON file.
- **Approach B:** Export data to JSON, then use a pure JS script. Rejected because it introduces manual steps and data duplication.

## 4. Verification Plan
- Place the service account key in the root directory.
- Run `npm install firebase-admin --save-dev`.
- Run the script: `npx tsx scripts/upload-to-firestore.ts`.
- Verify in the Firebase Console that the collections `cranes`, `kyiv_zones`, and `blog_articles` are created with the correct data.
