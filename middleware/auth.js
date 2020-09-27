const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError")

/** authorication required */
function authRequired(req, res, next) {
    try {
        const tokenString = req.body._token || req.query._token;
        let token = jwt.verify(tokenString, SECRET_KEY)
        res.locals.username = token.username;
        next();
    } catch (err) {
        return next(new ExpressError("Not Authenticated", 401))
    }
}

/**Admin Required */
function adminRequired(req, res, next) {
    try {
        const tokenString = req.body._token;

        let token = jwt.verify(tokenString, SECRET_KEY);
        res.locals.username = username;

        if (token.is_admin) {
            return next()
        }
        throw new Error();
    } catch (err) {
        return next(new ExpressError("Must be an Admin to access", 401))
    }
}

/**check correct user */
function correctUser(req, res, next) {
    try {
        const tokenString = req.body._token;

        let token = jwt.verify(tokenString, SECRET_KEY);
        res.locals.username = username;

        if (token.username === req.params.username) {
            return next();
        }

        throw new Error();

    } catch (err) {
        return next(new ExpressError("Unauthorized", 401))
    }
}

module.exports = {
    authRequired,
    adminRequired,
    correctUser
}