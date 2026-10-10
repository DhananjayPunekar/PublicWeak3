/**
 * Small wrapper around fetch used by every service.
 * All requests go to relative URLs (/api/...), which the Vite dev server
 * forwards to the API Gateway (see vite.config.js).
 */

/** Builds a readable message from a failed response. */
function errorMessage(status, body) {
  if (body && body.message) {
    // Validation errors from the back end also list each field's message.
    const details = body.fieldErrors ? Object.values(body.fieldErrors) : [];
    return details.length > 0 ? `${body.message}: ${details.join('; ')}` : body.message;
  }
  if (status >= 500) {
    return `The server is not responding (HTTP ${status}). Please make sure the API gateway and services are running.`;
  }
  return `Request failed with status ${status}`;
}

/**
 * Sends a request and returns the JSON response.
 * Throws an Error with a user-friendly message when the call fails.
 */
async function request(method, url, body) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Unable to reach the server. Please check that the API gateway (port 8080) is running.');
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(errorMessage(response.status, data));
  }
  return data;
}

const apiService = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  patch: (url, body) => request('PATCH', url, body),
};

export default apiService;
