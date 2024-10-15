export class Architecture {
  constructor(
    public id: number,
    public name: string,
    public layers: Array<string>,
    public dimensions: Array<Array<number>>,
  ) {
  }
}