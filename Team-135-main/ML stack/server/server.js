import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import resources from './routes/resources.js';
import routeSafe from './routes/routeSafe.js';
import ingest211 from './routes/ingest211.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// serve static so /static/... works (your GeoJSON/CSV lives here)
app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/health', (_req, res) => res.json({ ok: true }));

resources(app);
routeSafe(app);
ingest211(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`voicemap server listening on :${PORT}`);
});
