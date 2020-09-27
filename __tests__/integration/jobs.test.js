process.env.NODE_ENV = 'test'

const request = require("supertest");

const app = require("express-jobly/app");
const db = require("express-jobly/db");

let job_id

describe("Test for job Routes", () => {

    beforeEach(async function() {
        await db.query("DELETE FROM jobs");
        await db.query("DELETE FROM companies")

        await db.query(`INSERT INTO companies (handle, name, num_employees, description) 
    VALUES(
    'one',
    'Company One',
    100,
    'test description'
        )`);

        let result = await db.query(`INSERT INTO jobs (title, salary, equity, company_handle) 
    VALUES(
    'job one',
    1000.00,
    0.7,
    'one'
        ) RETURNING id`);

        job_id = result.rows[0].id

    })

    afterEach(async function() {
        await db.query("DELETE FROM jobs");
        await db.query("DELETE FROM companies")
    })

    afterAll(async function() {
        await db.end()
    })

    describe('get all jobs', () => {
        test('get /jobs', async() => {
            const res = await request(app)
                .get('/jobs');
            const jobs = res.body.jobs;
            expect(jobs)
                .toHaveLength(1);
            expect(jobs[0])
                .toHaveProperty("id")
        })
        test('get /jobs with search', async() => {
            const res = await request(app)
                .get(`/jobs?search=job one`);
            const jobs = res.body.jobs;
            expect(jobs)
                .toHaveLength(1);
            expect(jobs[0])
                .toHaveProperty("id")
        })
        test('get /jobs  with min and max', async() => {
            const res = await request(app)
                .get('/jobs?min_salary=1000.00&min_equity=0.4');
            const jobs = res.body.jobs;
            expect(jobs)
                .toHaveLength(1);
            expect(jobs[0])
                .toHaveProperty("id")
        })
    })

    describe("test get one job", () => {
        test("/jobs/id", async function() {
            const res = await request(app)
                .get(`/jobs/${job_id}`)
            expect(res.statusCode)
                .toBe(200)
            expect(res.body.job)
                .toHaveProperty("id")
            expect(res.body.job.id)
                .toBe(job_id)
        })
        test("/jobs/id wrong id", async function() {
            const res = await request(app)
                .get(`/jobs/12345`)
            expect(res.statusCode)
                .toBe(404)
        })
    })

    describe('Post new job', function() {
        test('/jobs post', async function() {
            const res = await request(app)
                .post('/jobs')
                .send({
                    title: "second job",
                    salary: 1000.00,
                    equity: 0.5,
                    company_handle: "one"
                })
            expect(res.statusCode)
                .toBe(201);
            expect(res.body.job)
                .toHaveProperty('id');
            expect(res.body.job.title)
                .toBe('second job')
        })

        test('/jobs post missing item', async function() {
            const res = await request(app)
                .post('/jobs')
                .send({
                    title: "second job",
                    salary: 1000.00,
                })
            expect(res.statusCode)
                .toBe(404);
        })
    })

    describe('Put job', function() {
        test('/jobs/id put', async function() {
            const res = await request(app)
                .put(`/jobs/${job_id}`)
                .send({
                    title: "edited job",
                    salary: 1000.00,
                    equity: 0.5,
                    company_handle: "one"
                })
            expect(res.statusCode)
                .toBe(200);
            expect(res.body.job)
                .toHaveProperty('id');
            expect(res.body.job.title)
                .toBe("edited job")
        })

        test('/jobs/id put missing item', async function() {
            const res = await request(app)
                .put(`/jobs/${job_id}`)
                .send({
                    title: "edited job",
                    company_handle: "one"

                })
            expect(res.statusCode)
                .toBe(404);
        })
    })

    describe('Delete Job', function() {
        test('/jobs/id delete', async function() {
            const res = await request(app)
                .delete(`/jobs/${job_id}`)
            expect(res.statusCode)
                .toBe(200)
            expect(res.body)
                .toHaveProperty('message');
            expect(res.body.message)
                .toBe('Job Deleted')
        })
    })

})