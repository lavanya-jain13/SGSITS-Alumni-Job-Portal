const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT || 587);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    const auth = user && pass ? { user, pass } : undefined;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth,
    });

    console.log("Email transporter initialized with host:", host);
  }
  return transporter;
};

/**
 * sendEmail supports:
 * - sendEmail({ to, subject, text, html })
 * - sendEmail(to, subject, text)
 */
const sendEmail = async (...args) => {
  let to, subject, text, html;

  if (typeof args[0] === "object" && args[0] !== null) {
    ({ to, subject, text, html } = args[0]);
  } else {
    [to, subject, text] = args;
  }

  if (!to || !subject) {
    console.error("Email error: 'to' and 'subject' are required");
    return null;
  }

  const user = process.env.EMAIL_USER;
  const from = user ? `Alumni Portal <${user}>` : "Alumni Portal <no-reply@localhost>";

  try {
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      text: text || "Please view this email in an HTML-compatible viewer.",
      html,
    });

    return info;
  } catch (err) {
    console.error("Email error:", err && (err.message || err));
    throw err;
  }
};

module.exports = { sendEmail };
