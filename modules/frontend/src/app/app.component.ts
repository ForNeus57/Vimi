import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    public static readonly fileNotFoundStatus = 'No file found';

    public fileStatus: string = AppComponent.fileNotFoundStatus;
    public constructor(private http: HttpClient) {}

    public onFileSelected(event: any): void {
        const uploadedFile: File = event.target.files[0];
        
        if (uploadedFile === undefined) {
            this.fileStatus = AppComponent.fileNotFoundStatus;
            return;
        }

        this.fileStatus = uploadedFile.name;
        const formData = new FormData();
        formData.append('model', uploadedFile);

        
    }
}
