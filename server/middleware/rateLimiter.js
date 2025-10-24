import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per window
  message: { message: "Too many requests from this IP, please try again later." },
});

export default rateLimiter;
