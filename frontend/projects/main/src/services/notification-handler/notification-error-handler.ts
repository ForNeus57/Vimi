import {ErrorHandler, inject} from "@angular/core";
import {NotificationHandlerService} from "./notification-handler.service";

export class NotificationErrorHandler implements ErrorHandler {
  private notificationHandler = inject(NotificationHandlerService);

  public constructor(
  ) {
  }

  public handleError(error: Error) {
    this.notificationHandler.handleError(error);
  }
}