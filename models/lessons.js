const mongoose=require('mongoose')

const LessonsSchema=new mongoose.Schema(
    {
        title:String,
        lessonUrl:String
    }
)

module.exports=mongoose.model('lesson',LessonsSchema)