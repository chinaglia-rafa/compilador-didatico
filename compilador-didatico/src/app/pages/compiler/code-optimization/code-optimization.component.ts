import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import '@material/web/button/filled-button';

@Component({
  selector: 'app-code-optimization',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './code-optimization.component.html',
  styleUrl: './code-optimization.component.scss',
})
export class CodeOptimizationComponent {}
