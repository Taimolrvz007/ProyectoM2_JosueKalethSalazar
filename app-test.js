import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import authorsRouter from './src/routes/authors.routes';
import postsRouter from './src/routes/posts.routes';
import { errorHandler } from './src/middleware/errorHandler';

const app = express();
app.use(express.json());

// Rutas
app.use('/api/authors', authorsRouter);
app.use('/api/posts', postsRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

//Middleware de manejo de errores
app.use(errorHandler);

//Se exporta para los test
export default app;