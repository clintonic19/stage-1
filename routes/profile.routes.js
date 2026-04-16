const express = require("express");
const router = express.Router();
const{ 
    createProfile, 
    getProfileById, 
    getAllProfiles, 
    deleteProfile } = require("../controllers/profile.controller");


// POST /api/profiles - Create a new profile
router.post("/profiles", createProfile);

// GET /api/profiles - Get all profiles
router.get("/profiles", getAllProfiles);

// GET /api/profiles/:id - Get profile by ID
router.get("/profiles/:id", getProfileById);

// DELETE /api/profiles/:id - Delete a profile by ID
router.delete("/profiles/:id", deleteProfile);

module.exports = router;

