const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeMessage = (email, name) => {
  const msg = {
    to: email,
    from: 'cjaytechguy@gmail.com',
    subject: 'Welcome to tha Task App',
    text: `Welcome ${name}. Let us know what you feel about the app`
  };

  sgMail.send(msg);
};

const sendGoodbyeMessage = (email, name) => {
  sgMail.send({
    to: email,
    from: 'cjaytechguy@gmail.com',
    subject: `GoodBye`,
    text: `Thank you ${name} for using the App. We hope to have you back soon`
  });
};

module.exports = {
  sendWelcomeMessage,
  sendGoodbyeMessage
};
