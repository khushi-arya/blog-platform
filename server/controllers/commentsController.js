import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import { parsePagination } from "../utils/pagination.js";

export const listComments = async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.postId)) {
    return next(new ApiError(404, "Post not found"));
  }

  const { page, limit } = parsePagination(request.query, { defaultLimit: 20 });

  try {
    const post = await Post.findById(request.params.postId).select("_id");
    if (!post) {
      return next(new ApiError(404, "Post not found"));
    }

    const [comments, total] = await Promise.all([
      Comment.find({ post: post._id })
        .sort({ createdAt: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("author", "name")
        .lean(),
      Comment.countDocuments({ post: post._id }),
    ]);

    return response.json({
      success: true,
      data: comments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return next(new ApiError(500, "Unable to fetch comments"));
  }
};

export const createComment = async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.postId)) {
    return next(new ApiError(404, "Post not found"));
  }

  try {
    const post = await Post.findById(request.params.postId).select("_id");
    if (!post) {
      return next(new ApiError(404, "Post not found"));
    }

    const text = request.body?.text;
    if (typeof text !== "string" || !text.trim() || text.trim().length > 2000) {
      return next(new ApiError(400, "Comment text is required and must be at most 2000 characters"));
    }

    const comment = await Comment.create({
      text: text.trim(),
      post: post._id,
      author: request.user._id,
    });
    await comment.populate("author", "name");

    return response.status(201).json({ success: true, data: { comment } });
  } catch {
    return next(new ApiError(500, "Unable to create comment"));
  }
};

export const deleteComment = async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return next(new ApiError(404, "Comment not found"));
  }

  try {
    const comment = await Comment.findById(request.params.id);
    if (!comment) {
      return next(new ApiError(404, "Comment not found"));
    }

    if (!comment.author.equals(request.user._id)) {
      return next(new ApiError(403, "Forbidden"));
    }

    await comment.deleteOne();
    return response.json({
      success: true,
      data: { deleted: true, id: comment._id },
    });
  } catch {
    return next(new ApiError(500, "Unable to delete comment"));
  }
};