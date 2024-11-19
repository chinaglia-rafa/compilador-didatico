import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import '@material/web/button/filled-button';

@Component({
  selector: 'app-final-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './final-results.component.html',
  styleUrl: './final-results.component.scss',
})
export class FinalResultsComponent {}
