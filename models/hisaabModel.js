const mongoose = require('mongoose');



function getCurrentFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}
// Define the schema for the Hisaab model
const HisaabSchema = new mongoose.Schema({
  createrId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"user"
  },
  createdDate: {
    type: String,
    default: getCurrentFormattedDate()
  },
  Date:{
    type:Date,
    default:Date.now()
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sharable: {
    type: Boolean,
    default: false
  },
  encrypted: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    trim: true
  }
});



// Create the model from the schema
const HisaabModel = mongoose.model('Hisaab', HisaabSchema);

// Export the model
module.exports = HisaabModel;
