import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      req.user = {
        _id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name
      };
      
      if (!req.user._id) {
        return res.status(401).json({ message: 'Not authorized, invalid token payload' });
      }
      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Access denied. Role: '${req.user ? req.user.role : 'none'}' is not authorized` });
    }
  };
};
