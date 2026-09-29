import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import authenticate from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

const emailValidation = body("email")
	.isString()
	.withMessage("Email must be text")
	.bail()
	.trim()
	.isEmail()
	.withMessage("Email must be a valid email address")
	.bail()
	.isLength({ max: 254 })
	.withMessage("Email must be at most 254 characters")
	.normalizeEmail();

router.post(
	"/register",
	body("name")
		.isString()
		.withMessage("Name must be text")
		.bail()
		.trim()
		.notEmpty()
		.withMessage("Name is required")
		.bail()
		.isLength({ max: 100 })
		.withMessage("Name must be at most 100 characters"),
	emailValidation,
	body("password")
		.isString()
		.withMessage("Password must be text")
		.bail()
		.custom((password) =>
			password.length >= 8 &&
			/\p{L}/u.test(password) &&
			/\d/.test(password) &&
			Buffer.byteLength(password, "utf8") <= 72,
		)
		.withMessage("Password must be at least 8 characters, at most 72 bytes, and include a letter and a number"),
	validateRequest,
	register,
);

router.post(
	"/login",
	emailValidation,
	body("password")
		.isString()
		.withMessage("Password must be text")
		.bail()
		.isLength({ min: 1 })
		.withMessage("Password is required")
		.bail()
		.custom((password) => Buffer.byteLength(password, "utf8") <= 72)
		.withMessage("Password must not exceed 72 bytes"),
	validateRequest,
	login,
);
router.get("/me", authenticate, me);

export default router;