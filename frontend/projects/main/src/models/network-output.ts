export interface NetworkOutput {
  activations: Activation[];
}

export interface Activation {
  id: string,
  order: number,
}

export class NetworkOutputRequestData {
  constructor(
    public architecture: number,
    public file: string,
    public layer_index: number,
  ) {
  }
}