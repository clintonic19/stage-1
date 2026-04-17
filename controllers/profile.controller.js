// controllers/profile.controller.js
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


// exports.createProfile = async (req, res, next) => {
//   try {
//     const { v7: uuidv7 } = require("uuid");

//     let  {name}  = req.body;

//     if (!name) {
//       return res.status(400).json({
//         status: "error",
//         message: "Missing or empty name"
//       });
//     }

//     // Normalize
//     // APIs expect lowercase names, and it also helps with idempotency checks
//     name = name.toLowerCase(); 

//     // Idempotency check
//     const existingProfile = await Profile.findOne({ name });

//     if (existingProfile) {
//       return res.status(200).json({
//         status: "success",
//         message: "Profile already exists",
//         data: existingProfile
//       });
//     }

//     // Call APIs in parallel
//     const [gender, age, nation] = await Promise.all([
//       getGender(name),
//       getAge(name),
//       getNationality(name)
//     ]);

//     // Edge cases
//     if (!gender.gender || gender.count === 0) {
//       return res.status(502).json({
//         status: "error",
//         message: "Genderize returned an invalid response"
//       });
//     }

   
//     if (!age.age) {
//       return res.status(502).json({
//         status: "error",
//         message: "Agify returned an invalid response"
//       });
//     }

//     // Nationalize can return an empty array if it has no data for the name
//     if (!nation.country || nation.country.length === 0) {
//       return res.status(502).json({
//         status: "error",
//         message: "Nationalize returned an invalid response"
//       });
//     }

//     // Pick highest probability country
//     const topCountry = nation.country.reduce((prev, curr) =>
//       curr.probability > prev.probability ? curr : prev
//     );

//     // Create new profile
//     const profile = new Profile({
//       id: uuidv7(),
//       name,
//       gender: gender.gender,
//       gender_probability: gender.probability,
//       sample_size: gender.count,
//       age: age.age,
//       age_group: getAgeGroup(age.age),
//       country_id: topCountry.country_id,
//       country_probability: topCountry.probability,
//       created_at: new Date().toISOString()
//     });

//     await profile.save();

//     return res.status(201).json({
//       status: "success",
//       data: profile
//     });

//   } catch (err) {
//     next(err);
//   }
// };

exports.createProfile = async (req, res, next) => {
  try {
    const { v7: uuidv7 } = require("uuid");

    let { name } = req.body || {};

    // VALIDATION (MATCH TEST EXPECTATIONS)

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

    // IDEMPOTENCY CHECK
    const existingProfile = await Profile.findOne({ name });

    if (existingProfile) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: formatProfile(existingProfile)
      });
    }

    // SAFE API CALLS (NO CRASHING)
    let gender, age, nation;

    try {
      [gender, age, nation] = await Promise.all([
        getGender(name),
        getAge(name),
        getNationality(name)
      ]);
    } catch (err) {
      return res.status(502).json({
        status: "error",
        message: "External API failure"
      });
    }

    // SAFE VALIDATION (NO CRASHING ACCESS)

    if (!gender || !gender.gender) {
      return res.status(502).json({
        status: "error",
        message: "Invalid gender response"
      });
    }

    if (!age || typeof age.age !== "number") {
      return res.status(502).json({
        status: "error",
        message: "Invalid age response"
      });
    }

    if (!nation || !Array.isArray(nation.country) || nation.country.length === 0) {
      return res.status(502).json({
        status: "error",
        message: "Invalid nationality response"
      });
    }

    // SAFE REDUCE (PREVENT CRASH ON BAD DATA)
    const topCountry = nation.country.reduce((prev, curr) => {
      if (!prev) return curr;
      return curr.probability > prev.probability ? curr : prev;
    });

    // CREATE PROFILE
    const profile = new Profile({
      id: uuidv7(),
      name,
      gender: gender.gender,
      gender_probability: gender.probability ?? 0,
      sample_size: gender.count ?? 0,
      age: age.age,
      age_group: getAgeGroup(age.age),
      country_id: topCountry?.country_id || null,
      country_probability: topCountry?.probability || 0,
      created_at: new Date().toISOString()
    });

    await profile.save();

    return res.status(201).json({
      status: "success",
      data: formatProfile(profile)
    });

  } catch (err) {
    next(err);
  }
};

exports.getProfileById = async (req, res, next) => {
 try {
    const { id } = req.params;

    const profile = await Profile.findOne({ id });

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


exports.deleteProfile = async (req, res, next) => {
try {
    
    const { id } = req.params;

  const profile = await Profile.findOneAndDelete({ id });

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
