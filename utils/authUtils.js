const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // Load redirect URI from environment variable
);

// Generate a URL for the user to authorize your app
const generateAuthUrl = (userId) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    state: state,  // Pass userId as state
  });
  return authUrl;
};


// Exchange authorization code for tokens
const getTokens = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI, // Explicitly include redirect URI
    });
    return tokens;
  } catch (error) {
    console.error("Error retrieving tokens:", error.message);
    throw new Error("Failed to exchange authorization code for tokens");
  }
};

module.exports = { generateAuthUrl, getTokens };
