// MIDDLEWARE D'AUTHENTIFICATION
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    req.auth = { userId }; // Vérifie l'id de l'utilisateur
    if (req.body.userId && req.body.userId !== userId) {
      res.status(401).json({
        error: new Error('Invalid user ID !')
      });
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};