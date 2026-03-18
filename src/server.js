import dotenv from "dotenv";
dotenv.config();

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import express from 'express';
import authorsRouter from './routes/authors-routes.js';
import postsRouter from './routes/post-routes.js';
import { errorHandler } from "./middleware/errorHandler.js";

const swaggerDocument = YAML.load("./openapi.yaml");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Rutas
app.use('/api/authors', authorsRouter);
app.use('/api/posts', postsRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

//Middleware de manejo de errores
app.use(errorHandler);

//Escuchar la app 
app.listen(PORT, () => {console.log(`Servidor corriendo en http://localhost:${PORT}`);});
