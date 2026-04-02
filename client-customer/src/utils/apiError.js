function getApiErrorMessage(
  error,
  fallbackMessage = "Request failed. Please try again."
) {
  if (
    error &&
    error.response &&
    error.response.data &&
    error.response.data.message
  ) {
    return error.response.data.message;
  }

  if (!error || !error.response) {
    return "Cannot connect to the server. Please make sure the backend is running.";
  }

  return fallbackMessage;
}

export default getApiErrorMessage;
