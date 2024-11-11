import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ControlBarMediatorService {
  private readonly viewMode = new BehaviorSubject<string>("");

  constructor() {}

  public setViewMode(newViewMode: string) {
    this.viewMode.next(newViewMode);
  }

  public getViewModeObservable() {
    return this.viewMode.asObservable();
  }
}
