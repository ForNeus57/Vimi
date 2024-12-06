import {Prediction} from "./network-output";

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

export interface Metrics {
  mse: string;
  mae: string;
}

export interface ActivationComparatorResults {
  image0: string;
  image1: string;
  classes0: Array<Prediction>;
  classes1: Array<Prediction>;
  metrics: Metrics;
  indicator: string;
}

export class ActivationComparatorEndpointData {
  public constructor(
    public first_activation: string,
    public second_activation: string,
    public filter_index: number,
    public normalization: string,
    public color_map: string,
  ) {
  }
}