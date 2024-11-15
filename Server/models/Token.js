const mongoose = require('mongoose');
const tokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }
  });
  
  const Token = mongoose.model('Tokenr', tokenSchema);
  module.exports = {Token}