const mongoose = require('mongoose');
module.exports = mongoose.model('JobProfile', new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}));