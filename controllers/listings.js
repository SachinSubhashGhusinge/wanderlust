const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" } // each review ka vast uk author
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!");
        res.redirect("/listings");
    }
    // console.log(listing)
    res.render("listings/show", { listing });
}


module.exports.createListing = async (req, res, next) => {
    // let {title, description, image, price, country, location} =req.body;
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    //  if(!newListing.title){ // without using joi we can validate server side data using like that
    //     throw new ExpressError(404,"title is missing!");
    //  }
    //  if(!newListing.description){
    //     throw new ExpressError(404,"description is missing!");
    //  }
    //  if(!newListing.location){
    //     throw new ExpressError(404,"location is missing!");
    //  }
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings")

}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_300");  // setting image hight and width wen editing info
    res.render("listings/edit", { listing ,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(404, " Send the valid data for listing")
    }
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Your Listing are updated ");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Delete!");
    res.redirect("/listings");

};