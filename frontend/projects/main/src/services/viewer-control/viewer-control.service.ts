import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ViewerControlService {
  private dimensionsToShow = new BehaviorSubject<number[][] | number[][][]>([]);

  constructor(
  ) {
  }

  setDimensions(newDimensions: number[][] | number[][][]) {
    this.dimensionsToShow.next(newDimensions);
  }

  getDimensionsObservable() {
    return this.dimensionsToShow.asObservable();
  }
}
