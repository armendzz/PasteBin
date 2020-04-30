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

var pasteRoutes = require("./routes/pastes"),
    userRoutes  = require("./routes/user"),
    indexRoutes = require("./routes/index");



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

app.use(indexRoutes);
app.use(pasteRoutes);
app.use(userRoutes);

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




app.listen(3001, 'localhost', function () {
    console.log('Server Has Started...');
    console.log('http://localhost:3001')
});


