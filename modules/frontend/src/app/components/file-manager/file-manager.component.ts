import { ModelCompositionService } from './../../services/model-compositions/model-composition.service';
import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { isErrorFileMessage, ExtensionsMessage, CorrectFileMessage } from '../../model/file_message';

@Component({
    selector: 'app-file-manager',
    standalone: true,
    imports: [],
    templateUrl: './file-manager.component.html',
    styleUrl: './file-manager.component.css'
})
export class FileManagerComponent {
    private http: HttpClient;
    private modelComposition: ModelCompositionService;
    public fileStatus: string;
    public acteptableExtentions: string;

    public constructor(http: HttpClient, ModelCompositionService: ModelCompositionService) {
        this.http = http;
        this.modelComposition = ModelCompositionService;
        this.fileStatus = 'Upload your model';
        this.acteptableExtentions = '';

        this.http.get<ExtensionsMessage>('http://localhost:5000/model/extension').subscribe(response => {
            this.acteptableExtentions = response.extension.join(',');
        });
    }

    public onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files === null || input.files[0] === undefined) {
            this.fileStatus = 'Upload your model';
            return;
        }

        const uploadedFile: File = input.files[0];
        this.fileStatus = uploadedFile.name;

        const formData = new FormData();
        formData.append('model', uploadedFile);

        this.http.post<CorrectFileMessage>('http://localhost:5000/model/upload', formData)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    // Temporary implement better logic in the future
                    if (error.error instanceof ErrorEvent) {
                        this.fileStatus = 'A client-side or network error occurred';
                        console.error(error.error);
                    } else if (isErrorFileMessage(error.error)) {
                        this.fileStatus = error.error.error;
                    }

                    return throwError(() => new Error('Error occurred while uploading the file'));
                })
            )
            .subscribe(response => {
                this.fileStatus = response.message;
                this.modelComposition.setModelStructure(response.model_size);
            });
    }
}
