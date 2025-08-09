const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// validate reviews for server side
const validateReview = (req,res,next)=>{ 
    let result= reviewSchema.validate(req.body);
    // console.log(result);
    if(result.error){
        throw new ExpressError(404, result.error);
    }else{
        next()
    }      
};

// reviews route
// post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

// delete Review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;
