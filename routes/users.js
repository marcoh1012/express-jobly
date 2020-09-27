const express = require("express");
const router = new express.Router();


const jsonschema = require('jsonschema');
const { db } = require("../db");
const ExpressError = require("../helpers/expressError");

const User = require("../models/user")
const createUserSchema = require("../schemas/createUserSchema.json")
const editUserSchema = require("../schemas/editUserSchema.json")
const { authRequired, correctUser } = require("../middleware/auth")

/**get users */
router.get('/', authRequired, async(req, res, next) => {
    try {
        const result = await User.all();
        return res.json({ users: result })
    } catch (err) {
        next(err)
    }
})

/** get user using username */
router.get('/:username', authRequired, async(req, res, next) => {
    try {
        const username = req.params.username;
        const result = await User.find(username)

        return res.json({ user: result })
    } catch (err) {
        next(err)
    }
})

/** create a new user */
router.post('/', async(req, res, next) => {
    try {

        const validation = jsonschema.validate(req.body, createUserSchema)

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(err => err.stack), 404)
        }

        const result = await User.create(
            req.body.username,
            req.body.password,
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.photo_url,
            req.body.is_admin
        );

        return res.status(201)
            .json({ user: result })
    } catch (err) {
        next(err)
    }
})

/**Update user info */
router.patch('/:username', correctUser, async(req, res, next) => {
    try {

        const validation = jsonschema.validate(req.body, editUserSchema)

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(err => err.stack), 404)
        }

        const username = req.params.username;
        const result = await User.update(
            username,
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.photo_url,
            req.body.is_admin
        );

        return res.json({ user: result })

    } catch (err) {
        next(err)
    }
})

/**delete user */

router.delete('/:username', correctUser, async(req, res, next) => {
    try {
        const username = req.params.username;
        User.delete(username);
        return res.json({ message: "User Deleted" })
    } catch (err) {
        next(err)
    }
})

module.exports = router;