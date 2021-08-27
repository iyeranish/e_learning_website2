var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
const AdminModel=require('./admin')
var StudentSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  gender: String,
  address: [
    {
      street_address: String,
      city: String,
      state: String,
      pincode: String,
    },
  ],
  username: String,
  email: String,
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }
  ]
});

StudentSchema.post('findOneAndDelete', async(doc)=>{
  if(doc){
      await UserModel.deleteOne({
        username:doc.username
      })
      const admin=await AdminModel.findOne({})
      admin.usernames=admin.usernames.filter(el=>el!=doc.username)
      await admin.save()
  }
})


StudentSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Student', StudentSchema);
