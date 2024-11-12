export interface NetworkOutput {
  activation_uuid: string,
  layer_uuid: string,
}

export class NetworkOutputRequestData {
  constructor(
    public architecture: string,
    public network_input: string,
    public transformation: string,
    public layers: Array<string>,
  ) {
  }
}