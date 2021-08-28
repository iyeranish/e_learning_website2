const mongoose = require('mongoose');
const lessonModel=require('./lessons')
const bcrypt=require('bcrypt')
const CourseSchema = new mongoose.Schema({
  title: String,
  tutor: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Tutor'
  },
  password:String,
  description: String,
  lessons:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'lesson'
    }
  ]
});

CourseSchema.post('findOneAndDelete',async(doc)=>{
  if(doc){
    await lessonModel.deleteMany({
      _id:{
        $in:doc.lessons,
      }
    })
  }
})

CourseSchema.pre('save',async function(next){
  if(!this.isModified('password')){
    return next()
  }else{
    this.password=await bcrypt.hash(this.password,12)
        next()
  }
})


module.exports = mongoose.model('Course', CourseSchema);
