var express = require("express");
var router  = express.Router();
var User  = require("../models/user");
var passport = require("passport");

router.get("/register", function (req, res) {
    res.render("register");
})

router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username, email: req.body.email });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        });

    });
});

router.get("/login", function (req, res) {
    var errmessage = req.flash("error");
    res.render("login", { errmessage: errmessage });
});


router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function (req, res) {
    });


    router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");

});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be signed in to do that!");
    res.redirect("/login");
}

module.exports = router;
