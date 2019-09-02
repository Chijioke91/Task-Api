const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {
  sendWelcomeMessage,
  sendGoodbyeMessage
} = require('../emails/accounts');

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeMessage(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Updates' });
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendGoodbyeMessage(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// logout from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

const match_image = file => file.originalname.match(/\.(jpg|jpeg|png)$/);
const match_doc = file => file.originalname.match(/\.(doc|docx)$/);
const match_video = file =>
  file.originalname.match(/\.(mp4|avi|3gp|webm|flv|wmv)$/);

const uploads = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    console.log(req);
    if (!match_image(file)) {
      return cb(new Error('Please upload an image file'));
    }
    cb(null, true);
  }
});

// image upload
router.post(
  '/users/me/avatar',
  auth,
  uploads.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({ width: 250, height: 250 })
      .toBuffer();
    req.user.avatar = buffer;
    req.user.avatars = req.user.avatars.concat({ avatar: buffer });
    await req.user.save();
    res.send({
      status: 'success',
      message: 'Upload successful'
    });
  },
  (error, req, res, next) => {
    res.status(400).send({
      status: 'error',
      message: error.message
    });
  }
);

// delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  req.user.avatars = [];
  await req.user.save();
  res.send();
});

// serve image to browser
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
module.exports = router;
