process.env.NODE_ENV = 'test'

const request = require("supertest");

const app = require("express-jobly/app");
const db = require("express-jobly/db");

let handle

describe("Test for company Routes", () => {

    beforeEach(async function() {
        await db.query("DELETE FROM companies");

        let result = await db.query(`INSERT INTO companies (handle, name, num_employees, description) 
    VALUES(
    'one',
    'Company One',
    100,
    'test description'
        ) RETURNING handle`);

        handle = result.rows[0].handle

    })

    afterEach(async function() {
        await db.query("DELETE FROM companies");
    })

    afterAll(async function() {
        await db.end()
    })

    describe('get all companies', () => {
        test('get /companies', async() => {
            const res = await request(app)
                .get('/companies');
            const companies = res.body.companies;
            expect(companies)
                .toHaveLength(1);
            expect(companies[0])
                .toHaveProperty("handle")
        })
        test('get /companies with search', async() => {
            const res = await request(app)
                .get(`/companies?search=Company One`);
            const companies = res.body.companies;
            expect(companies)
                .toHaveLength(1);
            expect(companies[0])
                .toHaveProperty("handle")
        })
        test('get /companies  with min and max', async() => {
            const res = await request(app)
                .get('/companies?min=10&max=100');
            const companies = res.body.companies;
            expect(companies)
                .toHaveLength(1);
            expect(companies[0])
                .toHaveProperty("handle")
        })
        test('get /companies with max greater than min', async() => {
            const res = await request(app)
                .get('/companies?min=100&max=50');
            expect(res.status)
                .toBe(400);
            expect(res.body.message)
                .toBe(" min employees cannot be greater than max employees")
        })
    })

    describe("test get one company", () => {
        test("/companies/handle", async function() {
            const res = await request(app)
                .get(`/companies/${handle}`)
            expect(res.statusCode)
                .toBe(200)
            expect(res.body.company)
                .toHaveProperty("handle")
            expect(res.body.company.handle)
                .toBe(handle)
        })
        test("/companies/handle wrong handle", async function() {
            const res = await request(app)
                .get(`/companies/12345`)
            expect(res.statusCode)
                .toBe(404)
        })
    })

    describe('Post new company', function() {
        test('/companies post', async function() {
            const res = await request(app)
                .post('/companies')
                .send({
                    handle: "newcompany",
                    name: "New Company",
                    num_employess: 200,
                    description: "descrip"
                })
            expect(res.statusCode)
                .toBe(201);
            expect(res.body.company)
                .toHaveProperty('handle');
            expect(res.body.company.handle)
                .toBe('newcompany')
        })

        test('/companies post missing item', async function() {
            const res = await request(app)
                .post('/companies')
                .send({
                    handle: "newcompany",
                    description: "descrip"
                })
            expect(res.statusCode)
                .toBe(404);
        })
    })

    describe('Put company', function() {
        test('/companies/handle put', async function() {
            const res = await request(app)
                .put(`/companies/${handle}`)
                .send({
                    name: "Edited Company",
                    num_employess: 200,
                    description: "descrip edited"
                })
            expect(res.statusCode)
                .toBe(200);
            expect(res.body.company)
                .toHaveProperty('handle');
            expect(res.body.company.name)
                .toBe("Edited Company")
            expect(res.body.company.description)
                .toBe("descrip edited")
        })

        test('/companies/handle put missing item', async function() {
            const res = await request(app)
                .put(`/companies/${handle}`)
                .send({
                    name: 123,
                    num_employess: 100,
                    description: "descrip"

                })
            expect(res.statusCode)
                .toBe(404);
        })

        describe('Delete Company', function() {
            test('/companies/handle delete', async function() {
                const res = await request(app)
                    .delete(`/companies/${handle}`)
                expect(res.statusCode)
                    .toBe(200)
                expect(res.body)
                    .toHaveProperty('message');
                expect(res.body.message)
                    .toBe('Company Deleted')
            })
        })
    })

})