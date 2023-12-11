const mongoose = require('mongoose');
const { Schema } = mongoose;

const userIdCounterSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 1
  }
});

const UserIdCounter = mongoose.model('userIdCounter', userIdCounterSchema);

// Then, you can use the model to create documents like this:


module.exports = UserIdCounter