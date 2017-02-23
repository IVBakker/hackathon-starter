const mongoose = require('mongoose');

const userScore = new mongoose.Schema({
  email:  { type: String, unique: true },
  username:  { type: String },
  scores: { type: Array, default: []},
}, { timestamps: true });


/**
 * Helper method for getting user's score
 */
userScore.virtual('score').get(function() {
  return this.scores.reduce(function(p,c){return p+c['score'];},0);
});

const Score = mongoose.model('Score', userScore);

module.exports = Score;
