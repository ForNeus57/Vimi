export class Architecture {
  constructor(
    public uuid: string,
    public name: string,
    public layers: Array<string>,
    public dimensions: Array<Array<number>>,
  ) {
  }
}