process.env.NODE_ENV = 'test'

const request = require("supertest");

const app = require("express-jobly/app");
const db = require("express-jobly/db");

let username

describe("Test for job Routes", () => {

    beforeEach(async function() {
        await db.query("DELETE FROM users");

        let result = await db.query(`INSERT INTO users (username, password, first_name, last_name, email, is_admin) 
    VALUES(
    'testuser',
    'password',
    'test',
    'user',
    'test@gmail.com',
    true
        ) RETURNING username`);

        username = result.rows[0].username

    })

    afterEach(async function() {
        await db.query("DELETE FROM users");
    })

    afterAll(async function() {
        await db.end()
    })

    describe('get all users', () => {
        test('get /users', async() => {
            const res = await request(app)
                .get('/users');
            const users = res.body.users;
            expect(users)
                .toHaveLength(1);
            expect(users[0])
                .toHaveProperty("username")
        })
    })

    describe("test get one user", () => {
        test("/users/username", async function() {
            const res = await request(app)
                .get(`/users/${username}`)
            expect(res.statusCode)
                .toBe(200)
            expect(res.body.user)
                .toHaveProperty("username")
            expect(res.body.user.username)
                .toBe(username)
        })
        test("/users/username wrong username", async function() {
            const res = await request(app)
                .get(`/users/12345`)
            expect(res.statusCode)
                .toBe(404)
        })
    })

    describe('Post new user', function() {
        test('/users post', async function() {
            const res = await request(app)
                .post('/users')
                .send({
                    username: "user2",
                    password: "password",
                    first_name: "Marco",
                    last_name: "Herrera",
                    email: "radom@gmail.com",
                    is_admin: true
                })
            expect(res.statusCode)
                .toBe(201);
            expect(res.body.user)
                .toHaveProperty('username');
            expect(res.body.user.username)
                .toBe('user2')
        })

        test('/users post missing item', async function() {
            const res = await request(app)
                .post('/users')
                .send({
                    username: "user1",
                    password: "pass",
                    first_name: "Marco",
                    is_admin: true
                })
            expect(res.statusCode)
                .toBe(404);
        })
    })

    describe('Put user', function() {
        test('/users/username put', async function() {
            const res = await request(app)
                .put(`/users/${username}`)
                .send({
                    first_name: "Edited",
                    last_name: "Name",
                    email: "radom@gmail.com",
                    is_admin: false
                })
            expect(res.statusCode)
                .toBe(200);
            expect(res.body.user)
                .toHaveProperty('first_name');
            expect(res.body.user.first_name)
                .toBe("Edited")
        })

        test('/users/username put missing item', async function() {
            const res = await request(app)
                .put(`/users/${username}`)
                .send({
                    email: "radom@gmail.com",
                    is_admin: false
                })
            expect(res.statusCode)
                .toBe(404);
        })
    })

    describe('Delete user', function() {
        test('/users/username delete', async function() {
            const res = await request(app)
                .delete(`/users/${username}`)
            expect(res.statusCode)
                .toBe(200)
            expect(res.body)
                .toHaveProperty('message');
            expect(res.body.message)
                .toBe('User Deleted')
        })
    })

})