export class ColorMap {
  constructor(
    public id: number,
    public name: string,
  ) {
  }
}

export class ColorMapRequestData {
  constructor(
    public activations: string,
    public color_map: number,
    public filter_index: number,
  ) {
  }
}

export interface ColorMapImage {
  activations: number[][][],
}