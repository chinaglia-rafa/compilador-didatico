import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import '@material/web/iconbutton/icon-button';
import '@material/web/icon/icon';
import '@material/web/ripple/ripple';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'navigation-rail',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './navigation-rail.component.html',
  styleUrl: './navigation-rail.component.scss',
})
export class NavigationRailComponent {
  items = [
    { name: 'Início', icon: 'home', destination: '/compiler' },
    { name: 'Sobre', icon: 'info', destination: '/sobre' },
  ];
}
