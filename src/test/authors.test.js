import { describe, test, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app-test.js';
import pool from '../db/config.js';

let testAuthorId;
let testPostAuthorId;
beforeAll(async () => {
    const response = await request(app).post('/api/authors').send({
        name: 'Test Author',
        email: `test${Date.now()}@mail.com`
    });
    testAuthorId = response.body.id;
});

describe('GET /api/authors', () => {

    test('Devuelve estatus 200', async () => {
        const response = await request(app).get('/api/authors');
        expect(response.status).toBe(200);
    });

    test('Devuelve un array', async () => {
        const response = await request(app).get('/api/authors');
        expect(Array.isArray(response.body)).toBe(true);
    });

});

describe('GET /api/authors/id', () => {

    test('Devuelve status 200', async () => {
        const response = await request(app).get(`/api/authors/${testAuthorId}`);
        expect(response.status).toBe(200);
    });

    test('ID invalido', async () => {
        const response = await request(app).get('/api/authors/abc');
        expect(response.status).toBe(400);
    });

    test('Autor no encontrado', async () => {
        const response = await request(app).get('/api/authors/9999');
        expect(response.status).toBe(404);
    });


});


describe('POST /api/authors', () => {

    test('Enviado correctamente', async () => {
        const response = await request(app).post('/api/authors/').send({
            name: 'Juan',
            email: `juan${Date.now()}@mail.com`
        });
        testPostAuthorId = response.body.id;
        expect(response.status).toBe(201);
    });

    test('Nombre y email requeridos', async () => {
        const response = await request(app).post('/api/authors').send({ name: 'juan' });
        expect(response.status).toBe(400);
    });

    test('Formato de email invalido', async () => {
        const response = await request(app).post('/api/authors').send({ name: 'juan', email: 'juangmail.com' });
        expect(response.status).toBe(400);
    });

});

describe('PUT /api/authors/id', () => {

    test('Enviado correctamente', async () => {
        const response = await request(app).put(`/api/authors/${testAuthorId}`).send({name: 'maximo'});
        expect(response.status).toBe(200);
    });

    test('Autor no encontrado', async () => {
        const response = await request(app).put('/api/authors/999').send({id: 999});
        expect(response.status).toBe(404);
    });

    test("Id  invalido", async () => {
        const response = await request(app).put('/api/authors/abc').send({author: 'abc'});
        expect(response.status).toBe(400);
    });

});

describe('DELETE /api/authors/id', () =>{
    
    test('Eliminado exitoso', async () => {
        const response = await request(app).delete(`/api/authors/${testAuthorId}`).send({name: 'Juan'});
        expect(response.status).toBe(200);
    });
    
    test("Id  invalido", async () => {
        const response = await request(app).delete('/api/authors/abc').send({author: 'abc'});
        expect(response.status).toBe(400);
    });

    test('Autor no encontrado', async () => {
        const response = await request(app).delete('/api/authors/999').send({id: 999});
        expect(response.status).toBe(404);
    });
    
});
afterAll(async () => {
    await request(app).delete(`/api/authors/${testPostAuthorId}`);
    await pool.end();
});
