import {Component, OnInit} from '@angular/core';
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {NgClass, NgStyle} from "@angular/common";
import {trigger, state, style, animate, transition} from '@angular/animations';

import {Notification} from "../../models/notification";

@Component({
  selector: 'app-notification-handler',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
  ],
  templateUrl: './notification-handler.component.html',
  styleUrl: './notification-handler.component.css',
  animations: [
    trigger('notificationFade', [
      transition(':enter', [
        style({opacity: 0}),
        animate('0.3s ease', style({opacity: 1}))
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('0.3s ease', style({opacity: 0}))
      ])
    ])
  ],
})
export class NotificationHandlerComponent implements OnInit {
  public readonly timeoutMiliSeconds = 5000;
  public notifications: Array<Notification> = [];

  public constructor(
    private notificationHandler: NotificationHandlerService,
  ) {}

  public ngOnInit() {
    this.notificationHandler.getNotificationObservable().subscribe(notification => {
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
    }, this.timeoutMiliSeconds);
  }

  public removeNotification(notification: Notification) {
    let index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }
}
