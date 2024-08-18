import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, throwError} from "rxjs";
import {ModelConfig} from "../../model/model/modelConfig";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private modelUploadConfig = new BehaviorSubject<ModelConfig>(new ModelConfig(0, []));

    constructor(
        private http: HttpClient,
    ) {
        this.http.get<ModelConfig>('http://localhost:8000/api/config/frontend/').pipe(
            catchError(this.handleError)
        ).subscribe(response => {
            this.modelUploadConfig.next(
                new ModelConfig(response.maxModelSize, response.modelAllowedExtensions)
            );
        });
    }

    public getModelUploadConfig() {
        return this.modelUploadConfig.asObservable();
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(() => new Error(error.message || 'Server error'));
    }
}