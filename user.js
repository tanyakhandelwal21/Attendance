//require mongoose
const mongoose = require("mongoose");

//create Schema
const Schema = mongoose.Schema;

//Use schema to create data structure
var data = new Schema({
  firstName:String,
  lastName:String,
  email:String,
  password:String,
  userType:String,
},{timestamps:true});

//create model
const model = mongoose.model("user", data);

//export model
module.exports=model;