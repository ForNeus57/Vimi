import { Injectable } from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
    private allowedRoutes = new BehaviorSubject<string[]>([]);

    constructor(
        private router: Router,
    ) {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            let paths: string[];
            switch (event.urlAfterRedirects) {
                default:
                    paths = ['/home', '/account', '/model-manager', '/editor', '/settings'];
                    break;
            }

            this.allowedRoutes.next(paths);
        });
    }

    public getAllowedRoutes(): BehaviorSubject<string[]> {
        return this.allowedRoutes;
    }
}