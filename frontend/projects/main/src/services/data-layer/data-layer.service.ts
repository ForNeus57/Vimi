import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {retry} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
  private readonly backendUrl = 'http://127.0.0.1:8000/';
  private readonly retryCount = 3;

  constructor(
    private httpClient: HttpClient,
    // private notificationHandler: NotificationHandlerService,
  ) {
  }

  public get<T>(url: string, params: any = {}) {
    return this.httpClient.get<T>(new URL(url, this.backendUrl).href, {params}).pipe(
      retry(this.retryCount),
      // TODO: Handle only network related errors
      // catchError((error: ProgressEvent) => {
      //   this.notificationHandler.error('Network error occurred during handling of a HTTP request')
      //   throw
      // })
    );
  }

  public post<T>(url: string, body: any, params: any = {}) {
    return this.httpClient.post<T>(this.createBackendUrl(url).href, body, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public put<T>(url: string, body: any, params: any = {}) {
    return this.httpClient.put<T>(this.createBackendUrl(url).href, body, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public delete<T>(url: string, params: any = {}) {
    return this.httpClient.delete<T>(this.createBackendUrl(url).href, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public head<T>(url: string, params: any = {}) {
    return this.httpClient.head<T>(this.createBackendUrl(url).href, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public options<T>(url: string, params: any = {}) {
    return this.httpClient.options<T>(this.createBackendUrl(url).href, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public createBackendUrl(path: string) {
    return new URL(path, this.backendUrl);
  }
}
