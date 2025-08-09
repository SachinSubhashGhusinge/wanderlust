const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.createReview = async(req,res)=>{
   let listing=await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);

   newReview.author =req.user._id; // saving review with author
   listing.reviews.push(newReview); // pushing newReview into listing reviews

   await newReview.save();
   await listing.save();

   req.flash("success","New review created");
    res.redirect(`/listings/${listing._id}`);
};


module.exports.destroyReview = async(req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId); // in listing.js after this function middleware called

    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
}