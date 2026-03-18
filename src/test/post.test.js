import { describe, test, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app-test.js';
import pool from '../db/config.js';


let testPostId;
let testAuthorId;

beforeAll(async () => {
    const author = await pool.query(
        'INSERT INTO authors (name, email) VALUES ($1, $2) RETURNING id',
        ['Test Author', `test_${Date.now()}@test.com`]
    );
    testAuthorId = author.rows[0].id;

    const result = await pool.query(
        'INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Test', 'Contenido', 3, false]
    );
    testPostId = result.rows[0].id;
});

describe('GET /api/posts', () => {

    test('Esta publicado', async () => {
        const response = await request(app).get('/api/posts');
        expect(response.status).toBe(200);
    });
});

describe('GET /api/posts/author/authorId', () => {

    test('Devuelve status 200', async () => {
        const response = await request(app).get(`/api/posts/${testPostId}`);
        expect(response.status).toBe(200);
    });

    test('ID invalido', async () => {
        const response = await request(app).get('/api/posts/author/abc');
        expect(response.status).toBe(400);
    });

    test('Autor no encontrado', async () => {
        const response = await request(app).get('/api/posts/author/9999');
        expect(response.status).toBe(404);
    });


});

describe('GET /api/posts/id', () => {

    test('Devuelve status 200', async () => {
        const response = await request(app).get(`/api/posts/${testPostId}`);
        expect(response.status).toBe(200);
    });

    test('ID invalido', async () => {
        const response = await request(app).get('/api/posts/abc');
        expect(response.status).toBe(400);
    });

    test('Posts no encontrado', async () => {
        const response = await request(app).get('/api/posts/9999');
        expect(response.status).toBe(404);
    });


});


describe('POST /api/posts', () => {

    test('Enviado correctamente', async () => {
        const response = await request(app).post('/api/posts/').send({
            title: 'Ejemplo',
            content: 'Este es  contenido',
            author_id: testAuthorId,
            published: false
        });
        expect(response.status).toBe(201);
    });

    test('Título, contenido y author_id son requeridos', async () => {
        const response = await request(app).post('/api/posts').send({ title: 'Ejemplo' });
        expect(response.status).toBe(400);
    });

    test('AuthorId es invalido', async () => {
        const response = await request(app).post('/api/posts').send({ 
    title: 'Ejemplo', 
    content: 'Contenido', 
    author_id: 'abc' 
});
        expect(response.status).toBe(400);
    });

});

describe('PUT /api/posts/id', () => {

    test('Enviado correctamente', async () => {
        const response = await request(app).put(`/api/posts/${testPostId}`).send({title: 'ejemplo put'});
        expect(response.status).toBe(200);
    });

    test('Post no encontrado', async () => {
        const response = await request(app).put('/api/posts/999').send({id: '9999'});
        expect(response.status).toBe(404);
    });

    test("Id  invalido", async () => {
        const response = await request(app).put('/api/posts/abc').send({id: 'abc'});
        expect(response.status).toBe(400);
    });

});

describe('DELETE /api/posts/id', () =>{
    
    test('Eliminado exitoso', async () => {
        const response = await request(app).delete(`/api/posts/${testPostId}`).send({title: 'ejemplo delete'});
        expect(response.status).toBe(204);
    });
    
    test("Id  invalido", async () => {
        const response = await request(app).delete('/api/posts/abc').send({id: 'abc'});
        expect(response.status).toBe(400);
    });

    test('Post no encontrado', async () => {
        const response = await request(app).delete('/api/posts/999').send({id: 999});
        expect(response.status).toBe(404);
    });
    
});

afterAll(async () => {
    await pool.query('DELETE FROM posts WHERE id = $1', [testPostId]).catch(() => {});
    await pool.query('DELETE FROM authors WHERE id = $1', [testAuthorId]).catch(() => {});
    await pool.end();
});