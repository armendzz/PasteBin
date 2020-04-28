var express = require("express"),
    methodOverride = require("method-override"),
    app = express(),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    flash = require("connect-flash"),
    bodyParser = require("body-parser"),
    Paste = require("./models/paste")
mongoose = require("mongoose"),
    User = require("./models/user"),
    passportLocalMongoose = require("passport-local-mongoose");



mongoose.connect("mongodb://localhost/pastebinv1")
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

// Passport config
app.use(require("express-session")({
    secret: "kjo osh secret babooo",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})



var allpaste = Paste.find({}).sort({ 'created': 'desc' }).limit()
/* app.use(function(req, res, next){
    res.locals.token = '1234';
    next();
}); */

// ==========================
// middlewares
// ==========================

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be signed in to do that!");
    res.redirect("/login");
}



// ==========================
// routes
// ==========================



app.get("/", function (req, res) {
    Paste.find({ status: "public" }).sort({ 'created': 'desc' }).limit(5).exec(function (err, allpastes) {
        if (err) {
            console.log(err);
        } else {
            res.render("home", { pastes: allpastes, allpaste:allpastes });
        }
    });
});




app.get("/p/:id", function (req, res) {
    var url = req.headers.host + req.url;
    Paste.findById(req.params.id, function (err, foundPastes) {
        if (err) {
            console.log(err);
        } else {

            var userr = (!req.user) ? "anonymus" : req.user.username;
            /*  
                  if (foundPastes.status === "private" && userr === "anonymus"){
                      res.redirect("/login");
                  }  */


            res.render("showpastes", { pastes: foundPastes, url: url });
        }
    })
})




app.get("/sidebar", function (req, res) {
    Paste.find({ status: "public" }).sort({ 'created': 'desc' }).limit(5).exec(function (err, allpastes) {
        if (err) {
            console.log(err);
        } else {
            res.render("partials/sidebar", { pastes: allpastes, allpaste:allpastes });
        }
    });
});

app.get("/public", function (req, res) {
    Paste.find({ status: "public" }).sort({ 'created': 'desc' }).limit(5).exec(function (err, allpastes) {
        if (err) {
            console.log(err);
        } else {
            res.render("public", { pastes: allpastes, allpaste:allpastes });
        }
    });
});

app.post("/paste", function (req, res) {
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
    var newPaste = { title: title, content: content, author: author, highlights: highlights, expiration: expiration, status: status }
    Paste.create(newPaste, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/p/" + newlyCreated._id);
        }
    });

});


// edit route
app.get("/edit/:id", function (req, res) {
    var url = req.headers.host + req.url;
    if (req.isAuthenticated()) {

        Paste.findById(req.params.id, function (err, foundPastes) {
            if (err) {
                console.log(err);
            } else {
                if (foundPastes.author.id.equals(req.user._id)) {
                    res.render("edit", { pastes: foundPastes, url: url});

                } else {
                    res.redirect('back'); // flash message you dont own tihs paste
                }
            }
        })
    } else {
        res.redirect("/login"); // flash message you need to login to edit
    }
})

app.get("/mypastes/", function (req, res) {
  
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


app.put("/edit/:id", isLoggedIn, function (req, res) {
    Paste.findByIdAndUpdate(req.params.id, req.body.paste, function (err, updatePaste) {
        if (err) {
            res.redirect("/");
        } else {
            res.redirect("/p/" + req.params.id);
        }
    })
})

// Delete routve

app.delete("/delete/:id", function (req, res) {
    Paste.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/sidebar");
        } else {
            res.redirect("/");
        }
    });
});

/* =========================
Auth Routtes
========================= */



app.get("/register", function (req, res) {
    res.render("register");
})

app.post("/register", function (req, res) {
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

app.get("/login", function (req, res) {
    var errmessage = req.flash("error");
    res.render("login", { errmessage: errmessage });
});


app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function (req, res) {
    });


app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");

});




app.listen(3001, 'localhost', function () {
    console.log('Server Has Started...');
    console.log('http://localhost:3001')
});


