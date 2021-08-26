var express = require('express');
var app = express();
var mongoose = require('mongoose');
var CourseModel = require('./models/course');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const path = require('path');
const LessonModel = require('./models/lessons');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/user');
var StudentModel = require('./models/student');
var TutorModel = require('./models/tutor');
var flash = require('connect-flash');

//
const catchAsync = require('./utils/catchAsync');
const {
  validateCourse,
  validateLesson,
  validateUser,
  isLoggedIn
} = require('./middleware');
const adminModel = require('./models/admin');

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
  if (req.user){
    if(req.user.type=="tutor"){
        const tutor = await TutorModel.findOne({
          username: res.locals.currentUser.username,
        });
        req.tutor=tutor
      }
    else{
      const student=await StudentModel.findOne({
        username: res.locals.currentUser.username,
      });
      req.student=student
    }
  }
  console.log(req.tutor)
  console.log(req.user)
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});
app.get('/', (req, res) => {
  res.render('landing');
});

app.get(
  '/classes',
  catchAsync(async function (req, res) {
    const courses = await CourseModel.find();
    res.render('courses/index', { courses });
  })
);

app.get('/classes/new',isLoggedIn, (req, res) => {
  res.render('courses/new');
});

app.post(
  '/classes',
  isLoggedIn,
  validateCourse,
  catchAsync(async (req, res) => {
    console.log('User:-',req.user)
    console.log('tutor:-',req.tutor)
    const course = new CourseModel(req.body.course);
    course.tutor=req.tutor._id
    await course.save();
    const tutor=req.tutor
    tutor.courses.push(course._id)
    await tutor.save()
    res.redirect('/tutors/classes');
  })
);

//
app.get(
  '/classes/:id',
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

app.post('/classes/:id',isLoggedIn,catchAsync(async (req,res)=>{
  const student=req.student
  student.enrolledCourses.push(req.params.id)
  await student.save();
  res.redirect('/students/classes')
}))

app.post('/classes/:id/unenroll',isLoggedIn,catchAsync(async (req,res)=>{
  const student=req.student
  student.enrolledCourses=student.enrolledCourses.filter((el)=>el!=req.params.id)
  await student.save();
  res.redirect('/students/classes')
}))

app.post(
  '/classes/:id/lessons',
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

app.delete(
  '/classes/:id/lessons/:lessonId',
  
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

app.delete(
  '/classes/:id',
  
  isLoggedIn,
  catchAsync(async (req, res) => {
    await CourseModel.findByIdAndDelete(req.params.id);
    res.redirect('/classes');
  })
);

//POST AUTHENTICATION ROUTES

app.get(
  '/students/classes',
  isLoggedIn,
  catchAsync(async function (req, res) {
    const student =( await StudentModel.findOne({username: res.locals.currentUser.username,}).populate('enrolledCourses').populate('tutor'))
    res.render('students/classes', { student });
  }))

app.get(
  '/tutors/classes',
  isLoggedIn,
  catchAsync(async function (req, res) {
    const tutor = await TutorModel.findOne({username: res.locals.currentUser.username,}).populate('courses');
    console.log(tutor)
    res.render('tutors/classes', { tutor });
  })
);

// AUTHENTICATION ROUTES

app.get('/register', (req, res) => {
  res.render('register');
});

app.use('/register', async (req, res, next) => {
  const { usernames } = await adminModel.findOne({});
  req.usernames = usernames;
  next();
});

app.post('/register', validateUser, async function (req, res) {
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

  var Users = new User({
    email: email,
    username: username,
    type: type,
  });
  User.register(Users, password1, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log('User Created');
    }
  });

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
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});


//todo: remember to add failuerflash:true after implenting flash
app.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  async function (req, res) {
    var usertype = req.user.type;
    const redirectLink=req.session.returnTo || '/'+usertype+'s/classes'
    res.redirect(redirectLink);
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/');
});

//

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
