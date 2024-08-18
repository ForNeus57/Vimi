import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModelStructure } from '../../model/model/model';

@Injectable({
  providedIn: 'root'
})
export class ModelCompositionService {
    private modelStructure = new BehaviorSubject<ModelStructure | null>(null);

    public constructor() {}

    public getModelStructure() {
        return this.modelStructure.asObservable();
    }

    public setModelStructure(modelStructure: ModelStructure) {
        this.modelStructure.next(modelStructure);
    }
}
