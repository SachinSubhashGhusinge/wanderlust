if (process.env.NODE_ENV != "production") { // now we are in development phase
  //dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. It helps keep sensitive data like API keys, database URIs, and secrets out of your source code.
  require('dotenv').config()
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require('./models/listing');
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const session = require("express-session");
const MongoStore = require('connect-mongo'); // session not work when we are on production side like mongo atlas that why we use this
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const MONGO_URL = "mongodb://localhost:27017/wanderlust";

const dburl = process.env.ATLASDB_URL;
main().then(() => {
  console.log("connected to DB");
}).catch((err) => {
  console.log(err);
});

async function main() {
  await mongoose.connect(dburl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl: dburl, // now our session info store into the url
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter: 24*3600,

});

const PORT = process.env.PORT || 8080;

store.on("error", ()=>{
  console.log("ERROR in MONGO SESSION STORE",err)
});

const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 + 24 * 60 * 60 * 1000,
    maxAge: 7 + 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
}

app.get("/",(req,res)=>{
   res.redirect("/listings");
});


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // Tells Passport how to store user data in the session.
passport.deserializeUser(User.deserializeUser()); //Tells Passport how to retrieve the full user object from the session-stored ID.

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // current user ki information store
  next();
})

// Demo user for pass
// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"delta-student" // schema for username is not define but passpoert local mongoose automatically define schema for that
//     });
//     let registerUser = await User.register(fakeUser,"helloworld"); // it take the user and password and check username are unique and so on
//     res.send(registerUser);
// })

// search functionality by self
app.get('/listings/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.redirect('/listings'); // No search query → go home
    }

    let listing = null;

    // If query is numeric → treat as price search
    if (!isNaN(q)) {
      // isNaN("abc")     // true   → because "abc" is not a number
      // !isNaN("abc")    // false  → so code inside won't run

      // isNaN("123")     // false  → because "123" can be converted to a number
      // !isNaN("123")    // true   → so code inside WILL run
      const price = Number(q); // convert string to number

      // First try exact match
      listing = await Listing.findOne({ price: price });

      // If no exact match → try less than or equal
      if (!listing) {
        listing = await Listing.findOne({ price: { $lt: price } })
          .sort({ price: -1 }); // closest lower price
      }
    } else {
      // Otherwise search multiple text fields
      listing = await Listing.findOne({
        $or: [
          { country: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { title: { $regex: q, $options: 'i' } }
        ]
      });
    }

    // If still no match → error
    if (!listing) {
      req.flash("error", "No listing found for your search");
      return res.redirect('/listings');
    }

    // Success → redirect to detail page
    req.flash("success", "Listing found!");
    res.redirect(`/listings/${listing._id}`);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});




app.use("/listings", listingRouter); //  accessing all listing using this
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);





// app.get("/listing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:1200,
//         location :"calangute goa",
//         country:"india",
//     })
//     await sampleListing.save();
//     console.log("sample data was saved");
//     res.send("successful testing");

// });

// app.use((req, res, next) => {
//   console.log("Requested URL:", req.url);
//   next();
// });

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message })
  // res.status(statusCode).send(message)
});

app.listen(PORT, () => {
  console.log(`Listing on port ${PORT}`);
});
