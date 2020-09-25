const db = require("../db");
const ExpressError = require("../helpers/expressError")
const sqlForPartialUpdate = require("../helpers/partialUpdate")

/**Company Model */
class Company {
    /** find all companies. */


    /**Get all companies with qury params included */
    static async all(search, min, max) {
        let startingQuery = `SELECT * FROM companies`;
        let whereValues = []

        if (min != undefined && max != undefined) {
            if (parseInt(min) > parseInt(max)) {
                throw new ExpressError(" min employees cannot be greater than max employees", 400)
            }
        }

        if (min) {
            whereValues.push(`num_employees >= ${min}`)
        }
        if (max) {
            whereValues.push(`num_employees <= ${max}`);
        }
        if (search) {
            whereValues.push(`name ILIKE '${search}'`);
        }

        if (whereValues.length > 0) {
            startingQuery += ' WHERE '
        }

        let query = startingQuery + whereValues.join(" AND ")

        let res = await db.query(query)
        return res.rows
    }

    /**Find company using handle */
    static async find(handle) {
        let res = await db.query(`SELECT * FROM companies WHERE handle = $1`, [handle])
        let company = res.rows[0]

        if (!company) {
            throw new ExpressError(`Company ${handle} does not exist`, 404)
        }

        return company
    }

    /**Create a company */
    static async create(handle, name, num_employees, description, logo_url) {
        let res = await db.query(`INSERT INTO companies (handle, name,num_employees, description, logo_url) VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`, [handle, name, num_employees, description, logo_url])

        return res.rows[0]
    }

    /**Update company info */
    static async update(handle, name, num_employees, description, logo_url) {
        const data = {
            name: name,
            num_employees: num_employees,
            description: description,
            logo_url: logo_url
        }
        let query = sqlForPartialUpdate('companies', data, 'handle', handle)
        let res = await db.query(query.query, query.values)
        return res.rows[0]
    }

    /**Delete company */
    static async delete(handle) {
        const res = await db.query(`DELETE FROM companies WHERE handle = $1 RETURNING HANDLE`, [handle])
        if (res.rows.length === 0) {
            throw new ExpressError(`Company ${handle} does not exists`, 404)
        }
    }

}
module.exports = Company