import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { retry } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
  private readonly backendUrl = 'http://localhost:8000/';
  private readonly retryCount = 3;

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  public get<T>(url: string, params: any = {}) {
    return this.httpClient.get<T>(new URL(url, this.backendUrl).href, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public post<T>(url: string, body: any, params: any = {}) {
    return this.httpClient.post<T>(new URL(url, this.backendUrl).href, body, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public put<T>(url: string, body: any, params: any = {}) {
    return this.httpClient.put<T>(new URL(url, this.backendUrl).href, body, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public delete<T>(url: string, params: any = {}) {
    return this.httpClient.delete<T>(new URL(url, this.backendUrl).href, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public head<T>(url: string, params: any = {}) {
    return this.httpClient.head<T>(new URL(url, this.backendUrl).href, {params}).pipe(
      retry(this.retryCount),
    );
  }

  public options<T>(url: string, params: any = {}) {
    return this.httpClient.options<T>(new URL(url, this.backendUrl).href, {params}).pipe(
      retry(this.retryCount),
    );
  }
}
