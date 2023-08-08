export class ApiCallError extends Error {
  name = 'ApiCallError';
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response
  }
}

export class InvalidAuthError extends ApiCallError {
  name = 'InvalidAuthError';
}

