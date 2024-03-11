import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  Component,
  ViewChild,
} from '@angular/core';
import {
  MasterCardComponent,
  MasterCardItem,
} from '../../components/master-card/master-card.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ChildrenOutletContexts, Router, RouterOutlet } from '@angular/router';
import { customAnimations } from '../../animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, MasterCardComponent, NgScrollbarModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [customAnimations],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('codigoFonteCard')
  codigoFonteCardComponent?: MasterCardComponent;
  @ViewChild('analiseLexicaCard')
  analiseLexicaCardComponent?: MasterCardComponent;
  @ViewChild('simbolosCard')
  simbolosCardComponent?: MasterCardComponent;
  @ViewChild('analiseSintaticaCard')
  analiseSintaticaCardComponent?: MasterCardComponent;
  @ViewChild('analiseSemanticaCard')
  analiseSemanticaCardComponent?: MasterCardComponent;
  @ViewChild('geracaoDeCodigoCard')
  geracaoDeCodigoCardComponent?: MasterCardComponent;
  @ViewChild('otimizacaoDeCodigoCard')
  otimizacaoDeCodigoCardComponent?: MasterCardComponent;
  @ViewChild('resultadoFinalCard')
  resultadoFinalCardComponent?: MasterCardComponent;

  /* backup
   * codigoFonteCardItems = [
    { label: 'linhas digitadas', value: '42', color: 'default' },
    { label: 'erros', value: '3', color: 'error', visible: false },
  ];
  analiseLexicaCardCompItems = [
    { label: 'tokens', value: '175', color: 'default' },
    { label: 'erro léxico', value: '1', color: 'error', visible: false },
  ];
  simbolosCardCompItems = [
    { label: 'símbolos', value: '23', color: 'default' },
  ];
  analiseSintaticaCardCompItems = [
    { label: 'nós', value: '1008', color: 'default' },
    { label: 'erros sintáticos', value: '38', color: 'error', visible: false },
  ];
  analiseSemanticaCardCompItems = [
    { label: 'identificadores', value: '9', color: 'default' },
    { label: 'erros semânticos', value: '5', color: 'error', visible: false },
  ];
  geracaoDeCodigoCardCompItems = [
    { label: 'Kb', value: '1,6', color: 'default' },
    { label: 'comandos', value: '63', color: 'default' },
  ];
  otimizacaoDeCodigoCardCompItems = [
    { label: 'Kb', value: '0,8', color: 'default' },
    { label: '%', value: '49', color: 'success' },
  ];
  resultadoFinalCardCompItems = [
    { label: 'Kb', value: '0,8', color: 'default' },
  ];
   */

  codigoFonteCardItems: MasterCardItem[] = [
    { label: 'linhas digitadas', value: '0', color: 'default' },
    { label: 'erros', value: '0', color: 'error', visible: false },
  ];
  analiseLexicaCardCompItems: MasterCardItem[] = [
    { label: 'tokens', value: '0', color: 'default' },
    { label: 'erro léxico', value: '0', color: 'error', visible: false },
  ];
  simbolosCardCompItems: MasterCardItem[] = [
    { label: 'símbolos', value: '0', color: 'default' },
  ];
  analiseSintaticaCardCompItems: MasterCardItem[] = [
    { label: 'nós', value: '0', color: 'default' },
    { label: 'erros sintáticos', value: '0', color: 'error', visible: false },
  ];
  analiseSemanticaCardCompItems: MasterCardItem[] = [
    { label: 'identificadores', value: '0', color: 'default' },
    { label: 'erros semânticos', value: '0', color: 'error', visible: false },
  ];
  geracaoDeCodigoCardCompItems: MasterCardItem[] = [
    { label: 'Kb', value: '0', color: 'default' },
    { label: 'comandos', value: '0', color: 'default' },
  ];
  otimizacaoDeCodigoCardCompItems: MasterCardItem[] = [
    { label: 'Kb', value: '0', color: 'default' },
    { label: '%', value: '0', color: 'success' },
  ];
  resultadoFinalCardCompItems: MasterCardItem[] = [
    { label: 'Kb', value: '0', color: 'default' },
  ];

  /** Lista de todos os cards presentes na tela inicial */
  private cards: (MasterCardComponent | undefined)[] = [];

  constructor(
    private contexts: ChildrenOutletContexts,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.cards = [
      this.codigoFonteCardComponent,
      this.analiseLexicaCardComponent,
      this.simbolosCardComponent,
      this.analiseSintaticaCardComponent,
      this.analiseSemanticaCardComponent,
      this.geracaoDeCodigoCardComponent,
      this.otimizacaoDeCodigoCardComponent,
      this.resultadoFinalCardComponent,
    ];

    setTimeout(() => {
      this.selectInitialMasterCard();
    }, 100);
  }

  /**
   * Marca o card correspondente à rota ao carregar pela primeira vez
   */
  selectInitialMasterCard(): void {
    const path =
      this.contexts.getContext('primary')?.route?.snapshot.routeConfig?.path;
    if (!path) return;

    if (path === 'code-editor') this.cards[0]?.toggle();
    else if (path === 'lexical-analysis') this.cards[1]?.toggle();
    else if (path === 'symbols') this.cards[2]?.toggle();
    else if (path === 'syntactic-analysis') this.cards[3]?.toggle();
    else if (path === 'semantic-analysis') this.cards[4]?.toggle();
    else if (path === 'code-generation') this.cards[5]?.toggle();
    else if (path === 'optimization') this.cards[6]?.toggle();
    else if (path === 'final-results') this.cards[7]?.toggle();
  }

  clicked(event: MouseEvent, el: MasterCardComponent, route: string): void {
    el.toggleLoading();
    this.cards.map((card) => card?.setSelected(false));
    el.toggleLoading();
    el.toggle();

    this.router.navigate(['compiler', route]);
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
    ];
  }
}
