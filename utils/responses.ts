function createErrorResponse(
  statusCode: number,
  message: string,
  error: unknown
) {
  return {
    success: false,
    statusCode,
    message,
    error: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
  };
}

function createSuccessResponse(message: string, data: unknown = null) {
  return {
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

const ErrorResponses = {
  notFound: (resource: string = "resource") =>
    createErrorResponse(404, `${resource} not found`, new Error("Not Found")),
  badRequest: (message: string) =>
    createErrorResponse(400, message, new Error("Bad Request")),
  unauthorized: (message: string = "Unauthorized access.") =>
    createErrorResponse(401, message, new Error("Unauthorized")),
  alreadyExists: (resource: string) =>
    createErrorResponse(
      409,
      `${resource} already exists`,
      new Error("Conflict")
    ),
  serverError: (message: string = "Internal server error") =>
    createErrorResponse(500, message, new Error("Internal Server Error")),
  forbidden: (message: string = "Forbidden") =>
    createErrorResponse(403, message, new Error("Forbidden")),
  validationError: (errors: string[]) =>
    createErrorResponse(
      422,
      "Validation error",
      new Error(`Validation failed: ${errors.join(", ")}`)
    ),
  tooManyRequests: (message: string = "Too many requests") =>
    createErrorResponse(429, message, new Error("Too Many Requests")),
};

const SuccessResponses = {
  success: (message: string, data: unknown = null) =>
    createSuccessResponse(message, data),
  created: (message: string, data: unknown = null) =>
    createSuccessResponse(message, data),
  updated: (message: string, data: unknown = null) =>
    createSuccessResponse(message, data),
  deleted: (message: string) => createSuccessResponse(message),
  accepted: (message: string, data: unknown = null) =>
    createSuccessResponse(message, data),
  noContent: () => createSuccessResponse("No content"),
};

export {
  ErrorResponses,
  SuccessResponses,
  createErrorResponse,
  createSuccessResponse,
};
