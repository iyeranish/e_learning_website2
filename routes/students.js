var express = require('express');
var router = express.Router();
var StudentModel = require('../models/student');

const catchAsync = require('../utils/catchAsync');
const {
  validateCourse,
  validateLesson,
  validateUser,
  isLoggedIn,
  isStudent,
} = require('../middleware');

router.get(
  '/classes',
  isLoggedIn,
  isStudent,
  catchAsync(async function (req, res) {
    const student = await StudentModel.findOne({
      username: res.locals.currentUser.username,
    })
      .populate('enrolledCourses')
      .populate('tutor');
    res.render('students/classes', { student });
  })
);

module.exports = router;
