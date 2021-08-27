var express = require('express');
var router = express.Router();
const adminModel = require('../models/admin');
var CourseModel = require('../models/course');

var User = require('../models/user');
var passport = require('passport');
var StudentModel = require('../models/student');
var TutorModel = require('../models/tutor');

const catchAsync = require('../utils/catchAsync');
const {
  validateCourse,
  validateLesson,
  validateUser,
  isLoggedIn,
} = require('../middleware');

/* HOME PAGE */

router.get('/', (req, res) => {
  res.render('landing');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.use('/register', async (req, res, next) => {
  const { usernames } = await adminModel.findOne({});
  req.usernames = usernames;
  next();
});

router.post(
  '/register',
  validateUser,
  catchAsync(async (req, res) => {
    var first_name = req.body.user.first_name;
    var last_name = req.body.user.last_name;
    var street_address = req.body.user.street_address;
    var city = req.body.user.city;
    var state = req.body.user.state;
    var pincode = req.body.user.zip;
    var email = req.body.user.email;
    var username = req.body.user.username;
    var password1 = req.body.user.password;
    var password2 = req.body.user.password2;
    var type = req.body.user.type;
    var gender = req.body.user.gender;
    var username = req.body.user.username;

    // User.register(Users, password1, function (err, user) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log('User Created');
    //   }
    // });

    try {
      var Users = new User({
        email: email,
        username: username,
        type: type,
      });
      const registeredUser = await User.register(Users, password1);
      req.login(registeredUser, err => {
        if (err) {
          return next(err);
        }
        var usertype = req.user.type;
        req.flash('success', 'Successfully registered as a new User');
        res.redirect('/' + usertype + 's/classes');
      });
    } catch (e) {
      req.flash('error', e.message);
      console.log(e.message);
      res.redirect('/register');
    }

    if (type == 'student') {
      var Students = new StudentModel({
        first_name: first_name,
        last_name: last_name,
        gender: gender,
        address: [
          {
            street_address: street_address,
            city: city,
            state: state,
            pincode: pincode,
          },
        ],
        email: email,
        username: username,
      })
        .save()
        .then(newStudent => {
          console.log('New Student Created' + newStudent);
        });
    } else {
      var Tutors = new TutorModel({
        first_name: first_name,
        last_name: last_name,
        gender: gender,
        address: [
          {
            street_address: street_address,
            city: city,
            state: state,
            pincode: pincode,
          },
        ],
        email: email,
        username: username,
      })
        .save()
        .then(newTutor => {
          console.log('New Tutor Created' + newTutor);
        });
    }
    const admin = await adminModel.findOne({});
    await admin.usernames.push(Users.username);
    await admin.save();
  })
);

router.get('/login', (req, res) => {
  res.render('login');
});

//todo: remember to add failuerflash:true after implenting flash
router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash:true,
    failureRedirect: '/login',
  }),
  async function (req, res) {
    var usertype = req.user.type;
    req.flash('success', 'You have logged in');
    const redirectLink = req.session.returnTo || '/' + usertype + 's/classes';
    res.redirect(redirectLink);
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/');
});



module.exports = router;
