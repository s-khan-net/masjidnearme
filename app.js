const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path')
const rfs = require('rotating-file-stream')
const mongoose = require('mongoose');
const masjids = require('./routes/masjids');
const salaah = require('./routes/salaah');
const users = require('./routes/users');
const auth = require('./routes/auth');
const feedback = require('./routes/feedback');
require('dotenv').config();

var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

const uri = process.env.mongoConnection;
mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true })//process.env.mongoConnection,{useNewUrlParser:true})
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const app = express();
var server = require('http').Server(app);
app.use(express.json());

//cors
app.use(cors())
// app.options('*', cors())

// const validConnectSrc = appConfig.isDev ? ['*'] : ["'self'"];
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["*", "'unsafe-inline'"],
    connectSrc: ['*'],
    fontSrc: ["*"],
    styleSrc: ["'self'", "https://unpkg.com/", "https://cdnjs.cloudflare.com/", "https://fonts.googleapis.com/", "'unsafe-inline'"],
    imgSrc: ["*", 'data:'],
  },
}));

app.use(morgan('combined', { stream: accessLogStream }));

app.use('/v1/masjids', masjids);
app.use('/v1/salaah', salaah);
app.use('/v1/users', users);
app.use('/v1/auth', auth);
app.use('/v1/feedback', feedback);

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/devs.html`)
});
app.get('/Legal/Home/Web', (req, res) => {
  res.sendFile(`${__dirname}/views/legal.html`)
});
app.get('/Legal/Home/Android', (req, res) => {
  res.sendFile(`${__dirname}/views/android.html`)
});
server.listen(process.env.PORT, function () {
  console.log(`http://localhost:${process.env.PORT}`);
});