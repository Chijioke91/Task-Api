const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Connected to mongoDB');
  })
  .catch(err => {
    console.log(err);
  });
