// controllers/profile.controller.js
const Profile = require("../models/profile.model");
const { getAgeGroup } = require("../utils/age.util");

const {
  getGender,
  getAge,
  getNationality
} = require("../services/externalApi.services");


exports.createProfile = async (req, res, next) => {
  try {
    const { v7: uuidv7 } = require("uuid");
    
    let  {name}  = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty name"
      });
    }

    // Normalize
    // APIs expect lowercase names, and it also helps with idempotency checks
    name = name.toLowerCase(); 

    // Idempotency check
    const existingProfile = await Profile.findOne({ name });

    if (existingProfile) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existingProfile
      });
    }

    // Call APIs in parallel
    const [gender, age, nation] = await Promise.all([
      getGender(name),
      getAge(name),
      getNationality(name)
    ]);

    // Edge cases
    if (!gender.gender || gender.count === 0) {
      return res.status(502).json({
        status: "error",
        message: "Genderize returned an invalid response"
      });
    }

   
    if (!age.age) {
      return res.status(502).json({
        status: "error",
        message: "Agify returned an invalid response"
      });
    }

    // Nationalize can return an empty array if it has no data for the name
    if (!nation.country || nation.country.length === 0) {
      return res.status(502).json({
        status: "error",
        message: "Nationalize returned an invalid response"
      });
    }

    // Pick highest probability country
    const topCountry = nation.country.reduce((prev, curr) =>
      curr.probability > prev.probability ? curr : prev
    );

    // Create new profile
    const profile = new Profile({
      id: uuidv7(),
      name,
      gender: gender.gender,
      gender_probability: gender.probability,
      sample_size: gender.count,
      age: age.age,
      age_group: getAgeGroup(age.age),
      country_id: topCountry.country_id,
      country_probability: topCountry.probability,
      created_at: new Date().toISOString()
    });

    await profile.save();

    return res.status(201).json({
      status: "success",
      data: profile
    });

  } catch (err) {
    next(err);
  }
};


exports.getProfileById = async (req, res) => {
 try {
    const { id } = req.params;

    const profile = await Profile.findById(id);

  if (!profile) {
    return res.status(404).json({
      status: "error",
      message: "Profile not found"
    });
  }

  res.status(200).json({
    status: "success",
    data: profile
  });
    
 } catch (error) {
    next(error);
 }

};

exports.getAllProfiles = async (req, res) => {
 try {
     const { gender, country_id, age_group } = req.query;

  let filter = {};

  if (gender) filter.gender = gender.toLowerCase();
  if (country_id) filter.country_id = country_id.toUpperCase();
  if (age_group) filter.age_group = age_group.toLowerCase();

  const profiles = await Profile.find(filter).select(
    "id name gender age age_group country_id"
  );

  res.status(200).json({
    status: "success",
    count: profiles.length,
    data: profiles
  });

 } catch (error) {
    next(error);
 }

};


exports.deleteProfile = async (req, res) => {
try {
    
    const { id } = req.params;

  const profile = await Profile.findByIdAndDelete(id);

  if (!profile) {
    return res.status(404).json({
      status: "error",
      message: "Profile not found"
    });
  }
  res.status(204).json({
    status: "success",
    message: "Profile deleted successfully"
  });

} catch (error) {
  next(error);
}
};