import {Component, OnInit} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { isErrorFileMessage, CorrectFileMessage } from '../../model/model/fileMessage';
import { ModelCompositionService } from '../../services/model-compositions/model-composition.service';
import {ConfigService} from "../../services/config/config.service";

@Component({
    selector: 'app-file-manager',
    standalone: true,
    imports: [],
    templateUrl: './file-manager.component.html',
    styleUrl: './file-manager.component.css'
})
export class FileManagerComponent implements OnInit {
    public fileStatus = 'Upload your model';
    public maxModelSize = 0;
    public acceptableExtensions = '';

    constructor(
        private http: HttpClient,
        private configService: ConfigService,
        private modelCompositionService: ModelCompositionService,
    ) {}

    ngOnInit() {
        this.configService.getModelUploadConfig().subscribe(config => {
            this.acceptableExtensions = config.modelAllowedExtensions.join(',');
            this.maxModelSize = config.maxModelSize;
        });
    }

    public onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files === null || input.files[0] === undefined) {
            this.fileStatus = 'Upload your model';
            return;
        }

        const uploadedFile: File = input.files[0];

        if (uploadedFile.size > this.maxModelSize) {
            this.fileStatus = 'Model size exceeds the limit';
            return;
        }
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
                this.modelCompositionService.setModelStructure(response.model_size);
            });
    }
}
