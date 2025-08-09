const Joi = require('joi');
const joi = require('joi'); // joi is use for validation on server side data
module.exports.listingSchema = joi.object({ // when we send the data in req body using hoppscotch then we required server side validataion
    listing : joi.object({
        title: joi.string().required(),
        description : joi.string().required(),
        location:  joi.string().required(),
        country : joi.string().required(),
        price: joi.number().required().min(0),
        image : joi.string().allow("", null),
    }).required()
})

module.exports.reviewSchema =joi.object({
    review : joi.object({
        rating: joi.number().required().min(1).max(5),
        comment :joi.string().required(),
    }).required()
});