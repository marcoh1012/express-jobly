const User = require("../models/user");
const express = require("express")
const router = new express.Router();
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config")


/**Login and return token */
router.post("/login", async function(req, res, next) {
    try {
        const user = await User.authenticate(req.body.username, req.body.password)

        const payload = {
            username: user.username,
            is_admin: user.is_admin
        }
        const token = jwt.sign(payload, SECRET_KEY)

        return res.json({ token })
    } catch (err) {
        return next(err)
    }
});

module.exports = router;