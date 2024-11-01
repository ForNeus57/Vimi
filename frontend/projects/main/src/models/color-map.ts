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
  ) {
  }
}

export interface ColorMapImage {
  activations: string,
  shape: number[],
}

export class ColorMapImageOrdered {
  constructor(
    public image: ColorMapImage,
    public order: number,
  ) {
  }
}