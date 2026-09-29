import ApiError from "../utils/ApiError.js";

export const notFoundHandler = (request, _response, next) =>
  next(new ApiError(404, "Route not found"));

export const errorHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    error = new ApiError(400, "Request body must contain valid JSON");
  } else if (error.type === "entity.too.large") {
    error = new ApiError(413, "Request body must not exceed 10kb");
  }

  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status)
      ? error.status
      : 500;
  const message = error instanceof ApiError || statusCode < 500
    ? error.message
    : "Internal server error";

  if (statusCode >= 500) {
    console.error(error);
  }

  return response.status(statusCode).json({
    success: false,
    message,
  });
};