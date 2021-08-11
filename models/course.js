const mongoose = require('mongoose');
const lessonModel=require('./lessons')
const CourseSchema = new mongoose.Schema({
  title: String,
  tutor: String,
  description: String,
  lessons:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'lesson'
    }
  ]
});

module.exports = mongoose.model('Course', CourseSchema);
