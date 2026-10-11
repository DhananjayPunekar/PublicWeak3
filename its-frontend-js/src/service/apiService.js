/**
 * Helper shared by every service.
 * Turns an axios error into a message that can be shown to the user.
 */
export function getErrorMessage(error) {
  // The server answered with an error status (400, 401, 404, 409, 500 ...)
  if (error.response) {
    const body = error.response.data;
    if (body && body.message) {
      // Validation errors from the back end also list each field's message
      const details = body.fieldErrors ? Object.values(body.fieldErrors) : [];
      return details.length > 0 ? `${body.message}: ${details.join('; ')}` : body.message;
    }
    return `Request failed with status ${error.response.status}`;
  }
  // No answer at all: server not running, wrong port, or blocked by the browser (CORS)
  return 'Unable to reach the server. Please check that the API gateway is running and "proxy" in package.json points to it.';
}
