import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import { parsePagination } from "../utils/pagination.js";

const pageNumberMaximum = 1000;

const validText = (value, maximumLength, trim = false) => {
  if (typeof value !== "string") return false;
  const checkedValue = trim ? value.trim() : value;
  return checkedValue.length > 0 && checkedValue.length <= maximumLength;
};

const findPostOrThrowNotFound = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, "Post not found");
  }

  const post = await Post.findById(id);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return post;
};

const isAuthor = (post, user) => post.author.equals(user._id);

export const listPosts = async (request, response, next) => {
  const { page, limit } = parsePagination(request.query, { defaultLimit: 10 });

  if (page > pageNumberMaximum) {
    return response.status(400).json({
      success: false,
      message: "Page out of range",
    });
  }

  try {
    const [posts, totalPosts] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("author", "name"),
      Post.countDocuments(),
    ]);

    return response.json({
      success: true,
      data: posts,
      meta: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch {
    return next(new ApiError(500, "Unable to fetch posts"));
  }
};

export const getPost = async (request, response, next) => {
  try {
    const post = await findPostOrThrowNotFound(request.params.id);
    await post.populate("author", "name");
    return response.json({ success: true, data: { post } });
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(500, "Unable to fetch post"));
  }
};

export const createPost = async (request, response, next) => {
  const { title, content } = request.body ?? {};
  if (!validText(title, 200, true) || !validText(content, 50000)) {
    return next(new ApiError(400, "A title and content are required"));
  }

  try {
    const post = await Post.create({
      title: title.trim(),
      content,
      author: request.user._id,
    });
    await post.populate("author", "name");
    return response.status(201).json({ success: true, data: { post } });
  } catch {
    return next(new ApiError(500, "Unable to create post"));
  }
};

export const updatePost = async (request, response, next) => {
  try {
    const post = await findPostOrThrowNotFound(request.params.id);

    if (!isAuthor(post, request.user)) {
      return next(new ApiError(403, "Forbidden"));
    }

    const { title, content } = request.body ?? {};
    const updates = {};

    if (Object.hasOwn(request.body ?? {}, "title")) {
      if (!validText(title, 200, true)) {
        return next(new ApiError(400, "Title must be between 1 and 200 characters"));
      }
      updates.title = title.trim();
    }

    if (Object.hasOwn(request.body ?? {}, "content")) {
      if (!validText(content, 50000)) {
        return next(new ApiError(400, "Content must be between 1 and 50000 characters"));
      }
      updates.content = content;
    }

    if (Object.keys(updates).length === 0) {
      return next(new ApiError(400, "Provide a title or content to update"));
    }

    Object.assign(post, updates);
    await post.save();
    await post.populate("author", "name");
    return response.json({ success: true, data: { post } });
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(500, "Unable to update post"));
  }
};

export const deletePost = async (request, response, next) => {
  try {
    const post = await findPostOrThrowNotFound(request.params.id);

    if (!isAuthor(post, request.user)) {
      return next(new ApiError(403, "Forbidden"));
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Comment.deleteMany({ post: post._id }).session(session);
        await Post.deleteOne({ _id: post._id }).session(session);
      });
    } catch (error) {
      if (error.code === 20 && /transaction numbers are only allowed on a replica set member or mongos/i.test(error.message)) {
        throw new ApiError(500, "Post deletion requires MongoDB transactions");
      }

      throw error;
    } finally {
      await session.endSession();
    }

    return response.json({ success: true, data: { deleted: true, id: post._id } });
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(500, "Unable to delete post"));
  }
};