var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
const CourseModel=require('./course')
const AdminModel=require('./admin')
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
      // await CourseModel.deleteMany({
      //     _id:{
      //         $in:doc.reviews
      //     }
      // })
      await UserModel.deleteOne({
        username:doc.username
      })
      const admin=await AdminModel.findOne({})
      admin.usernames=admin.usernames.filter(el=>el!=doc.username)
      await admin.save()
  }
})

TutorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Tutor', TutorSchema);
