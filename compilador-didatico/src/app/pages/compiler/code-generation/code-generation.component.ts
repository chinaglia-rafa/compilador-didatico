import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import '@material/web/button/filled-button';

@Component({
  selector: 'app-code-generation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './code-generation.component.html',
  styleUrl: './code-generation.component.scss',
})
export class CodeGenerationComponent {}
