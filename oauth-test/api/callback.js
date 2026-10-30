module.exports = async (req, res) => {
  const fail = (msg) => res.redirect(302, `/?status=error&msg=${encodeURIComponent(msg)}`);
  try {
    const { code, state, error } = req.query;
    if (error) return fail(error);

    // CSRF check
    const cookie = (req.headers.cookie || "").match(/oauth_state=([a-f0-9]+)/);
    if (!cookie || cookie[1] !== state) return fail("state mismatch");

    // Exchange the code for tokens (server-side, uses the client secret)
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await r.json();
    if (!r.ok) return fail(tokens.error_description || tokens.error);

    // Get the user's email from the id_token
    const idPayload = JSON.parse(Buffer.from(tokens.id_token.split(".")[1], "base64url").toString());

    // Forward to n8n (it stores them, e.g. in a Google Sheet or data table)
    const n8n = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        email: idPayload.email,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        scope: tokens.scope,
      }),
    });
    if (!n8n.ok) return fail("n8n webhook returned " + n8n.status);

    res.redirect(302, `/?status=ok&email=${encodeURIComponent(idPayload.email)}`);
  } catch (e) {
    fail(e.message);
  }
};