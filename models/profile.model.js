const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  id: { 
    type: String, 
    unique: true 
}, // UUID v7

  name: { 
    type: String, 
    unique: true, 
    lowercase: true
 },

  gender: String,

  gender_probability: Number,

  sample_size: Number,

  age: Number,

  age_group: String,

  country_id: String,

  country_probability: Number,

  created_at: { type: Date, default: () => new Date() }
  
});

module.exports = mongoose.model("Profile", profileSchema);