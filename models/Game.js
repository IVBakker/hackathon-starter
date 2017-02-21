const mongoose = require('mongoose');

const userScore = new mongoose.Schema({
  email: { type: String, unique: true },
  scores: Array,
}, { timestamps: true });


/**
 * Helper method for getting user's gravatar.
 */
userScore.methods.score = function score(size) {
  return this.scores.reduce(function(p,c){return p+c;},0);
};

const Score = mongoose.model('Score', userScore);

module.exports = Score;
