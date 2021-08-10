const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: String,
  tutor: String,
  description: String,
});

module.exports = mongoose.model('Course', CourseSchema);
