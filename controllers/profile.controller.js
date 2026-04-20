// controllers/profile.controller.js
const crypto = require("crypto");
const Profile = require("../models/profile.model");
const { getAgeGroup } = require("../utils/age.util");

const {
  getGender,
  getAge,
  getNationality
} = require("../services/externalApi.services");

const formatProfile = (profile) => {
  if (!profile) {
    return null;
  }

  const data = typeof profile.toJSON === "function" ? profile.toJSON() : { ...profile };
  delete data._id;
  delete data.__v;
  return data;
};

const settledValue = (result) => (result && result.status === "fulfilled" ? result.value : null);

const pickTopCountry = (countries) => {
  if (!Array.isArray(countries) || countries.length === 0) {
    return null;
  }

  return countries.reduce((best, current) => {
    if (!best) {
      return current;
    }

    return (current?.probability ?? 0) > (best?.probability ?? 0) ? current : best;
  }, null);
};

// Create a new profile
exports.createProfile = async (req, res, next) => {
  try {
    let { name } = req.body || {};

    if (name === undefined || name === null) {
      return res.status(400).json({
        status: "error",
        message: "Name is required"
      });
    }

    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string"
      });
    }

    name = name.trim();

    if (name.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Name cannot be empty"
      });
    }

    name = name.toLowerCase();

    const existingProfile = await Profile.findOne({ name });

    if (existingProfile) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: formatProfile(existingProfile)
      });
    }

    const [genderResult, ageResult, nationalityResult] = await Promise.allSettled([
      getGender(name),
      getAge(name),
      getNationality(name)
    ]);

    const gender = settledValue(genderResult);
    const age = settledValue(ageResult);
    const nationality = settledValue(nationalityResult);
    const topCountry = pickTopCountry(nationality?.country);
    const ageValue = typeof age?.age === "number" ? age.age : null;

    const profile = new Profile({
      id: crypto.randomUUID(),
      name,
      gender: typeof gender?.gender === "string" ? gender.gender : null,
      gender_probability: typeof gender?.probability === "number" ? gender.probability : null,
      sample_size: typeof gender?.count === "number" ? gender.count : null,
      age: ageValue,
      age_group: ageValue === null ? null : getAgeGroup(ageValue),
      country_id: typeof topCountry?.country_id === "string" ? topCountry.country_id : null,
      country_probability: typeof topCountry?.probability === "number" ? topCountry.probability : null,
      created_at: new Date().toISOString()
    });

    try {
      await profile.save();
      
    } catch (error) {
      if (error && error.code === 11000) {
        const duplicateProfile = await Profile.findOne({ name });

        if (duplicateProfile) {
          return res.status(200).json({
            status: "success",
            message: "Profile already exists",
            data: formatProfile(duplicateProfile)
          });
        }
      }

      throw error;
    }

       await Profile.updateOne(
      { name: profile.name },
      { $setOnInsert: profile },
      { upsert: true }
  );

    return res.status(201).json({
      status: "success",
      data: formatProfile(profile)
    });

  } catch (err) {
    next(err);
  }
};

// Get a profile by ID
exports.getProfileById = async (req, res, next) => {
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
    data: formatProfile(profile)
  });
    
 } catch (error) {
    next(error);
 }

};

// Get all profiles with optional filters
exports.getAllProfiles = async (req, res, next) => {
 try {
     const { gender, country_id, age_group } = req.query;

  let filter = {};

  if (gender) filter.gender = gender.toLowerCase();
  if (country_id) filter.country_id = country_id.toUpperCase();
  if (age_group) filter.age_group = age_group.toLowerCase();

  const profiles = await Profile.find(filter)
    .select("id name gender gender_probability sample_size age age_group country_id country_probability created_at")
    .lean();

  res.status(200).json({
    status: "success",
    count: profiles.length,
    data: profiles
  });

 } catch (error) {
    next(error);
 }

};

// Delete a profile by ID
exports.deleteProfile = async (req, res, next) => {
try {
    
    const { id } = req.params;

  const profile = await Profile.findByIdAndDelete( id );

  if (!profile) {
    return res.status(404).json({
      status: "error",
      message: "Profile not found"
    });
  }
  res.status(200).json({
    status: "success",
    message: "Profile deleted successfully"
  });

} catch (error) {
  next(error);
}
};
