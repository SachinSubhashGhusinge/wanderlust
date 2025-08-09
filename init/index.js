const mongoose = require("mongoose");
const initData =require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({...obj, owner:'688f3527f1fa92ad7d52fd61'})) // in old data inserting owner with id
    await Listing.insertMany(initData.data)
    console.log("data was initialized");
}

initDB();