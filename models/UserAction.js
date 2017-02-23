const mongoose = require('mongoose');

const userAction = new mongoose.Schema({
  email:  { type: String },
  game:  { type: String },
  action: { type: mongoose.Schema.Types.Mixed },
  time: { type: Date },
});

const Action = mongoose.model('Action', userAction);

module.exports = Action;
