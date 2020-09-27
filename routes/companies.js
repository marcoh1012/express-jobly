const express = require("express");
const router = new express.Router();


const jsonschema = require('jsonschema');
const { db } = require("../db");
const ExpressError = require("../helpers/expressError");

const Company = require("../models/company")
const createCompanySchema = require("../schemas/createCompanySchema.json")
const updateCompanySchema = require("../schemas/updateCompanySchema.json")

const { authRequired, adminRequired } = require("../middleware/auth")

/**get companies */
router.get('/', authRequired, async(req, res, next) => {
    try {
        const result = await Company.all(req.query.search, req.query.min, req.query.max);
        return res.json({ companies: result })
    } catch (err) {
        next(err)
    }
})

/** get company using handle */
router.get('/:handle', authRequired, async(req, res, next) => {
    try {
        const handle = req.params.handle;
        const result = await Company.find(handle)

        return res.json({ company: result })
    } catch (err) {
        next(err)
    }
})

/** create a new company */
router.post('/', adminRequired, async(req, res, next) => {
    try {

        const validation = jsonschema.validate(req.body, createCompanySchema)

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(err => err.stack), 404)
        }

        const result = await Company.create(
            req.body.handle,
            req.body.name,
            req.body.num_employees,
            req.body.description,
            req.body.logo_url
        );

        return res.status(201)
            .json({ company: result })
    } catch (err) {
        next(err)
    }
})

/**Update company info */
router.patch('/:handle', adminRequired, async(req, res, next) => {
    try {

        const validation = jsonschema.validate(req.body, updateCompanySchema)

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(err => err.stack), 404)
        }

        const handle = req.params.handle;
        const result = await Company.update(
            handle,
            req.body.name,
            req.body.num_employees,
            req.body.description,
            req.body.logo_url
        );

        return res.json({ company: result })

    } catch (err) {
        next(err)
    }
})

/**delete company */

router.delete('/:handle', adminRequired, async(req, res, next) => {
    try {
        const handle = req.params.handle
        Company.delete(handle);
        return res.json({ message: "Company Deleted" })
    } catch (err) {
        next(err)
    }
})

module.exports = router;