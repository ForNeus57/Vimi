import {Component, Input} from '@angular/core';
import {Notification, NotificationType} from "../../model/notification";

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.css'
})
export class NotificationComponent {
    @Input({ required: true }) public message!: Notification;

    constructor() {}

}
