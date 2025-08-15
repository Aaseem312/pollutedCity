import express, { Router } from 'express';
// import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import responseHandler from './middleware/response';

// dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(responseHandler as any);

// Dynamic route loading
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    const registerRoutes = require(path.join(routesPath, file)).default;
    if (typeof registerRoutes === 'function') {
      const router = Router();
      registerRoutes(router);
      app.use('/api', router);
    }
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));