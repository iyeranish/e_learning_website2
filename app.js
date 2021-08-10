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

express.urlencoded({ extended: true });

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('landing');
});

app.get('/classes', async function (req, res) {
  const courses = await Course.find();
  res.render('courses/index', { courses });
});

app.get('/classes/:id', function (req, res) {
  Course.findById(req.params.id, function (err, course) {
    if (err) {
      console.log(err);
    } else {
      res.render('courses/show', { course });
    }
  });
});

app.get('/login', function (req, res) {});

app.listen(3000, function () {
  console.log('The website has started');
});
