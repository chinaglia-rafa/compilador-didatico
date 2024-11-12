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
import '@material/web/menu/menu';
//import '@material/web/menu/menu-item';
import { LiveIconComponent } from '../live-icon/live-icon.component';
import { MdMenu } from '@material/web/menu/menu';

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

/** Sub-item de um master-card */
export interface MasterCardSubItem {
  title: string;
  icon: string;
  url: string;
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
  /** Lista de sublinks */
  @Input('sublinks') sublinks: MasterCardSubItem[] = [];
  @Input('sublinkButton') sublinkButton: string;
  @Input('sublinkTitle') sublinkTitle: string;
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
  @Output('sublinkClick') sublinkClickEmitter = new EventEmitter<{
    event: MouseEvent;
    index: number;
    url: string;
  }>();

  /** Controla o estado de carregamento do componente */
  protected loading = false;
  /** Controla o estado de seleção do componente */
  protected selected = false;
  /** Controla o estado de seleção do subitem do componente */
  protected sublinkSelected: number = -1;

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
  setSublinkSelected(state: number): void {
    this.sublinkSelected = state;
  }

  /**
   * Alterna o estado do componente para "subitem selecionado"
   */
  toggleSublink(): void {
    //this.sublinkSelected = !this.sublinkSelected;
    console.warn('TO BE IMPLEMENTED');
  }

  /**
   * Atribui valor para selected
   * @param state Valor a ser atribuído
   */
  setSelected(state: boolean): void {
    this.selected = state;
  }

  /**
   * Função chamada pelo evento de clique do sublink, usada
   * para emitir o output para outros componentes
   *
   * @param event evento de clique
   * @param index índice do sublink clicado
   * @param url endereço da página a ser aberta
   */
  sublinkClicked(event: MouseEvent, index: number, url: string): void {
    event.stopPropagation();
    this.sublinkClickEmitter.emit({ event, index, url });
  }

  toggleOptions(event: MouseEvent, menu: MdMenu): void {
    event.stopPropagation();
    menu.open = !menu.open;
  }
}
