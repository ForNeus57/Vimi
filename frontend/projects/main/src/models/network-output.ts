export interface NetworkOutput {
  predictions: Prediction[];
  activations: Activation[];
}

export interface Activation {
  activation_uuid: string;
  layer_uuid: string;
}

export interface Prediction {
  prediction_number: number;
  info: string;
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