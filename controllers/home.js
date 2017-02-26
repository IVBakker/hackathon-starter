/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

exports.pre_index = (req, res) => {
  res.render('countdown', {
    title: 'Home'
  });
};

exports.rules = (req, res) => {
  res.render('rules', {
    title: 'Rules'
  });
};

exports.about = (req, res) => {
  res.render('about', {
    title: 'About'
  });
};