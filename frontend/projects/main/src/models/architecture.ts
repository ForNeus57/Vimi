import {Layer} from "./layer";

export interface Architecture {
  uuid: string,
  name: string,
  layers: Array<Layer>,
}