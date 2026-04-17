const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    gender: String,
    gender_probability: Number,
    sample_size: Number,
    age: Number,
    age_group: String,
    country_id: String,
    country_probability: Number,
    created_at: {
      type: Date,
      default: () => new Date()
    }
  },
  {
    versionKey: false,
    id: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret._id;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Profile", profileSchema);
