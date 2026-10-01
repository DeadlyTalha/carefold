export enum ExitCodes {
  SUCCESS = 0,
  USER_ERROR = 1,
  INTERNAL_ERROR = 2
}

export class CliError extends Error {
  public exitCode: number;
  constructor(message: string, exitCode = ExitCodes.USER_ERROR) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}
