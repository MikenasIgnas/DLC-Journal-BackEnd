const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ChecklistData = new Schema({
    
      userName:{
      type:String,
      required: true,
    },
      filledData:{
        type: Array, 
        required: true,
    },

    startDate:{
      type:String,
      required: true,
    },

    startTime:{
      type:String,
      required: true,
    },
    endDate:{
      type:String,
      required: true,
    },
    endTime:{
      type:String,
      required: true,
    },
    problemCount:{
      type:Number,
      required: true,
    },
    secret:{
      type:String,
      required: true,
    },
    id:{
      type: Number
    },
    userRole:{
      type:String,
      required: true,
    }
  
  }
)


const exportFilledChecklistData = mongoose.model("FilledChecklistData", ChecklistData)

module.exports = exportFilledChecklistData