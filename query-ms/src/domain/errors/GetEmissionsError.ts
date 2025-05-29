export class GetEmissionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GetEmissionsError";
  }
}
