import { FileMessageResponse, isErrorFileMessage, isCorrectFileMessage } from './model/file_message';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, retry, throwError } from 'rxjs';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    public static readonly fileNotFoundStatus = 'No file uploaded';

    public fileStatus: string;
    public http: HttpClient;

    public constructor(http: HttpClient) {
        this.http = http;
        this.fileStatus = AppComponent.fileNotFoundStatus;
    }

    public onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files === null || input.files[0] === undefined) {
            this.fileStatus = AppComponent.fileNotFoundStatus;
            return;
        }

        const uploadedFile: File = input.files[0];

        this.fileStatus = uploadedFile.name;

        const formData = new FormData();
        formData.append('model', uploadedFile);

        this.http.post<FileMessageResponse>('http://localhost:5000/models/upload', formData)
            .pipe(
                retry(3),
                catchError((error: HttpErrorResponse) => {
                    // Temporary implement better logic in the future
                    if (error.error instanceof ErrorEvent) {
                        this.fileStatus = 'A client-side or network error occurred';
                        console.error(error.error);
                    } else if (isErrorFileMessage(error.error)) {
                        this.fileStatus = error.error.error;
                    }

                    return throwError(() => new Error('Error occurred while uploading the file'));
                }),
            )
            .subscribe((response: FileMessageResponse) => {
                if (isCorrectFileMessage(response)) {
                    console.log(response.model_size);
                    this.fileStatus = response.message;
                } else {
                    console.log(response);
                    throw new Error('Response is not of a correct schema');
                }
            });
    }
}
