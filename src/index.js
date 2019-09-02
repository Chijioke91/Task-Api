const express = require('express');
require('./db/mongoose');
const userRoute = require('./routes/users');
const taskRoute = require('./routes/tasks');

require('dotenv').config();

const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

app.listen(port, () => console.log(`server started on port ${port}`));
