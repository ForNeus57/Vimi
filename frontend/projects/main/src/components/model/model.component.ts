import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Architecture} from "../../models/architecture";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Router} from "@angular/router";
import {throwError} from "rxjs";

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './model.component.html',
  styleUrl: './model.component.scss'
})
export class ModelComponent implements OnInit {
  private readonly availableModelArchitecturesUrl = '/api/1/architecture/';
  private readonly getModelDimensionsUrl = '/api/1/model/dimensions/';

  availableModelArchitectures: Architecture[] = [];

  modelForm = new FormGroup({
    architecture: new FormControl<number>(0),
  });
  file: File | null = null;

  constructor(
    private router: Router,
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
  ) {
  }

  ngOnInit() {
    this.dataLayer.get<Architecture[]>(this.availableModelArchitecturesUrl).subscribe(
      architectures => {
        this.availableModelArchitectures = architectures;
      },
      error => {
        if (error.error instanceof Error) {
          this.notificationHandler.error(`Network related error: ${error.error.message}`);
        } else {
          this.notificationHandler.error(`Server related error: ${error.message}`);
        }
        throw error;
      }
    );
  }

  onFileAdded(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.file = file;
    }
  }

  onSubmit() {
    if (this.file
        // && this.modelForm.value.architecture
        // && this.modelForm.value.architecture in this.availableModelArchitectures.map(architecture => architecture.name)
    ) {

      const formData = new FormData();

      formData.append('file', this.file, this.file.name);

      this.dataLayer.post<any>(this.getModelDimensionsUrl + this.modelForm.value.architecture?.toString() + '/', formData)
        .subscribe({
          next: data => {
            console.log(data);
          },
          error: (error: any) => {
            return throwError(() => error);
          },
        });
    }
  }
}
