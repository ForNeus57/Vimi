export interface NetworkOutput {
  id: string,
  filters_shape: Array<number>,
}

export class NetworkOutputRequestData {
  constructor(
    public architecture: string,
    public layer_index: number,
    public network_input: string,
    public normalization: number,
  ) {
  }
}