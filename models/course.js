const mongoose = require('mongoose');
const lessonModel=require('./lessons')
const CourseSchema = new mongoose.Schema({
  title: String,
  tutor: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Tutor'
  },
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


module.exports = mongoose.model('Course', CourseSchema);
