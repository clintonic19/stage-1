const axios = require("axios");

exports.getGender = async (name) => {
  const res = await axios.get(`https://api.genderize.io?name=${name}`);
  return res.data;
//   https://api.genderize.io?name={name}
//   https://api.agify.io?name={name}
//   https://api.nationalize.io?name={name}
};

exports.getAge = async (name) => {
  const res = await axios.get(`https://api.agify.io?name=${name}`);
  return res.data;
};

exports.getNationality = async (name) => {
  const res = await axios.get(`https://api.nationalize.io?name=${name}`);
  return res.data;
};