import {LayerWithMetadata} from "./layer";

export interface ArchitectureProcessedRequest {
  uuid: string;
  name: string;
  layer_count: number;
}

export class ArchitectureProcessed {
  constructor(
    public uuid: string,
    public name: string,
    public layer_count: number,
    public layers: Array<LayerWithMetadata> = [],
    public showDetails: boolean = false,
  ) {
  }
}