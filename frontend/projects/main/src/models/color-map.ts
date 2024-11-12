export class ColorMap {
  constructor(
    public uuid: string,
    public name: string,
  ) {
  }
}

export class ColorMapRequestData {
  constructor(
    public activation: string,
    public color_map: string,
    public normalization: string,
  ) {
  }
}

export interface ColorMapProcessOutput {
  urls: string[][],
  shape: number[]
}

export class ImageSet {
  constructor(
    public textureUrls: string[][],
    // TODO: Make mode an enum
    public shape: Array<number>,
    public mode: string,
  ) {
  }
}
