import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import '@material/web/button/filled-button';
import '@material/web/icon/icon';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sobre.component.html',
  styleUrl: './sobre.component.scss',
})
export class SobreComponent {}
