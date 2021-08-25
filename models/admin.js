const mongoose=require('mongoose')

const AdminSchema=new mongoose.Schema({
    usernames:[{
        type:String
    }
]
})

module.exports=mongoose.model('admin',AdminSchema)