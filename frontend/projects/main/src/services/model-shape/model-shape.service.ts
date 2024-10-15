import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModelShapeService {
  modelShape = new BehaviorSubject<Array<Array<number>>>([]);

  constructor() { }
}
