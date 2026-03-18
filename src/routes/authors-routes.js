import express from "express";
import pool from "../db/config.js";
const authorsRouter = express.Router();

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET : Obtiene los autores
authorsRouter.get('/', async (req, res, next) => {
    try {
        const result = await pool.query("SELECT * FROM authors ORDER BY name");
        res.status(200).json(result.rows);
    } catch (error) {
        console.log('Error obteniendo autores', error.message);
        next(error);
    }
});

// GET :ID : Obtiene autores por su id 

authorsRouter.get('/:id', async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const result = await pool.query("SELECT * FROM authors WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Autor no encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log('Error obteniendo autores por id', error.message);
        next(error);
    }
});

// POST /api/authors - Crear nuevo autor
authorsRouter.post('/', async (req, res, next) => {
    const { name, email, bio } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Nombre y Email son requeridos" });
    }
    
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Formato de email inválido" });
    }

    try {
        const result = await pool.query("INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *", [name, email, bio || null]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log('Error subiendo autores', error.message);
        next(error);
    }
});

// PUT /api/authors/:id - Actualizar un autor
authorsRouter.put('/:id', async (req, res, next) => {
    const { name, email, bio } = req.body;
    const safeBio = bio?.trim() || undefined;

    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const result = await pool.query
            (`UPDATE authors
                SET name = COALESCE($1, name),
                    email = COALESCE($2, email),
                    bio = COALESCE($3, bio)
                WHERE id = $4
                RETURNING *`,
                [name, email, safeBio, req.params.id],
            );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Autor no encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log('Error modificando autores', error.message);
        next(error);
    }
});

// DELETE /api/authors/:id - Eliminar un autor
authorsRouter.delete('/:id', async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const result = await pool.query("DELETE FROM authors WHERE id = $1", [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Autor no encontrado" });
        }
        res.status(200).json({ message: "Autor eliminado correctamente" })
    } catch (error) {
        console.log('Error eliminando autores', error.message);
        next(error);
    }
});


export default authorsRouter;