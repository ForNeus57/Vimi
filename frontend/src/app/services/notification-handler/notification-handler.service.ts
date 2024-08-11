import {ErrorHandler, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Notification, NotificationType} from "../../model/notification";

@Injectable({
    providedIn: 'root'
})
export class NotificationHandlerService implements ErrorHandler {
    private notificationSubject: BehaviorSubject<Notification | null>;

    constructor() {
        this.notificationSubject = new BehaviorSubject<Notification | null>(null);
    }

    public handleSuccess(success: string): void {
        this.notificationSubject.next(new Notification(NotificationType.Success, success));
    }

    public handleError(error: Error): void {
        this.notificationSubject.next(new Notification(NotificationType.Error, error.message));
    }

    public handleWarning(warning: string): void {
        this.notificationSubject.next(new Notification(NotificationType.Warning, warning));
    }

    public handleInfo(info: string): void {
        this.notificationSubject.next(new Notification(NotificationType.Info, info));
    }

    public getNotificationObservable(): Observable<Notification | null> {
        return this.notificationSubject.asObservable();
    }
}
