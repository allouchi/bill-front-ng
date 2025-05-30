export class CustomError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = message;
    this.code = code;
  }
}
