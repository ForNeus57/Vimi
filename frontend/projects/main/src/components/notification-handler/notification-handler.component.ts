import {Component, OnDestroy, OnInit} from '@angular/core';
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {NgClass, NgStyle} from "@angular/common";
import {trigger, style, animate, transition} from '@angular/animations';

import {Notification} from "../../models/notification";
import {filter, Subject, takeUntil} from "rxjs";

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
export class NotificationHandlerComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  public readonly timeoutMiliSeconds = 5000;
  public notifications: Array<Notification> = [];

  constructor(
    private notificationHandler: NotificationHandlerService,
  ) {
  }

  ngOnInit() {
    this.notificationHandler.getNotificationObservable()
      .pipe(
        filter(notification => notification != null),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe(notification => {
        this.addNotification(notification);
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public addNotification(notification: Notification) {
    this.notifications.push(notification);

    setTimeout(() => {
        this.removeNotification(notification);
      },
      this.timeoutMiliSeconds,
    );
  }

  public removeNotification(notification: Notification) {
    let index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }
}
