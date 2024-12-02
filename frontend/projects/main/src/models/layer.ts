import {ActivationFromLayer} from "./activation";

export interface Layer {
  uuid: string;
  layer_number: number;
  presentation_name: string;
  presentation_dimensions: string;
}

export class LayerWithMetadata {
  public constructor(
    public uuid: string,
    public layer_number: number,
    public presentation_name: string,
    public presentation_dimensions: string,
    public network_inputs: Array<ActivationFromLayer> = [],
    public showDetails: boolean = false,
  ) {
  }
}