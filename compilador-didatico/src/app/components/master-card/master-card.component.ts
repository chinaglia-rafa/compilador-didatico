import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import '@material/web/button/text-button';
import '@material/web/iconbutton/filled-tonal-icon-button';
import '@material/web/iconbutton/filled-icon-button';
import '@material/web/iconbutton/icon-button';
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
  /** Indica se o item deve estar visível ou não na interface */
  visible?: boolean;
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
  /** Título do sublink */
  @Input('sublink-title') sublinlkTitle: string = '';
  /** Subtítulo do card */
  @Input('subhead') subhead: string = '';
  /** Texto do botão de ação do card. Se estiver vazio, nenhum botão será exibido. */
  @Input('action') action: string = '';
  /** Nome do ícone a ser exibido */
  @Input('icon') icon: string = '';
  /** Lista de itens no formato MasterCardItem[] para serem exibidos na parte inferior do card */
  @Input('items') items: MasterCardItem[] = [];
  /** Ícone do botão de sub-link */
  @Input('sublink-button') sublinkButton: string = '';
  /** Evento quando o card é clicado */
  @Output('select') selectEmitter = new EventEmitter<MouseEvent>();
  /** Evento quando o botão de ação é clicado */
  @Output('actionClick') actionClickEmitter = new EventEmitter<MouseEvent>();
  @Output('sublinkClick') sublinkClickEmitter = new EventEmitter<MouseEvent>();

  /** Controla o estado de carregamento do componente */
  protected loading = false;
  /** Controla o estado de seleção do componente */
  protected selected = false;
  /** Controla o estado de seleção do subitem do componente */
  protected sublinkSelected = false;

  /**
   * Função chamada ao clicar no componente
   *
   * @param event Evento de clique do Angular
   */
  clicked(event: MouseEvent): void {
    this.selectEmitter.emit(event);
  }

  /**
   * Função chamada ao clicar no botão de ação do componente
   *
   * @param event Evento de clique do Angular
   */
  actionClick(event: MouseEvent): void {
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
   * Seta o valor de loading para true, alterando o ícone para "carregando..."
   */
  startLoading(): void {
    this.loading = true;
  }

  /**
   * Seta o valor de loading para false, alterando o ícone para o ícone padrão
   */
  endLoading(): void {
    this.loading = false;
  }

  /**
   * Alterna o estado do componente para "selecionado"
   */
  toggle(): void {
    this.selected = !this.selected;
  }

  /**
   * Atribui valor para sublinkSelected
   * @param state Valor a ser atribuído
   */
  setSublinkSelected(state: boolean): void {
    this.sublinkSelected = state;
  }

  /**
   * Alterna o estado do componente para "subitem selecionado"
   */
  toggleSublink(): void {
    this.sublinkSelected = !this.sublinkSelected;
  }

  /**
   * Atribui valor para selected
   * @param state Valor a ser atribuído
   */
  setSelected(state: boolean): void {
    this.selected = state;
  }

  sublinkClicked(event: MouseEvent): void {
    event.stopPropagation();
    this.sublinkClickEmitter.emit(event);
  }
}
