import { Component, Input } from '@angular/core';

@Component({
  selector: 'live-icon',
  standalone: true,
  imports: [],
  templateUrl: './live-icon.component.html',
  styleUrl: './live-icon.component.scss',
})
export class LiveIconComponent {
  @Input('icon') icon: string = '';
  @Input('active') active: boolean = false;
}
