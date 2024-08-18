import { Component } from '@angular/core';
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent {
    constructor(
        private notificationHandler: NotificationHandlerService,
    ) {}

    public onSuccess() {
        this.notificationHandler.handleSuccess('Success');
    }

    public onInfo() {
        this.notificationHandler.handleInfo('Info');
    }

    public onWarning() {
        this.notificationHandler.handleWarning('Warning');
    }

    public onError() {
        this.notificationHandler.handleError(new Error('Error'));
    }
}
