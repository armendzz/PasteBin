var express = require("express");
var router = express.Router();
var Paste = require("../models/paste");



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be signed in to do that!");
    res.redirect("/login");
}

router.get("/p/:id", function (req, res) {
    var url = req.headers.host + req.url;
    Paste.findById(req.params.id, function (err, foundPastes) {
        if (err) {
            console.log(err);
        } else {

            var userr = (!req.user) ? "anonymus" : req.user.username;
            res.render("showpastes", { pastes: foundPastes, url: url });
        }
    })
})

router.get("/raw/:id", function (req, res) {
    var url = req.headers.host + req.url;
    Paste.findById(req.params.id, function (err, foundPastes) {
        if (err) {
            console.log(err);
        } else {
            
            var userr = (!req.user) ? "anonymus" : req.user.username;
            res.render("raw", { pastes: foundPastes, url: url });
        }
    })
})

router.get("/clone/:id", function (req, res) {
    Paste.findById(req.params.id, function (err, foundPastes) {
        if (err) {
            console.log(err);
        } else {
            res.render("clone", { pastes: foundPastes});
        }
    })
});


router.get("/sidebar", function (req, res) {
    Paste.find({ status: "public" }).sort({ 'created': 'desc' }).limit(5).exec(function (err, allpastes) {
        if (err) {
            console.log(err);
        } else {
            res.render("partials/sidebar", { pastes: allpastes, allpaste: allpastes });
        }
    });
});

router.get("/public", function (req, res) {
    Paste.find({ status: "public" }).sort({ 'created': 'desc' }).limit(5).exec(function (err, allpastes) {
        if (err) {
            console.log(err);
        } else {
            res.render("public", { pastes: allpastes, allpaste: allpastes });
        }
    });
});

router.post("/paste", function (req, res) {
    var highlights = req.body.highlights;
    var status = req.body.status;
    var content = req.body.content;
    var expiration = req.body.expiration;
    if (!req.user) {
        var author = {
            id: mongoose.Types.ObjectId(),
            username: "anonymus"
        };
    } else {
        var author = {
            id: req.user._id,
            username: req.user.username
        };
    }
    if (!req.body.title) {
        var title = "Untitled"
    } else {
        var title = req.body.title
    }
    if (req.body.expiration == "10 Minutes"){
        var newPaste = { title: title, content: content, author: author, highlights: highlights, expiration: expiration, status: status, tenminutes: new Date() }
    } else if (req.body.expiration == "1 Hour"){
        var newPaste = { title: title, content: content, author: author, highlights: highlights, expiration: expiration, status: status, hour: new Date() }
        } else if (req.body.expiration == "1 Day"){
            var newPaste = { title: title, content: content, author: author, highlights: highlights, expiration: expiration, status: status, day: new Date() }
        } else if  (req.body.expiration == "1 Week"){
            var newPaste = { title: title, content: content, author: author, highlights: highlights, expiration: expiration, status: status, week: new Date() }  
        } else {
            var newPaste = { title: title, content: content, author: author, highlights: highlights, expiration: expiration, status: status}
        }
    
    Paste.create(newPaste, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/p/" + newlyCreated._id);
        } 
    });

});


// edit route
router.get("/edit/:id", function (req, res) {
    var url = req.headers.host + req.url;
    if (req.isAuthenticated()) {

        Paste.findById(req.params.id, function (err, foundPastes) {
            if (err) {
                console.log(err);
            } else {
                if (foundPastes.author.id.equals(req.user._id)) {
                    res.render("edit", { pastes: foundPastes, url: url });

                } else {
                    res.redirect('back'); // flash message you dont own tihs paste
                }
            }
        })
    } else {
        res.redirect("/login"); // flash message you need to login to edit
    }   
})

router.get("/mypastes/", function (req, res) {

    if (req.isAuthenticated()) {
        /*   var userid = req.user._id
          console.log(userid); */

        Paste.find({}).sort({ 'created': 'desc' }).limit().exec(function (err, allpastes) {
            if (err) {
                console.log(err);
            } else {
                res.render("mypastes", { pastes: allpastes })
            }
        });
    } else {
        res.redirect("/login"); // flash message you need to login to edit
    };
});


router.put("/edit/:id", isLoggedIn, function (req, res) {
    Paste.findByIdAndUpdate(req.params.id, req.body.paste, function (err, updatePaste) {
        if (err) {
            res.redirect("/");
        } else {
            res.redirect("/p/" + req.params.id);
        }
    })
})

// Delete routve

router.delete("/delete/:id", function (req, res) {
    Paste.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/sidebar");
        } else {
            res.redirect("/");
        }
    });
});

module.exports = router;
