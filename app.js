var express = require('express');
var app = express();
var mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/user');
var StudentModel = require('./models/student');
var TutorModel = require('./models/tutor');
var flash = require('connect-flash');
const adminModel = require('./models/admin');
var indexRoutes = require('./routes/index');
var courseRoutes = require('./routes/courses');
var studentRoutes = require('./routes/students');
var tutorRoutes = require('./routes/tutors');

const AppError = require('./utils/appError');

mongoose.connect('mongodb://localhost:27017/e_learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(
  require('express-session')({
    secret: 'Please run',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(async function (req, res, next) {
  res.locals.currentUser = req.user;
  if (req.user) {
    if (req.user.type == 'tutor') {
      const tutor = await TutorModel.findOne({
        username: res.locals.currentUser.username,
      });
      req.tutor = tutor;
    } else {
      const student = await StudentModel.findOne({
        username: res.locals.currentUser.username,
      });
      req.student = student;
    }
  }

  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use('/', indexRoutes);
app.use('/classes', courseRoutes);
app.use('/students/', studentRoutes);
app.use('/tutors', tutorRoutes);

app.use('*', (req, res, next) => {
  return next(new AppError(404, 'Page not found'));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = 'Something went wrong';
  }
  res.status(status).render('error', { err });
});

app.listen(3000, function () {
  console.log('The website has started');
});