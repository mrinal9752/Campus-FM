const { sdk } = require("@audius/sdk");

const audius = sdk({
  apiKey: process.env.AUDIUS_API_KEY,
});

module.exports = audius;