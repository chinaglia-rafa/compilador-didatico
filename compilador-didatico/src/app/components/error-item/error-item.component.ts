import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { Error } from '../../services/errors/errors.service';

@Component({
  selector: 'error-item',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './error-item.component.html',
  styleUrl: './error-item.component.scss',
})
export class ErrorItemComponent {
  @Input('error') error: Error;
}
