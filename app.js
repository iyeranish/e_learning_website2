var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Course = require('./models/course');

mongoose.connect('mongodb://localhost:27017/e_learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('landing');
});

app.get('/classes', async function (req, res) {
  const courses = await Course.find();
  res.render('courses/index', { courses });
});

app.get('/class/:id', function (req, res) {
  res.send('hello');
});

app.get('/login', function (req, res) {});

app.listen(3000, function () {
  console.log('The website has started');
});
