const e = require("express");
const db = require("../db");
const ExpressError = require("../helpers/expressError")
const sqlForPartialUpdate = require("../helpers/partialUpdate")

/**Job Model */
class Job {
    /** find all jobs. */


    /**Get all jobs with query params included */
    static async all(search, min_salary, min_equity) {
        let startingQuery = `SELECT * FROM jobs`;
        let whereValues = []

        if (min_salary) {
            whereValues.push(`salary >= ${min_salary}`)
        }
        if (min_equity) {
            whereValues.push(`equity >= ${min_equity}`);
        }
        if (search) {
            whereValues.push(`title ILIKE '${search}'`);
        }

        if (whereValues.length > 0) {
            startingQuery += ' WHERE '
        }

        let query = startingQuery + whereValues.join(" AND ")

        let res = await db.query(query)
        return res.rows
    }

    /**Find jobs using id */
    static async find(id) {
        let res = await db.query(`SELECT * FROM jobs WHERE id = $1`, [id])
        let job = res.rows[0]

        if (!job) {
            throw new ExpressError(`Job ${id} does not exist`, 404)
        }

        return job
    }

    /**Create a job */
    static async create(title, salary, equity, company_handle) {
        let res = await db.query(`INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4)
        RETURNING id,title, salary, equity, company_handle, date_posted`, [title, salary, equity, company_handle])

        return res.rows[0]
    }

    /**Update job info */
    static async update(id, title, salary, equity, company_handle) {
        const data = {
            title: title,
            salary: salary,
            equity: equity,
            company_handle: company_handle
        }
        let query = sqlForPartialUpdate('jobs', data, 'id', id)
        let res = await db.query(query.query, query.values)
        return res.rows[0]
    }

    /**Delete Job */
    static async delete(id) {
        const res = await db.query(`DELETE FROM jobs WHERE id = $1 RETURNING id`, [id])
        if (res.rows.length === 0) {
            throw new ExpressError(`Job ${handle} does not exists`, 404)
        }
    }

}
module.exports = Job