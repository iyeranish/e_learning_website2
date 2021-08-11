const mongoose = require('mongoose');
const names = ['Romil Desai', 'Anish Iyer'];
const titles = ['Google Data Analytics', 'Machine Learning', 'Web development'];

mongoose.connect('mongodb://localhost:27017/e_learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log('Database connected');
});

const CourseModel = require('../models/course');
const LessonModel=require('../models/lessons')
const sample = array => array[Math.floor(Math.random() * array.length)];

const seed = async () => {
  await CourseModel.deleteMany();
  await LessonModel.deletaMany();
  const lesson=LessonModel({
    title:'Introduction',
    lessonUrl:'https://docs.google.com/document/d/1du1-y2nkU-7yntTTq_Ltu6-KZZkSebsXl39YVYiKILQ/edit?usp=sharing'
  })
  await lesson.save()
  for (let i = 0; i < 10; i++) {
    const course = CourseModel({
      title: sample(titles),
      tutor: sample(names),
      description:
        'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illum accusantium ducimus ex voluptatem excepturi mollitia! Magni quaerat laudantium animi voluptates accusamus provident fugit aperiam, error alias optio temporibus sequi voluptate!',
    });
    course.lessons.push(lesson)
    await course.save();
  }
};

seed().then(() => {
  mongoose.connection.close();
});
