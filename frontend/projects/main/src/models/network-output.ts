export interface NetworkOutput {
  output: number[][][];
}

export class NetworkOutputRequestData {
  constructor(
    public uuid: string,
    public architecture: number,
    public layer_index: number,
  ) {
  }
}