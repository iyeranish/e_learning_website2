const {courseSchema,lessonSchema, userSchema}=require('./schemas')
const AppError = require('./utils/appError')
const CourseModel=require('./models/course')
const catchAsync=require('./utils/catchAsync')

module.exports.validateCourse=function(req,res,next){
    const {error}=courseSchema.validate(req.body)
    if (error){
        const msg=error.details.map(el=>el.message).join(',')
        // throw new AppError(401,msg)
        req.flash('error',msg)
        return res.redirect(req.session.previous_url)
    }
    else{
        next();
    }
}

module.exports.validateLesson=function(req,res,next){
    const {error}=lessonSchema.validate(req.body)
    if (error){
        const msg=error.details.map(el=>el.message).join(',')
        // throw new AppError(401,msg)
        req.flash('error',msg)
        return res.redirect(req.session.previous_url)
    }else{
        next();
    }
}

module.exports.validateUser=function(req,res,next){

    const {error}=userSchema.validate(req.body)
    // if (error){
    //     const msg=error.details.map(el=>el.message).join(',')
    //     throw new AppError(401,msg)
    // }else if (req.body.user.password !== req.body.user.password2){
    //     throw new AppError(401,"Passwords does not match")
    // }else if(req.usernames.includes(req.body.user.username)){
    //     throw new AppError(401,'Username already exist')
    // }
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        req.flash('error',msg)
        res.status(401).redirect('/register')
    }else if (req.body.user.password !== req.body.user.password2){
        req.flash('error','Passwords does not match')
        res.status(401).redirect('/register')
    }else if(req.usernames.includes(req.body.user.username)){
            req.flash('error','Username already exist')
            res.status(401).redirect('/register')
    }else{
        next();
    }
}

module.exports.isLoggedIn=function(req,res,next){
        if(!req.isAuthenticated()){
            req.session.returnTo=req.originalUrl
            req.flash('error','You must be logged in first')

            return res.redirect('/login')
        }
        next()
}


module.exports.isStudent=function(req,res,next){
    if(!req.student){
        req.flash('error','Bad request')
        return res.redirect('/tutors/classes')
    }else{
       next() 
    }
}

module.exports.isTutor=function(req,res,next){
    if(!req.tutor){
        req.flash('error','Bad request')
        return res.redirect('/students/classes')
    }else{
       next() 
    }
}

module.exports.isOwner=catchAsync(async function(req,res,next){
    const course= await CourseModel.findById(req.params.id).populate('tutor')
    if(course.tutor._id.equals(req.tutor._id)){
        next()
    }
    else{
        req.flash('error','You are not authorized')
        return res.redirect(`/classes/${req.params.id}`)
    }
})


module.exports.checkIfAlreadyEnrolled=catchAsync(async function(req,res,next){
    const enrolledCourses=req.student.enrolledCourses
    if (enrolledCourses.includes(req.params.id)){
        req.flash('error','You have already enrolled to the course')
        return res.redirect(`/classes/${req.params.id}`)
    }else{
        next()
    }
})

module.exports.checkIfEnrolled=catchAsync(async function(req,res,next){
    const enrolledCourses=req.student.enrolledCourses
    if (!enrolledCourses.includes(req.params.id)){
        req.flash('error','You haven\'t enrolled to the course')
        return res.redirect(`/classes/${req.params.id}`)
    }else{
        next()
    }
})
