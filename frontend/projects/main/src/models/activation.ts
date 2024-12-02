export class Activation {
  public constructor(
    public uuid: string,
    public presentation_name: string,
  ) {
  }
}

export interface ActivationFromLayerEndpoint {
  filter_number: number;
  activations: Array<Activation>;
}

export class ActivationFromLayer {
  public constructor(
    public filter_number: Array<number>,
    public activations: Array<Activation>,
  ) {
  }
}