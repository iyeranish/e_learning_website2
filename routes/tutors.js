var express = require('express');
var router = express.Router();

var TutorModel = require('../models/tutor');

const catchAsync = require('../utils/catchAsync');
const {
  validateCourse,
  validateLesson,
  validateUser,
  isLoggedIn,
  isTutor,
} = require('../middleware');

router.get(
  '/classes',
  isLoggedIn,
  isTutor,
  catchAsync(async function (req, res) {
    const tutor = await TutorModel.findOne({
      username: res.locals.currentUser.username,
    }).populate('courses');
    res.render('tutors/classes', { tutor });
  })
);

module.exports = router;
