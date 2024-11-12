import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Architecture} from "../../models/architecture";
import {CalculatePayload} from "../../models/calculate-payload";
import {ApplyPayload} from "../../models/apply-payload";

@Injectable({
  providedIn: 'root'
})
export class ControlBarMediatorService {
  private readonly viewMode = new BehaviorSubject<string>("");
  private readonly architecture = new BehaviorSubject<Architecture | null>(null);
  private readonly calculatePayload = new BehaviorSubject<CalculatePayload | null>(null);
  private readonly applyPayload  = new BehaviorSubject<ApplyPayload | null>(null);
  private readonly indicator = new BehaviorSubject<string | null>(null);

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

  setCalculatePayload(newCalculatePayload: CalculatePayload) {
    this.calculatePayload.next(newCalculatePayload);
  }
  getCalculatePayloadObservable() {
    return this.calculatePayload.asObservable();
  }

  setApplyPayload(newApplyPayload: ApplyPayload) {
    this.applyPayload.next(newApplyPayload);
  }
  getApplyPayload() {
    return this.applyPayload.asObservable();
  }

  setIndicator(newIndicator: string) {
    this.indicator.next(newIndicator);
  }
  getIndicator() {
    return this.indicator.asObservable();
  }
}
