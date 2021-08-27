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
  isTutor,
  isStudent,
  isOwner,
  checkIfAlreadyEnrolled,
  checkIfEnrolled,
} = require('../middleware');

var CourseModel = require('../models/course');
const LessonModel = require('../models/lessons');

/* ALL CLASSES */

router.get(
  '/',
  catchAsync(async function (req, res) {
    const courses = await CourseModel.find().populate('tutor');
    console.log(courses)
    res.render('courses/index', { courses });
  })
);

router.get('/new', isLoggedIn,isTutor, (req, res) => {
  res.render('courses/new');
});

router.post(
  '/',
  isLoggedIn,
  isTutor,
  validateCourse,
  catchAsync(async (req, res) => {
    const course = new CourseModel(req.body.course);
    course.tutor = req.tutor._id;
    await course.save();
    const tutor = req.tutor;
    tutor.courses.push(course._id);
    await tutor.save();
    req.flash('success','Successfullt added a new course')
    res.redirect('/tutors/classes');
  })
);

/* MORE DETAILS ABOUT A SPECIFIC CLASS */

router.get(
  '/:id',
  catchAsync(async function (req, res) {
    const course = await CourseModel.findById(req.params.id).populate('lessons').populate('tutor');
    let isOwner=false
    let alreadyEnrolled=false
    let isTutor=false
    if (!course) {
      return next(new AppError(404, 'Class not found'));
    }
    if(req.tutor){
      isTutor=true
      isOwner= course.tutor._id.equals(req.tutor._id)
    }else if(req.student){
      alreadyEnrolled=req.student.enrolledCourses.includes(course._id)
    }
    res.render('courses/show', { course,isOwner,alreadyEnrolled,isTutor });
  })
);

//

router.post(
  '/:id/enroll',
  isLoggedIn,
  isStudent,
  checkIfAlreadyEnrolled,
  catchAsync(async (req, res) => {
    const student = req.student;
    student.enrolledCourses.push(req.params.id);
    await student.save();
    req.flash('success','Successfullu enrolled to the course')
    res.redirect('/students/classes');
  })
);

router.post(
  '/:id/unenroll',
  isLoggedIn,
  isStudent,
  checkIfEnrolled,
  catchAsync(async (req, res) => {
    const student = req.student;
    student.enrolledCourses = student.enrolledCourses.filter(
      el => el != req.params.id
    );
    await student.save();
    req.flash('success','Successfully unenrolled from the course')
    res.redirect('/students/classes');
  })
);

router.post(
  '/:id/lessons',
  isLoggedIn,
  isTutor,
  isOwner,
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

    req.flash('success','Successfully added a new lesson to the course')
    res.redirect(`/classes/${req.params.id}`);
  })
);

router.delete(
  '/:id/lessons/:lessonId',
  isLoggedIn,
  isTutor,
  isOwner,
  catchAsync(async (req, res) => {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.redirect('/classes');
      return;
    }
    await course.lessons.pull({ _id: req.params.lessonId });
    await LessonModel.findByIdAndDelete(req.params.lessonId);
    await course.save();
    req.flash('success','Successfully deleted the lesson from the course')
    res.redirect(`/classes/${req.params.id}`);
  })
);

router.delete(
  '/:id',
  isLoggedIn,
  isTutor,
  isOwner,
  catchAsync(async (req, res) => {
    await CourseModel.findByIdAndDelete(req.params.id);
    req.flash('success','Successfully deleted the course')
    res.redirect('/tutors/classes');
  })
);

module.exports = router;
