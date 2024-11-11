export interface NetworkOutput {
  uuid: string,
}

export class NetworkOutputRequestData {
  constructor(
    public architecture: string,
    public layer_index: number,
    public network_input: string,
    public normalization: string,
  ) {
  }
}