import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  MasterCardComponent,
  MasterCardItem,
  MasterCardSubItem,
} from '../../components/master-card/master-card.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ChildrenOutletContexts, Router, RouterOutlet } from '@angular/router';
import { customAnimations } from '../../animations';
import { CompilerService } from '../../services/compiler/compiler.service';
import { LexicalAnalysisService } from '../../services/lexical-analysis/lexical-analysis.service';
import { SymbolsTableService } from '../../services/symbols-table/symbols-table.service';
import { SyntacticAnalysisService } from '../../services/syntactic-analysis/syntactic-analysis.service';
import { SemanticAnalysisService } from '../../services/semantic-analysis/semantic-analysis.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, MasterCardComponent, NgScrollbarModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [customAnimations],
})
export class HomeComponent implements AfterViewInit, OnInit {
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

  analiseSintaticaCardSubItems: MasterCardSubItem[] = [
    {
      title: 'Ver gramática',
      icon: 'description',
      url: 'language-viewer',
    },
    {
      title: 'Árvore sintática',
      icon: 'account_tree',
      url: 'syntactic-tree',
    },
  ];

  geracaoDeCodigoCardSubItems: MasterCardSubItem[] = [
    {
      title: 'Máquina Virtual MEPA',
      icon: 'dns',
      url: 'mepa',
    },
  ];

  /** Lista de todos os cards presentes na tela inicial */
  private cards: (MasterCardComponent | undefined)[] = [];

  constructor(
    private contexts: ChildrenOutletContexts,
    private router: Router,
    private compilerService: CompilerService,
    private lexicalAnalysisService: LexicalAnalysisService,
    private symbolsTableService: SymbolsTableService,
    private syntacticAnalysisService: SyntacticAnalysisService,
    private semanticAnalysisService: SemanticAnalysisService,
  ) {}

  ngOnInit(): void {
    this.compilerService.loading$.subscribe((loadingStates) => {
      for (let i = 0; i < this.cards.length; i++) {
        if (loadingStates[i] === true) this.cards[i].startLoading();
        else this.cards[i].endLoading();
      }
    });

    this.compilerService.linesCount$.subscribe((count) => {
      this.codigoFonteCardItems[0].value = count.toString();
    });

    this.symbolsTableService.count$.subscribe((count) => {
      this.simbolosCardCompItems[0].value = count.toString();
    });

    this.lexicalAnalysisService.errors$.subscribe((data) => {
      this.analiseLexicaCardCompItems[1].value = data.length.toString();
      this.analiseLexicaCardCompItems[1].visible = data.length > 0;
    });

    this.lexicalAnalysisService.tokens$.subscribe((data) => {
      this.analiseLexicaCardCompItems[0].value = data.length.toString();
    });
    this.syntacticAnalysisService.nodeCount$.subscribe((data) => {
      this.analiseSintaticaCardCompItems[0].value = data.toString();
    });
    this.syntacticAnalysisService.errorCount$.subscribe((data) => {
      this.analiseSintaticaCardCompItems[1].value = data.toString();
      this.analiseSintaticaCardCompItems[1].visible = data > 0;
    });
    this.semanticAnalysisService.count$.subscribe((data) => {
      this.analiseSemanticaCardCompItems[0].value = data.toString();
    });
    this.semanticAnalysisService.errors$.subscribe((data) => {
      this.analiseSemanticaCardCompItems[1].value = data.toString();
      this.analiseSemanticaCardCompItems[1].visible = data > 0;
    });
  }

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
      /** TODO: aprender finalmente como lidar com esse tipo de hax chato */
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
    else if (path === 'language-viewer') {
      this.cards[3]?.toggle();
      this.cards[3]?.setSublinkSelected(0);
    } else if (path === 'semantic-analysis') this.cards[4]?.toggle();
    else if (path === 'code-generation') this.cards[5]?.toggle();
    else if (path === 'mepa') {
      this.cards[5]?.toggle();
      this.cards[5]?.toggleSublink();
    } else if (path === 'optimization') this.cards[6]?.toggle();
    else if (path === 'final-results') this.cards[7]?.toggle();
  }

  clicked(
    event: MouseEvent,
    el: MasterCardComponent,
    route: string,
    sublink: number = -1,
  ): void {
    el.toggleLoading();
    this.cards.map((card) => {
      card?.setSelected(false);
      card?.setSublinkSelected(-1);
    });
    el.toggleLoading();
    el.toggle();
    if (sublink >= 0) el.setSublinkSelected(sublink);

    this.router.navigate(['compiler', ...route.split('/')]);
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
    ];
  }
}
