const express = require("express");
const router = new express.Router();


const jsonschema = require('jsonschema');
const { db } = require("../db");
const ExpressError = require("../helpers/expressError");
const auth = require("../middleware/auth");
const { authRequired, adminRequired } = require("../middleware/auth");

const Job = require("../models/job")
const jobSchema = require("../schemas/jobSchema.json")


/**get jobs */
router.get('/', authRequired, async(req, res, next) => {
    try {
        const result = await Job.all(req.query.search, req.query.min_salary, req.query.min_equity);
        return res.json({ jobs: result })
    } catch (err) {
        next(err)
    }
})

/** get job using id */
router.get('/:id', authRequired, async(req, res, next) => {
    try {
        const id = req.params.id;
        const result = await Job.find(id)

        return res.json({ job: result })
    } catch (err) {
        next(err)
    }
})

/** create a new job */
router.post('/', adminRequired, async(req, res, next) => {
    try {

        const validation = jsonschema.validate(req.body, jobSchema)

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(err => err.stack), 404)
        }

        const result = await Job.create(
            req.body.title,
            req.body.salary,
            req.body.equity,
            req.body.company_handle,
        );

        return res.status(201)
            .json({ job: result })
    } catch (err) {
        next(err)
    }
})

/**Update job info */
router.patch('/:id', adminRequired, async(req, res, next) => {
    try {

        const validation = jsonschema.validate(req.body, jobSchema)

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(err => err.stack), 404)
        }

        const id = req.params.id;
        const result = await Job.update(
            id,
            req.body.title,
            req.body.salary,
            req.body.equity,
            req.body.company_handle,
        );

        return res.json({ job: result })

    } catch (err) {
        next(err)
    }
})

/**delete job */

router.delete('/:id', adminRequired, async(req, res, next) => {
    try {
        const id = req.params.id
        Job.delete(id);
        return res.json({ message: "Job Deleted" })
    } catch (err) {
        next(err)
    }
})

module.exports = router;