export interface NetworkOutput {
  id: string,
  filters_count: number,
}

export class NetworkOutputRequestData {
  constructor(
    public architecture: number,
    public file: string,
    public layer_index: number,
  ) {
  }
}