import {ErrorHandler, Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

import {Notification, NotificationType} from "../../models/notification";

@Injectable({
  providedIn: 'root',
})
export class NotificationHandlerService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);

  public constructor(
  ) {
  }

  public handleSuccess(success: string) {
    console.info(success);
    this.notificationSubject.next(new Notification(NotificationType.Success, success));
  }

  public handleError(error: Error) {
    console.error(error);
    this.notificationSubject.next(new Notification(NotificationType.Error, error.message));
  }

  public handleWarning(warning: string) {
    console.warn(warning);
    this.notificationSubject.next(new Notification(NotificationType.Warning, warning));
  }

  public handleInfo(info: string) {
    console.log(info);
    this.notificationSubject.next(new Notification(NotificationType.Info, info));
  }

  public getNotificationObservable() {
    return this.notificationSubject.asObservable();
  }
}
