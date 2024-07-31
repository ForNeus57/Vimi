import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModelStructure } from '../../model/model';

@Injectable({
  providedIn: 'root'
})
export class ModelCompositionService {
    private modelStructure: BehaviorSubject<ModelStructure | null>;

    public constructor() {
        this.modelStructure = new BehaviorSubject<ModelStructure | null>(null);
    }

    public getModelStructure() {
        return this.modelStructure.asObservable();
    }

    public setModelStructure(modelStructure: ModelStructure) {
        this.modelStructure.next(modelStructure);
    }
}
