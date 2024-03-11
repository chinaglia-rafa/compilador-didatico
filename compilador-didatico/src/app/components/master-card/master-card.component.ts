import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
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
  /** Título do card */
  @Input('title') title: string = '';
  /** Subtítulo do card */
  @Input('subhead') subhead: string = '';
  /** Texto do botão de ação do card. Se estiver vazio, nenhum botão será exibido. */
  @Input('action') action: string = '';
  /** Nome do ícone a ser exibido */
  @Input('icon') icon: string = '';
  /** Lista de itens no formato MasterCardItem[] para serem exibidos na parte inferior do card */
  @Input('items') items: MasterCardItem[] = [];
  /** Evento quando o card é clicado */
  @Output('select') selectEmitter = new EventEmitter<MouseEvent>();
  /** Evento quando o botão de ação é clicado */
  @Output('actionClick') actionClickEmitter = new EventEmitter<MouseEvent>();

  /** Controla o estado de carregamento do componente */
  protected loading = false;
  /** Controla o estado de seleção do componente */
  protected selected = false;

  /**
   * Função chamada ao clicar no componente
   *
   * @param event Evento de clique do Angular
   */
  clicked(event: MouseEvent): void {
    console.log('click!');
    this.selectEmitter.emit(event);
  }

  /**
   * Função chamada ao clicar no botão de ação do componente
   *
   * @param event Evento de clique do Angular
   */
  actionClick(event: MouseEvent): void {
    console.log('action click!');
    event.stopPropagation();
    this.actionClickEmitter.emit(event);
  }

  /**
   * Alterna o estado do componente para "carregando...", modificando o ícone
   */
  toggleLoading(): void {
    this.loading = !this.loading;
  }

  /**
   * Alterna o estado do componente para "selecionado"
   */
  toggle(): void {
    this.selected = !this.selected;
  }

  /**
   * Atribui valor para selected
   * @param state Valor a ser atribuído
   */
  setSelected(state: boolean): void {
    this.selected = state;
  }
}