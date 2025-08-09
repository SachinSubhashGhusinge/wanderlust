const express = require("express");
const router = express.Router({ mergeParams: true });// { mergeParams: true } allows the router to access route parameters from its parent router.
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

// signup step 1 form  for login
router.get("/signup", userController.renderSignupForm);

// data from the login form is store in db
router.post("/signup", wrapAsync(userController.signup));


//login login form 
router.get("/login", userController.renderLoginForm);

// match login data
router.post("/login", saveRedirectUrl, //same as below
    // Passport automatically extracts username and password from req.body during authentication
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), // It uses the 'local' strategy — meaning username + password authentication.
    userController.login);

// logout
router.get("/logout", userController.logout)


//  we can do this one but some error in version
// router
// .route("/signup")
// .get( userController.renderSignupForm)
// .post( wrapAsync(userController.signup));

// router
// .route("/login")
// .get(userController.renderLoginForm )
// .post( saveRedirectUrl, //same as below
// // Passport automatically extracts username and password from req.body during authentication
// passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), // It uses the 'local' strategy — meaning username + password authentication.
// userController.login);

//  // logout
// router.get("/logout",userController.logout)

module.exports = router;