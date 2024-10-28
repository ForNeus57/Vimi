export interface NetworkOutput {
  output: number[][][][];
}

export class NetworkOutputRequestData {
  constructor(
    public architecture: number,
    public file: string,
    public color_map: number,
    public layer_index: number,
  ) {
  }
}