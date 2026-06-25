import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { CRANES, KYIV_ZONES, BLOG_ARTICLES } from '../src/data/cranes';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, '../kran-kiev-ua-firebase-adminsdk-fbsvc-50d930dc7d.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Error: Service account file not found at: ${serviceAccountPath}`);
  console.error('Please ensure the kran-kiev-ua-firebase-adminsdk-fbsvc-50d930dc7d.json file is in the root directory.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function uploadData() {
  console.log('Starting upload to Firestore...');

  // 1. Upload Cranes
  console.log(`Uploading ${CRANES.length} cranes...`);
  for (const crane of CRANES) {
    await db.collection('cranes').doc(crane.id).set(crane);
    console.log(`  Uploaded crane: ${crane.id}`);
  }

  // 2. Upload Kyiv Zones
  console.log(`Uploading ${KYIV_ZONES.length} Kyiv zones...`);
  for (const zone of KYIV_ZONES) {
    await db.collection('kyiv_zones').doc(zone.id).set(zone);
    console.log(`  Uploaded zone: ${zone.id}`);
  }

  // 3. Upload Blog Articles
  console.log(`Uploading ${BLOG_ARTICLES.length} blog articles...`);
  for (const article of BLOG_ARTICLES) {
    await db.collection('blog_articles').doc(article.id).set(article);
    console.log(`  Uploaded article: ${article.id}`);
  }

  console.log('All data uploaded successfully!');
}

uploadData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error uploading data:', err);
    process.exit(1);
  });
