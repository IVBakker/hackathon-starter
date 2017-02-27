const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Score = require('./Score');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

//  facebook: String,
//  twitter: String,
  google: String,
//  github: String,
//  instagram: String,
//  linkedin: String,
//  steam: String,
  tokens: Array,
  profile: {
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String
  },
  admin: { type: Boolean, default: false },
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
	Score.findOne({ email: user.email }, (err, score) => {
		if (err) { console.error("Error checking user score", err);
			return;
		}
		console.log("Score user existing:", score);
		if (score === null) {
			score = new Score();
		}
		score.email = user.email;
		score.username = user.username;
		score.save();
	});
	
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

userSchema.virtual('username').get(function() {
	var name=this.email;
	if(this.profile && this.profile.name)
	{
			var aname = this.profile.name.split(' ');
			if (aname.length > 1 && aname[0].length > 0)
			{
					name = aname[1] + ' ' + aname[0][0];
			}
			else
					name = this.profile.name;
	}
		return name;
});

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

userSchema.virtual('picture').get(function() {
	var src_image = '';
	if (this.profile && this.profile.picture)
		src_image = this.profile.picture;
	else
		src_image = this.gravatar(60);
  return src_image;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
