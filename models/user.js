const e = require("express");
const db = require("../db");
const bcrypt = require("bcrypt")
const ExpressError = require("../helpers/expressError")
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const { validate } = require("jsonschema");

const BCRYPT_WORK_FACTOR = 10;

/**User Model */
class User {

    /**athenticate user */
    static async authenticate(username, password) {
        const res = await db.query(`SELECT * FROM users WHERE username = $1`, [username])

        const user = res.rows[0]

        if (user) {
            const valid = await bcrypt.compare(password, user.password)
            if (valid) {
                return user;
            }
        }
        throw new ExpressError("Invalid username/password", 404)
    }

    /**Get all users */
    static async all() {


        let res = await db.query(`SELECT username, first_name, last_name, email FROM users`)
        return res.rows
    }

    /**Find user using username */
    static async find(username) {
        let res = await db.query(`SELECT * FROM users WHERE username = $1`, [username])
        let user = res.rows[0]

        if (!user) {
            throw new ExpressError(`User ${username} does not exist`, 404)
        }

        return user
    }

    /**Create a user */
    static async create(username, password, first_name, last_name, email, photo_url, is_admin) {

        const hashedpassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)

        let res = await db.query(`INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username, first_name, last_name, email`, [username, hashedpassword, first_name, last_name, email, photo_url, is_admin])

        return res.rows[0]
    }

    /**Update user info */
    static async update(username, first_name, last_name, email, photo_url, is_admin) {
        const data = {
            first_name: first_name,
            last_name: last_name,
            email: email,
            photo_url: photo_url,
            is_admin: is_admin
        }
        let query = sqlForPartialUpdate('users', data, 'username', username)
        let res = await db.query(query.query, query.values)
        return res.rows[0]
    }

    /**Delete user */
    static async delete(username) {
        const res = await db.query(`DELETE FROM users WHERE username = $1 RETURNING username`, [username])
        if (res.rows.length === 0) {
            throw new ExpressError(`User ${username} does not exists`, 404)
        }
    }

}
module.exports = User