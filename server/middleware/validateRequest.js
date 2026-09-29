import { body, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const rejectUnknownFields = (allowedFields) =>
  body().custom((_value, { req }) => {
    const unknownFields = Object.keys(req.body ?? {}).filter(
      (field) => !allowedFields.includes(field),
    );

    if (unknownFields.length > 0) {
      throw new Error(`Unexpected field: ${unknownFields[0]}`);
    }

    return true;
  });

const validateRequest = (request, _response, next) => {
  const errors = validationResult(request).array();
  if (errors.length > 0) {
    return next(new ApiError(400, errors.map((error) => error.msg).join("; ")));
  }

  return next();
};

export default validateRequest;