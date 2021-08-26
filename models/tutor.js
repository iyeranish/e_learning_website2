var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
const CourseModel=require('./course')
var TutorSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  gender: String,
  address: [
    { street_address: String, city: String, state: String, pincode: String },
  ],
  username: String,
  email: String,
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
});


TutorSchema.post('findOneAndDelete', async(doc)=>{
  if(doc){
      await CourseModel.deleteMany({
          _id:{
              $in:doc.reviews
          }
      })
  }
})

TutorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Tutor', TutorSchema);
