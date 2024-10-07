import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

import {Notification, NotificationType} from "../../models/notification";

@Injectable({
  providedIn: 'root',
})
export class NotificationHandlerService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);

  public success(success: string) {
    console.info(success);
    this.notificationSubject.next(new Notification(NotificationType.Success, success));
  }

  public error(error: Error | string) {
    console.error(error);
    if (error instanceof Error) {
      error = error.message;
    }
    this.notificationSubject.next(new Notification(NotificationType.Error, error));
  }

  public warning(warning: string) {
    console.warn(warning);
    this.notificationSubject.next(new Notification(NotificationType.Warning, warning));
  }

  public info(info: string) {
    console.log(info);
    this.notificationSubject.next(new Notification(NotificationType.Info, info));
  }

  public getNotificationObservable() {
    return this.notificationSubject.asObservable();
  }
}
