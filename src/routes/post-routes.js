import express from 'express';
import pool from '../db/config.js';

const postsRouter = express.Router();
const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

// GET /api/posts - Obtener todos los posts
postsRouter.get('/', async (req, res, next) => {
    const { published } = req.query;

    try {
        let result;
        if (published !== undefined) {
            const isPublished = published === 'true';
            result = await pool.query('SELECT * FROM posts WHERE published = $1 ORDER BY created_at DESC', [isPublished]);
        } else {
            result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        }
        res.status(200).json(result.rows);
    } catch (error) {
        console.log('Error obteniendo posts', error.message);
        next(error);
    }
});


// GET /api/posts/author/:authorId - Obtener posts por autor
postsRouter.get('/author/:authorId', async (req, res, next) => {
    if (!isValidId(req.params.authorId)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC',
            [req.params.authorId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Autor no encontrado' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.log('Error obteniendo posts con id de autor', error.message);
        next(error);
    }
});

// GET /api/posts/:id - Obtener un post por ID
postsRouter.get('/:id', async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const result = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log('Error obteniendo posts con id', error.message);
        next(error);
    }

});


// POST /api/posts - Crear un nuevo post
postsRouter.post('/', async (req, res, next) => {
    const { title, content, author_id, published } = req.body;
    
    if (!title || !content || !author_id) {
        return res.status(400).json({
            error: 'Título, contenido y author_id son requeridos'
        });
    }
    
    if (!isValidId(author_id)) {
        return res.status(400).json({ error: "author_id es inválido" });
    }
    
    try {
        const author = await pool.query('SELECT id FROM authors WHERE id = $1', [author_id]);
        if (author.rows.length === 0) {
            return res.status(404).json({ error: 'Autor no encontrado' });
        }
        const result = await pool.query(
            'INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, author_id, published ?? false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        console.log('Error subiendo posts', error.message);
        next(error);
    }
});

// PUT /api/posts/:id - Actualizar un post
postsRouter.put('/:id', async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    const { title, content, published } = req.body;

    try {
        const result = await pool.query(
            `UPDATE posts
                SET title = COALESCE($1, title),
                    content = COALESCE($2, content),
                    published = COALESCE($3, published)
                WHERE id = $4
                RETURNING *`,
            [title, content, published ?? null, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log('Error modificando posts', error.message);
        next(error);
    }


});

// DELETE /api/posts/:id - Eliminar un post
postsRouter.delete('/:id', async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const result = await pool.query(
            'DELETE FROM posts WHERE id = $1',
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Post no encontrado" });
        }

        res.status(204).send();
    } catch (error) {
        console.log('Error borrando posts', error.message);
        next(error);
    }

});

export default postsRouter