export class Notification {
    public constructor(
        public type: NotificationType,
        public message: string,
    ) {
    }

    public getClass(): string {
        switch (this.type) {
            case NotificationType.Success:
                return 'notification-success';
            case NotificationType.Error:
                return 'notification-error';
            case NotificationType.Warning:
                return 'notification-warning';
            case NotificationType.Info:
                return 'notification-info';
        }
    }


    public getIcon(): string {
        switch (this.type) {
            case NotificationType.Success:
                return 'check-circle-fill';
            case NotificationType.Error:
                return 'exclamation-circle-fill';
            case NotificationType.Warning:
                return 'exclamation-triangle-fill';
            case NotificationType.Info:
                return 'info-circle-fill';
        }
    }
}

export enum NotificationType {
    Success,
    Error,
    Warning,
    Info
}