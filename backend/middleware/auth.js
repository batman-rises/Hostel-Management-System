// backend/middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * authenticateToken supports both:
 *   - router.get('/me', authenticateToken, handler)
 *   - router.get('/', authenticateToken('admin'), handler)
 *
 * It returns a middleware when called as a factory, and also
 * works if Express calls it directly: authenticateToken(req,res,next).
 *
 * This version has debug logs so we can see how it is being invoked.
 */

function createMiddleware(requiredRole) {
  return function (req, res, next) {
    console.log(
      "AUTH middleware invoked for",
      req.method,
      req.url,
      "requiredRole=",
      requiredRole
    );
    const header = req?.headers?.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      console.log("AUTH: no token header");
      return res.status(401).json({ message: "Missing token" });
    }
    const token = header.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("AUTH OK:", decoded);
      req.user = decoded;
      if (requiredRole && decoded.role !== requiredRole) {
        console.log("AUTH: role mismatch", decoded.role, "!==", requiredRole);
        return res.status(403).json({ message: "Forbidden" });
      }
      return next();
    } catch (err) {
      console.log("AUTH ERROR verify:", err?.message || err);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

export function authenticateToken(arg) {
  // If called with a string or undefined -> return factory middleware
  if (typeof arg === "string" || typeof arg === "undefined") {
    console.log("AUTH factory called with", arg);
    return createMiddleware(arg);
  }

  // Otherwise Express probably invoked it directly: authenticateToken(req,res,next)
  // arg is actually req
  const req = arg;
  const res = arguments[1];
  const next = arguments[2];
  console.log("AUTH direct-call detected for", req?.method, req?.url);
  const header = req?.headers?.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    console.log("AUTH: no token header (direct)");
    return res.status(401).json({ message: "Missing token" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.log("AUTH ERROR verify (direct):", err?.message || err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
