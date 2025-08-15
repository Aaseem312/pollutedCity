/**
 * Response middleware that adds success and error helper methods to response object
 * Provides consistent response format across the application
 */
export default function (req: Req, res: Res, next: Next) {
  res.success = (data = {}, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (message = 'Something went wrong', statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  };

  next();
}
