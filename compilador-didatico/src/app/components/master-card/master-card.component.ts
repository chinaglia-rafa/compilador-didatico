import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import '@material/web/button/text-button';
import { LiveIconComponent } from '../live-icon/live-icon.component';

/** Interface de cada item mostrado na parte inferior dos Cards */
export interface MasterCardItem {
  /** Etiqueta que dá nome ao item */
  label: string;
  /** Valor a ser exibido em tamanho grande */
  value: string;
  /**
   * Cor do item. As opções disponíveis são:
   * - default
   * - error
   * - success
   */
  color: string;
}

@Component({
  selector: 'master-card',
  standalone: true,
  imports: [CommonModule, LiveIconComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './master-card.component.html',
  styleUrl: './master-card.component.scss',
})
export class MasterCardComponent {
  @Input('title') title: string = '';
  @Input('subhead') subhead: string = '';
  @Input('action') action: string = '';
  @Input('icon') icon: string = '';
  @Input('items') items: MasterCardItem[] = [];

  active = false;
}
