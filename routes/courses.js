var express = require('express');
var router = express.Router();
var CourseModel = require('../models/course');
var StudentModel = require('../models/student');

const catchAsync = require('../utils/catchAsync');
const {
  validateCourse,
  validateLesson,
  validateUser,
  isLoggedIn,
} = require('../middleware');

var CourseModel = require('../models/course');
const LessonModel = require('../models/lessons');

/* ALL CLASSES */

router.get(
  '/',
  catchAsync(async function (req, res) {
    const courses = await CourseModel.find();
    res.render('courses/index', { courses });
  })
);

router.get('/new', isLoggedIn, (req, res) => {
  res.render('courses/new');
});

router.post(
  '/',
  isLoggedIn,
  validateCourse,
  catchAsync(async (req, res) => {
    console.log('User:-', req.user);
    console.log('tutor:-', req.tutor);
    const course = new CourseModel(req.body.course);
    course.tutor = req.tutor._id;
    await course.save();
    const tutor = req.tutor;
    tutor.courses.push(course._id);
    await tutor.save();
    res.redirect('/tutors/classes');
  })
);

/* MORE DETAILS ABOUT A SPECIFIC CLASS */

router.get(
  '/:id',
  catchAsync(async function (req, res) {
    const course = await CourseModel.findById(req.params.id).populate(
      'lessons'
    );
    if (!course) {
      return next(new AppError(404, 'Class not found'));
    }
    res.render('courses/show', { course });
  })
);

//

router.post(
  '/:id',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const student = req.student;
    student.enrolledCourses.push(req.params.id);
    await student.save();
    res.redirect('/students/classes');
  })
);

router.post(
  '/:id/unenroll',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const student = req.student;
    student.enrolledCourses = student.enrolledCourses.filter(
      el => el != req.params.id
    );
    await student.save();
    res.redirect('/students/classes');
  })
);

router.post(
  '/:id/lessons',
  isLoggedIn,
  validateLesson,
  catchAsync(async (req, res) => {
    const course = await CourseModel.findById(req.params.id).populate(
      'lessons'
    );
    if (!course) {
      res.redirect('/classes');
      return;
    }
    const { previousLesson = null, title, lessonUrl } = req.body.lesson;
    const lesson = LessonModel({ title, lessonUrl });
    await lesson.save();
    let i = 0;
    if (previousLesson) {
      for (let temp of course.lessons) {
        console.log(temp.title);
        if (temp.title === previousLesson) {
          break;
        }
        i += 1;
      }
      course.lessons.splice(i + 1, 0, lesson);
      await course.save();
    } else {
      await course.lessons.push(lesson);
      await course.save();
    }

    res.redirect(`/classes/${req.params.id}`);
  })
);

router.delete(
  '/:id/lessons/:lessonId',

  isLoggedIn,
  catchAsync(async (req, res) => {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.redirect('/classes');
      return;
    }
    await course.lessons.pull({ _id: req.params.lessonId });
    await LessonModel.findByIdAndDelete(req.params.lessonId);
    await course.save();
    res.redirect(`/classes/${req.params.id}`);
  })
);

router.delete(
  '/:id',

  isLoggedIn,
  catchAsync(async (req, res) => {
    await CourseModel.findByIdAndDelete(req.params.id);
    res.redirect('/classes');
  })
);

module.exports = router;
