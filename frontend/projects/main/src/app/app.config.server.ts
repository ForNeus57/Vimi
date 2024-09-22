import {mergeApplicationConfig, ApplicationConfig} from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import { appConfig } from './app.config';

import {authenticationInterceptor} from "../interceptors/authentication/authentication.interceptor";

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(
      withInterceptors([
        authenticationInterceptor,
      ]),
    ),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
