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

export class ImageSet {
  constructor(
    public textures: TextureImage[],
    // TODO: Make mode an enum
    public mode: string,
  ) {
  }
}
export interface TextureImage {
  texture: string,
  shape: number[],
}