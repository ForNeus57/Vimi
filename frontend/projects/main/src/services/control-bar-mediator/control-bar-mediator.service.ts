import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Architecture} from "../../models/architecture";

@Injectable({
  providedIn: 'root'
})
export class ControlBarMediatorService {
  private readonly viewMode = new BehaviorSubject<string>("");
  private readonly architecture = new BehaviorSubject<Architecture | null>(null);

  constructor() {}

  setViewMode(newViewMode: string) {
    this.viewMode.next(newViewMode);
  }

  getViewModeObservable() {
    return this.viewMode.asObservable();
  }

  setArchitecture(newArchitecture: Architecture | null) {
    this.architecture.next(newArchitecture);
  }

  getArchitectureObservable() {
    return this.architecture.asObservable();
  }

}
