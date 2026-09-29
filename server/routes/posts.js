import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  updatePost,
} from "../controllers/postsController.js";
import authenticate from "../middleware/auth.js";
import validateRequest, { rejectUnknownFields } from "../middleware/validateRequest.js";

const router = Router();

router.get(
  "/",
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be an integer between 1 and 50")
    .toInt(),
  validateRequest,
  listPosts,
);
router.get("/:id", getPost);
router.post(
  "/",
  authenticate,
  rejectUnknownFields(["title", "content"]),
  body("title")
    .isString()
    .withMessage("Title must be text")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("content")
    .isString()
    .withMessage("Content must be text")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .bail()
    .isLength({ max: 50000 })
    .withMessage("Content must be at most 50000 characters"),
  validateRequest,
  createPost,
);
router.put(
  "/:id",
  authenticate,
  param("id").isMongoId().withMessage("Post id must be a valid Mongo ObjectId"),
  rejectUnknownFields(["title", "content"]),
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be text")
    .bail()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("content")
    .optional()
    .isString()
    .withMessage("Content must be text")
    .bail()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage("Content must be between 1 and 50000 characters"),
  validateRequest,
  updatePost,
);
router.delete(
  "/:id",
  authenticate,
  param("id").isMongoId().withMessage("Post id must be a valid Mongo ObjectId"),
  validateRequest,
  deletePost,
);

export default router;