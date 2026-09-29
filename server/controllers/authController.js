import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const invalidCredentialsMessage = "Invalid email or password";
const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required.");
  }

  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

export const register = async (request, response, next) => {
  const { name, email, password } = request.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, "Email already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return response.status(201).json({
      success: true,
      data: {
        token: createToken(user._id),
        user: safeUser(user),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "Email already registered"));
    }

    return next(new ApiError(500, "Unable to register right now"));
  }
};

export const login = async (request, response, next) => {
  const { email, password } = request.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    const passwordMatches = user && await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return next(new ApiError(401, invalidCredentialsMessage));
    }

    return response.json({
      success: true,
      data: {
        token: createToken(user._id),
        user: safeUser(user),
      },
    });
  } catch (error) {
    return next(new ApiError(500, "Unable to log in right now"));
  }
};

export const me = (request, response) =>
  response.json({ success: true, data: { user: safeUser(request.user) } });