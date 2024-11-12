export class CalculatePayload {
  constructor(
    public fileUUID: string,
    public transformationId: string,
  ) {
  }
}