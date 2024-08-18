import {Component, HostListener, OnInit} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {NavigationService} from "../../services/navigation/navigation.service";
import {NavbarElement} from "../../model/navbarElements";

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
    public navigationElements: Array<NavbarElement> = [];

    constructor(
        private navigationService: NavigationService,
    ) {}

    ngOnInit() {
        this.navigationService.getAllowedRoutes().subscribe(allowedRoutes => {
            this.navigationElements = allowedRoutes.map(route => {
                return new NavbarElement(
                    route.replace('/', ' ').replace('-', ' ').trim(),
                    route,
                    this.mapRouteToIcon(route),
                );
            });
        });
    }

    public mapRouteToIcon(route: string) {
        switch (route) {
            case '/home':
                return 'house-fill';
            case '/account':
                return 'person-fill';
            case '/model-manager':
                return 'folder-fill';
            case '/editor':
                return 'pencil-fill';
            case '/settings':
                return 'gear-fill';

            default:
                return 'question-circle-fill';
        }
    }
}
