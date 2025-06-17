const jwt = require('jsonwebtoken');

module.exports =(req, res, next) => {
  const token = req.cookies?.token ;
// console.log(token,"token")
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is not valid' });
  }
};

