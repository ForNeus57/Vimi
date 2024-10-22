import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ViewerControlService {

  private dimensionsToShow = new BehaviorSubject<number[][]>([]);

  constructor() {
  }

  setDimensions(newDimensions: number[][]) {
    console.log(newDimensions);
    this.dimensionsToShow.next(newDimensions);
  }

  getDimensionsObservable() {
    return this.dimensionsToShow.asObservable();
  }
}
