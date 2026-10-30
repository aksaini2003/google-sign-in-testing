const crypto = require("crypto");

module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.setHeader("Set-Cookie", `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/drive.file",
    ].join(" "),
    access_type: "offline", // returns a refresh token
    prompt: "consent",      // forces the refresh token to be issued every time
    state,
  });

  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};