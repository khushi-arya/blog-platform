import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createComment,
  deleteComment,
  listComments,
} from "../controllers/commentsController.js";
import authenticate from "../middleware/auth.js";
import validateRequest, { rejectUnknownFields } from "../middleware/validateRequest.js";

const router = Router();

router.get(
  "/posts/:postId/comments",
  param("postId").isMongoId().withMessage("Post id must be a valid Mongo ObjectId"),
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
  listComments,
);
router.post(
  "/posts/:postId/comments",
  authenticate,
  rejectUnknownFields(["text"]),
  body("text")
    .isString()
    .withMessage("Comment text must be text")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .bail()
    .isLength({ max: 2000 })
    .withMessage("Comment text must be at most 2000 characters"),
  validateRequest,
  createComment,
);
router.delete(
  "/comments/:id",
  authenticate,
  param("id").isMongoId().withMessage("Comment id must be a valid Mongo ObjectId"),
  validateRequest,
  deleteComment,
);

export default router;