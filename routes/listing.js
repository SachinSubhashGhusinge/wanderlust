const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js")
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require('multer'); // multer is a Node.js middleware used for handling multipart/form-data, which is primarily used for uploading files. It is typically used with Express.js applications .
const {storage} = require("../cloudeConfig.js")
const upload = multer({storage}); // multer create the file uploads in which they store our uploaded file


// validate listing frome server side
const validateListing = (req,res,next)=>{ 
    let result= listingSchema.validate(req.body);
    // console.log(result);
    if(result.error){
        throw new ExpressError(404, result.error);
    }else{
        next()
    }      
};



// index route
router.get("/",wrapAsync(listingController.index));

// new route this is for create route write above because they search new in database as a id 
router.get("/new",isLoggedIn,listingController.renderNewForm);


// show route
router.get("/:id", wrapAsync(listingController.showListing));

// create route
router.post("/",isLoggedIn,upload.single('listing[image]'),validateListing, // for file data
    wrapAsync(listingController.createListing));




// edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

// update
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),wrapAsync(listingController.updateListing));

//DELETE
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));


module.exports = router;



// we can do this also for simpli fication
// router.
// route("/") // ya route p aa bali sari request
// .get(wrapAsync(listingController.index)) // index route
// .post("/",validateListing,isLoggedIn,   // create route
//     wrapAsync(listingController.createListing));


// // new route this is for create route write above because they search new in database as a id 
// router.get("/new",isLoggedIn,listingController.renderNewForm);


// router.route("/:id") // /id p aa bali sari request
// .get( wrapAsync(listingController.showListing))// show route
// .put(isLoggedIn,isOwner,wrapAsync(listingController.updateListing)) // update
// .delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing)) // delete

// // edit route
// router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

