
exports.getAgeGroup = (age) => {
    // Define age groups based on the age value
  if (age <= 12) return "child"; // 0-12 years: child

  if (age <= 19) return "teenager"; // 13-19 years: teenager

  if (age <= 59) return "adult"; // 20-59 years: adult
  
  return "senior"; // 60+ years: senior
};