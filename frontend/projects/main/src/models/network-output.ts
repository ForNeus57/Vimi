export interface NetworkOutput {
  id: string,
  filters_shape: Array<number>,
}

export class NetworkOutputRequestData {
  constructor(
    public architecture: number,
    public network_input: string,
    public layer_index: number,
    public normalization_method: string,
  ) {
  }
}