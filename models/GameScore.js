const mongoose = require('mongoose');

const gameScore = new mongoose.Schema({
  name:  { type: String },
  codename:  { type: String, unique: true },
  scores: { type: Array },
}, { timestamps: true });

const GameScore = mongoose.model('GameScore', gameScore);

module.exports = GameScore;
