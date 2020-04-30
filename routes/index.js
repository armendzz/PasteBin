var express = require("express");
var router  = express.Router();
var Paste  = require("../models/paste");

router.get("/", function (req, res) {
    Paste.find({ status: "public" }).sort({ 'created': 'desc' }).limit(5).exec(function (err, allpastes) {
        if (err) {
            console.log(err);
        } else {
            res.render("home", { pastes: allpastes, allpaste:allpastes });
        }
    });
});

module.exports = router;