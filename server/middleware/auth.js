import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const unauthorized = () => new ApiError(401, "Unauthorized");

const authenticate = async (request, response, next) => {
  const authorization = request.get("Authorization");
  const bearerMatch = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!bearerMatch) {
    return next(unauthorized());
  }

  let payload;
  try {
    payload = jwt.verify(bearerMatch[1], process.env.JWT_SECRET);
  } catch {
    return next(unauthorized());
  }

  if (!payload || typeof payload !== "object" || typeof payload.userId !== "string") {
    return next(unauthorized());
  }

  try {
    const user = await User.findById(payload.userId);
    if (!user) {
      return next(unauthorized());
    }

    request.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default authenticate;