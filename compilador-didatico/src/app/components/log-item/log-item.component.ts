import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { LogEntry } from '../../services/logger/logger.service';
import '@material/web/icon/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'log-item',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './log-item.component.html',
  styleUrl: './log-item.component.scss',
})
export class LogItemComponent {
  @Input('log') log: LogEntry = {
    text: '',
    level: 0,
    type: '',
    path: [],
  };
}
