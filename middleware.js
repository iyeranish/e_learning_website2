const {courseSchema,lessonSchema, userSchema}=require('./schemas')
const AppError = require('./utils/appError')


module.exports.validateCourse=function(req,res,next){
    const {error}=courseSchema.validate(req.body)
    if (error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new AppError(401,msg)
    }
    else{
        next();
    }
}

module.exports.validateLesson=function(req,res,next){
    const {error}=lessonSchema.validate(req.body)
    if (error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new AppError(401,msg)
    }else{
        next();
    }
}

module.exports.validateUser=function(req,res,next){

    const {error}=userSchema.validate(req.body)
    if (error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new AppError(401,msg)
    }else if (req.body.user.password !== req.body.user.password2){
        throw new AppError(401,"Passwords does not match")
    }else if(req.usernames.includes(req.body.user.username)){
        throw new AppError(401,'Username already exist')
    } 
    else{
        next();
    }
}