import {Component, OnInit} from '@angular/core';
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Notification} from "../../model/notification";

@Component({
    selector: 'app-notification-handler',
    standalone: true,
    imports: [],
    templateUrl: './notification-handler.component.html',
    styleUrl: './notification-handler.component.css'
})
export class NotificationHandlerComponent implements OnInit {
    public notifications: Array<Notification> = [];

    constructor(
        private notificationHandlerService: NotificationHandlerService,
    ) {}

    public ngOnInit() {
        this.notificationHandlerService.getNotificationObservable().subscribe(notification => {
            if (notification === null) {
                return;
            }

            this.addNotification(notification);
        });
    }

    public addNotification(notification: Notification) {
        this.notifications.push(notification);

        setTimeout(() => {
            this.removeNotification(notification);
        }, 10000);
    }

    public removeNotification(notification: Notification) {
        let index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }
}
