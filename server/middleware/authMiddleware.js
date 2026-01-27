const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // 2. Remove "Bearer " if present
    const formattedToken = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;
    
    // 3. Verify token
    const decoded = jwt.verify(formattedToken, process.env.JWT_SECRET);

    // 4. Attach User Info to Request
    // Now every route has access to req.user.privilege and req.user.organizationId
    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};