import { EventEmitter, Injectable } from '@angular/core';
import {
  ColunaSintantica,
  EPSILON,
  Grammar,
  LinhaSintatica,
  TabelaSintatica,
} from '../../grammar/grammar.model';
import { lalg } from '../../grammar/LALG';
import { Token } from '../lexical-analysis/lexical-analysis.service';
import { LoggerService } from '../logger/logger.service';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '../errors/errors.service';
import { SemanticAnalysisService } from '../semantic-analysis/semantic-analysis.service';
import {
  SymbolCategory,
  SymbolPassedAs,
} from '../symbols-table/symbols-table.service';

export interface FirstList {
  symbol: string;
  first: string[];
}
export interface FollowList {
  symbol: string;
  follow: string[];
}

export interface SyntacticTreeNode {
  id: string;
  label: string;
  dimension: {
    width: number;
    height: number;
  };
  isTerminal: boolean;
}

export interface SyntacticTreeLink {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface SyntacticTree {
  nodes: SyntacticTreeNode[];
  links: SyntacticTreeLink[];
}

export interface StackElement {
  value: string;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class SyntacticAnalysisService {
  /** Gramática selecionada para a análise sintática */
  selectedGrammar: Grammar;
  /** Tabela sintática que será usada na análise sintática */
  syntacticTable: TabelaSintatica = new TabelaSintatica();
  /** Lista de tokens vindas da Análise Léxica */
  input: Token[] = [];
  /**
   * Backup da lista de tokens vindas da Análise Léxica.
   * É usada para que se possa repetir a Análise Sintática sem compilar novamente
   */
  originalInput: Token[] = [];

  /** Pilha usada na análise sintática descendente */
  stack: StackElement[] = [];

  /** Lista de símbolos não terminais e seus firsts */
  firsts: FirstList[] = [];
  /** Lista de símbolos não terminais e seus follows */
  follows: FollowList[] = [];
  /**
   * Pilha de símbolos cujo cálculo de first está na pilha de recursão.
   * Esta variável é usada para impedir loops de recursão infinitas. */
  pendingFirstRecursions: string[] = [];
  /**
   * Pilha de símbolos cujo cálculo de follow está na pilha de recursão.
   * Esta variável é usada para impedir loops de recursão infinitas. */
  pendingFollowRecursions: string[] = [];
  /** Indica se a análise sintática deve ser feita automaticamente ou passo-a-passo */
  autoMode: boolean = true;
  /**
   * Evento que é emitido quando o serviço termina de preparar a
   * gramática.
   */
  ready: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /** Indica se a análise sintática chegou ao final da entrada com panicMode = true */
  eof = false;
  /** Indica se a análise sintática teve erros */
  hasErrors = false;
  /** Último terminal visto na análise sintática */
  lastTerminal: Token;
  /** Indica se a compilação foi iniciada */
  started: boolean = false;
  /** Representação da árvore sintática */
  syntacticTree: SyntacticTree;
  /** Contagem ascendente para controlar IDs únicos */
  idCounter = 0;
  parentNodeID = '';
  /** Contagem de nós da tabela sintática */
  nodeCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** último símbolo da pilha que foi resolvido */
  popped: StackElement = { value: '', id: '' };

  private _path: string[] = ['Compilador', 'Análise Sintática'];

  constructor(
    private loggerService: LoggerService,
    private errorService: ErrorsService,
    private semanticAnalysisService: SemanticAnalysisService,
  ) {
    this.selectedGrammar = lalg;

    this.prepare();
  }

  /**
   * Reseta o serviço de Análise Sintática
   *
   * @param hard indica se o reset deve conter cálculos do construtor
   * como firsts e follows.
   */
  reset(hard: boolean = false): void {
    this.eof = false;
    this.lastTerminal = null;
    this.hasErrors = false;
    this.input = [];
    this.stack = [];
    if (hard) {
      this.firsts = [];
      this.follows = [];
      this.syntacticTable = new TabelaSintatica();
    }
    this.started = false;
    this.syntacticTree = {
      nodes: [],
      links: [],
    };

    this.nodeCount$.next(0);
  }

  startStepByStep(): void {
    this.started = false;
    this.autoMode = false;
    this.parse(this.originalInput);
  }

  /** Para o modo passo-a-passo e finaliza a análise */
  stopStepByStep(): void {
    this.autoMode = true;
    this.parse(this.originalInput);
  }

  /**
   * Prepara a Gramática carregada em selectedGrammar para ser usada
   * na compilação, ou seja:
   *     - calcula seus conjuntos First
   *     - calcula seus conjuntos Follow
   *     - monta a tabela sintática para a gramática
   */
  prepare(): void {
    /** Variável usada para os logs */
    const path = this._path.concat(['Inicialiazção da gramática']);
    this.reset();
    this.loggerService.log(
      `Preparando a gramática carregada: <strong>${this.selectedGrammar.name}</strong>`,
      'stp',
      path,
      1,
    );

    this.firsts = this.calculateFirsts();
    this.follows = this.calculateFollows();
    this.syntacticTable = this.calculateSyntacticTable(
      this.firsts,
      this.follows,
    );

    this.ready.next(true);
  }

  calculateFirsts(): FirstList[] {
    /** Variável usada para os logs */
    const path = this._path.concat([
      'Inicialiazção da gramática',
      'Cálculo dos Firsts',
    ]);
    this.loggerService.log(
      `Calculando conjuntos First da linguagem ${this.selectedGrammar.name}`,
      'stp',
      path,
      2,
    );

    const firsts: FirstList[] = [];

    for (const symbol of this.selectedGrammar.productions) {
      // Caso seja um símbolo terminal (sem derivações), passe para o próximo
      // TODO: pensar o que fazer com o <CONVERT_TO_FINAL>
      if (symbol.rightSide.length === 0) continue;
      /** Símbolo cujo conjunto First será calculado nessa volta do loop */
      const currentSymbol: FirstList = {
        symbol: symbol.leftSide,
        first: [],
      };
      // Regra 1: Se um dado não-terminal <X> tiver uma produção do tipo X -> aα e a é terminal,
      // então a é parte de first(<X>)
      currentSymbol.first = this.findFirtsFor(symbol.leftSide);

      firsts.push(currentSymbol);
    }

    return firsts;
  }

  /**
   * Função responsável por vasculhar cada terminal que seja First de symbol
   *
   * @param symbolname símbolo não-terminal cujo first(<symbolName>) será calculado
   * @returns lista de símbolos que compõem o conjunto first de <symbol>
   */
  findFirtsFor(symbolName: string): string[] {
    /** Variável usada para os logs */
    const path = this._path.concat([
      'Inicialiazção da gramática',
      'Cálculo dos Firsts',
      'findFirstsFor()',
    ]);

    const symbol = this.selectedGrammar.productions.find(
      (el) => el.leftSide === symbolName,
    );
    if (!symbol) {
      this.loggerService.log(
        `Símbolo ${LoggerService.escapeHTML(symbolName)} não encontrado na Gramática ${this.selectedGrammar.name}`,
        'err',
        path,
        2,
      );
      return [];
    }

    /** Lista de símbolos terminals que compõem o conjunto first de <symbol> */
    const first: Set<string> = new Set();

    // Registra que o símbolo <symbol> já está na pilha de cálculo de
    // firsts, e portanto, caso seu cálculo seja necessário novamente,
    // ele pode ser ignorado.
    this.pendingFirstRecursions.push(symbol.leftSide);

    for (const production of symbol.rightSide) {
      for (const part of production) {
        // TODO: implementar a análise semântica
        if (part.match(/\[\[.+\]\]/g)) {
          console.log('pulei', part);
          continue;
        }
        // Se part for <não-terminal>
        if (part.match(/<.+>/g) !== null && part !== symbol.leftSide) {
          let firstsForCurrentPart: Set<string>;

          if (!this.pendingFirstRecursions.includes(part)) {
            // Regra 2: dado um <X> não-terminal que tem uma produção <X> -> <A>,
            // então first(<A>) faz parte de first(<X>)
            firstsForCurrentPart = new Set(
              this.findFirtsFor(part)
                .filter((element) => !element.match(/\[\[.+\]\]/g))
                .map((element) => {
                  first.add(element);
                  return element;
                }),
            );
            // Regra 4: se um dado <X> não-terminal tem uma produção -> <A><B> e
            // first(<A>) contém ε, então first(<X>) inclui first(<B>) também
            if (!firstsForCurrentPart.has(EPSILON)) break;
          }
        } else {
          // Regra 3: dado um símbolo terminal a, first(a) = {a}
          first.add(part);
          break;
        }
      }
    }

    this.pendingFirstRecursions.pop();

    return Array.from(first);
  }

  calculateFollows(): FollowList[] {
    const follows: FollowList[] = [];

    for (const production of this.selectedGrammar.productions) {
      if (production.rightSide.length === 0) continue;

      /** Símbolo cujo conjunto follow será calculado */
      const currentSymbol: FollowList = {
        symbol: production.leftSide,
        follow: [],
      };

      currentSymbol.follow = this.findFollowsFor(currentSymbol.symbol);

      follows.push(currentSymbol);
    }

    return follows;
  }

  findFollowsFor(symbolName: string): string[] {
    /** Variável usada para os logs */
    const path = this._path.concat([
      'Inicialiazção da gramática',
      'Cálculo de Follows',
      'findFollowsFor()',
    ]);

    const follows: Set<string> = new Set();
    /** verifica se o conjunto follow já foi calculado previamente */
    const hasFollows = this.follows.find((el) => el.symbol === symbolName);
    if (hasFollows != undefined) return hasFollows.follow;

    // Regra 1: Se um dado não-temrinal <X> é raiz, então $ é parte de follow(<X>)
    if (symbolName === this.selectedGrammar.productions[0].leftSide)
      follows.add('$');

    // Caso o símbolo já esteja na fila para ter seu conjunto follow
    // calculado, ignore-o.
    if (this.pendingFollowRecursions.includes(symbolName)) return [];

    this.pendingFollowRecursions.push(symbolName);

    const symbols = this.selectedGrammar.productions.filter(
      (prod) =>
        prod.rightSide.findIndex(
          (part) => part.findIndex((el) => el === symbolName) !== -1,
        ) !== -1,
    );

    // Se o símbolo não estiver presente em nenhuma derivação, então
    // ele é ou a raiz ou um símbolo sem conjunto follow.
    if (symbols.length === 0)
      return symbolName === this.selectedGrammar.productions[0].leftSide
        ? ['$']
        : [];

    // Para cada produção que pode derivar em symbolName
    for (const symbol of symbols) {
      for (const production of symbol.rightSide) {
        let previousPart: string = null;
        // Regra 2: Se existe uma produção do tipo <A> -> α<X>β onde β != ε, então
        // first(β), exceto ε, é parte de follow(<X>)
        for (const part of production) {
          // TODO: análise semântica
          if (part.match(/\[\[.+\]\]/g)) {
            console.log(symbolName, 'pulei', part);
            continue;
          }

          if (
            previousPart === symbolName &&
            previousPart !== null &&
            previousPart.match(/<.+>/g) !== null
          ) {
            const firstFromCurrentSymbol =
              part.match(/<.+>/g) !== null
                ? this.firsts.find((f) => f.symbol === part)
                : ({ symbol: part, first: [part] } as FirstList);

            if (!firstFromCurrentSymbol) {
              this.loggerService.log(
                `First(${part}) não encontrado. Gramática mal configurada.`,
                'err',
                path,
                0,
              );
            }

            firstFromCurrentSymbol.first
              .filter((f) => f !== EPSILON)
              .filter((f) => !f.match(/\[\[.+\]\]/g))
              .map((f) => follows.add(f));
            // Regra 3: Se existe uma produção do tipo <A> -> α<X> ou <A> -> α<X>β onde
            // first(β) contém ε, então follow(<X>) deve conter follow(<A>)
            if (firstFromCurrentSymbol.first.includes(EPSILON)) {
              this.findFollowsFor(symbol.leftSide)
                .filter((f) => !f.match(/\[\[.+\]\]/g))
                .map((f) => follows.add(f));
            }
          }
          previousPart = part;
        }
        // Regra 3: parte <A> -> α<X>
        if (
          previousPart.match(/<.+>/g) !== null &&
          previousPart === symbolName &&
          symbol.leftSide !== previousPart
        ) {
          this.findFollowsFor(symbol.leftSide)
            .filter((f) => !f.match(/\[\[.+\]\]/g))
            .map((f) => follows.add(f));
        }
      }
    }

    this.pendingFollowRecursions.pop();

    return Array.from(follows);
  }

  calculateSyntacticTable(
    firsts: FirstList[],
    follows: FollowList[],
  ): TabelaSintatica {
    const table = new TabelaSintatica();

    for (const currentFirst of firsts) {
      /** Linha atual da tabela sintática sendo construída */
      const row = new LinhaSintatica(currentFirst.symbol);
      /** símbolo e derivações referentes a currentFirst */
      const symbol = this.selectedGrammar.productions.find(
        (el) => el.leftSide === currentFirst.symbol,
      );

      for (const production of symbol.rightSide) {
        for (const part of production) {
          const firstsOfPart: FirstList = firsts.find(
            (f) => f.symbol === part,
          ) || {
            symbol: part,
            first: [part],
          };

          let foundEpsilon = false;
          // Regra 1: Na produção A -> α, para cada x terminal em first(α), adicionar A -> α em Tabela[A, x]
          for (const terminal of firstsOfPart.first) {
            // Regra 2: Se first(α) contém ε, adicione A -> α a M[A, b] para cada terminal b que estiver em
            // follow(A).
            if (terminal === EPSILON) {
              foundEpsilon = true;

              const followsForSymbol = follows.find(
                (f) => f.symbol === symbol.leftSide,
              );

              for (const currentFollow of followsForSymbol.follow) {
                // Verifica se o símbolo currentFollow já não está em first(symbol)
                const found = row.col.findIndex(
                  (c) => c.header === currentFollow,
                );
                if (found !== -1) continue;

                // Adiciona A -> ε a M[A, b] onde b está em follow(A) e é igual a ε
                const col = new ColunaSintantica(currentFollow);
                col.cell = [EPSILON];
                row.col.push(col);
              }
              continue;
            }
            // Caso a coluna não exista, crie uma nova, caso contrário, sobrescreva sua cell pela produção encontrada
            const existingCol = row.col.find((c) => c.header === terminal);
            const col = existingCol
              ? existingCol
              : new ColunaSintantica(terminal);
            col.cell = production;
            if (existingCol === undefined) row.col.push(col);
          }
          if (!foundEpsilon) break;
        }
      }
      // Agora é hora de adicionar as tokens de sincronização, que serão usadas para tentar recuperar a
      // análise sintática de uma situação de erro. As células que vão receber a token de sincronização
      // serão, para cada não-terminal, as células correspondentes aos terminais que compõem seu follow()
      const followsForSymbol = follows.find(
        (f) => f.symbol === symbol.leftSide,
      );
      if (followsForSymbol) {
        for (const terminal of followsForSymbol.follow) {
          const found = row.col.findIndex((c) => c.header === terminal);
          if (found === -1) {
            const col = new ColunaSintantica(terminal);
            col.cell = ['TOKEN_SYNC'];
            row.col.push(col);
          }
        }
      }
      table.row.push(row);
    }

    return table;
  }

  parse(ipt: Token[]): void {
    const path = this._path.concat(['parse()']);

    if (!this.started) {
      this.loading$.next(true);
      this.input = [].concat(ipt);
      this.originalInput = [].concat(ipt);

      this.semanticAnalysisService.reset();
      this.semanticAnalysisService.pushBlock('global');

      this.loggerService.log('Iniciando análise sintática', 'stp', path, 1);

      /** token representando o final da entrada de tokens */
      const endToken: Token = {
        lexema: '$',
        token: '$',
        col: this.input[this.input.length - 1].col,
        row: this.input[this.input.length - 1].row,
      };

      this.loggerService.log(
        'Anotando <i>token</i> final <span class="monospace>$</span> no fim da entrada',
        'stp',
        path,
        1,
      );

      this.input.push(endToken);

      this.idCounter = 0;
      this.popped = { value: '', id: '' };

      this.syntacticTree = {
        nodes: [],
        links: [],
      };

      this.stack = [
        {
          value: endToken.lexema,
          id: `node_${this.idCounter++}`,
        },
      ];

      this.loggerService.log(
        'Anotando <i>símbolo</i> final <span class="monospace">$</span> no fundo da pilha',
        'stp',
        path,
        1,
      );

      const root = this.selectedGrammar.productions[0].leftSide;
      const rootId = `node_${this.idCounter++}`;
      this.stack.push({
        value: root,
        id: rootId,
      });
      this.addNode(root, rootId);
      this.loggerService.log(
        'Empilha o símbolo raiz da gramática para começar',
        'stp',
        path,
        1,
      );

      this.started = true;
    }

    while (this.stack.length > 0 || this.input.length > 0) {
      const actionToTake = this.parseStep();

      if (actionToTake === 'break') break;
      else if (actionToTake === 'continue') continue;

      if (!this.autoMode) break;
    }
  }

  /**
   * Passo da compilação, de forma que possa ser feita
   * automaticamente ou passo-a-passo.
   *
   * @return 'break' ou 'continue'
   */
  parseStep(): string {
    /** Variável usada para os logs */
    const path = this._path.concat(['parse()', 'parseStep()']);

    this.loggerService.log(
      'Começando um novo passo da análise sintática',
      'stp',
      path,
      1,
    );

    this.eof = false;
    let currentToken = this.input[0];
    if (!currentToken) return 'break';

    /**
     * Verifica se, no passo atual da análise, toda a cadeia de entrada
     * foi validada com sucesso.
     */
    if (
      this.stack[this.stack.length - 1].value === '$' &&
      this.input[0].lexema === '$'
    ) {
      this.loggerService.log(
        this.hasErrors
          ? 'Análise Sintática concluída com erros. Texto-fonte <strong>não é válido</strong>.'
          : 'Análise Sintática concluída com sucesso. Texto-fonte foi validado.',
        'stp',
        path,
        1,
      );

      this.nodeCount$.next(this.syntacticTree.nodes.length);
      this.semanticAnalysisService.nextIdentifiersCount();

      this.started = false;
      // reativa o modo automático
      this.autoMode = true;
      this.loading$.next(false);
      return 'break';
    } else if (
      (this.stack[this.stack.length - 1].value === '$' &&
        this.input[0].lexema !== '$') ||
      (this.stack[this.stack.length - 1].value !== '$' &&
        this.input[0].lexema === '$')
    ) {
      if (!this.eof) {
        this.errorService.add(
          203,
          this.input[0].row,
          this.input[0].col,
          this.input[0].row,
          this.input[0].col + this.input[0].lexema.length,
          path,
        );
        this.hasErrors = true;
      }
      this.started = false;
      this.loading$.next(false);
      return 'break';
    }

    this.loggerService.log(
      `Temos um símbolo <span class="monospace">${this.stack[this.stack.length - 1].value.match(/<.+>/g) !== null ? 'não-terminal' : 'terminal'}</span> no topo da pilha: ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)}`,
      'stp',
      path,
      1,
    );

    if (this.stack[this.stack.length - 1].value.match(/<.+>/g) !== null) {
      this.loggerService.log(
        'Ação de símbolo <span class="monospace">não-terminal</span>: encontrar uma derivação',
        'stp',
        path.concat(['não-terminal']),
        1,
      );

      if (this.stack[this.stack.length - 1].value === '<identificador>') {
        this.loggerService.log(
          `Símbolos do tipo ${this.wrapSymbolInTags('<identificador>')} serão validados diretamente`,
          'stp',
          path.concat(['derivação', 'validando identificador']),
          1,
        );
        if (
          ![
            'identificador-válido',
            'boolean-verdadeiro',
            'boolean-falso',
            'tipo-inteiro',
            'tipo-booleano',
          ].includes(currentToken.token)
        ) {
          this.errorService.add(
            200,
            currentToken.row,
            currentToken.col,
            currentToken.row,
            currentToken.col + currentToken.lexema.length,
            path,
            `${currentToken.lexema} (${currentToken.token}) encontrado.`,
          );

          this.loggerService.log(
            `👎 A token atual (${this.wrapSymbolInTags(currentToken.lexema)} do tipo ${currentToken.token}) não é um identificador válido`,
            'err',
            path.concat(['não-terminal', 'validando identificador']),
            1,
          );

          this.loggerService.log(
            `❌ Descartando token ${this.wrapSymbolInTags(currentToken.lexema)} em virtude de erro sintático`,
            'err',
            path.concat([
              'derivação',
              'validando identificador',
              'tokens de entrada',
            ]),
            1,
          );
          this.loggerService.log(
            `❌ Descartando símbolo ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} em virtude de erro sintático`,
            'err',
            path.concat([
              'derivação',
              'validando identificador',
              'pilha de símbolos',
            ]),
            1,
          );

          this.hasErrors = true;
          this.popped = this.stack.pop();
          this.lastTerminal = this.input.shift();

          return 'continue';
        }

        this.loggerService.log(
          `👍 A token atual (<span class="monospace">${currentToken.lexema}</span> do tipo ${currentToken.token}) é um identificador válido`,
          'stp',
          path.concat(['derivação', 'validando identificador']),
          1,
        );

        this.loggerService.log(
          `✅ Desempilhando símbolo ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} que foi derivado`,
          'stp',
          path.concat([
            'derivação',
            'validando identificador',
            'pilha de símbolos',
          ]),
          1,
        );

        this.popped = this.stack.pop();
        this.addNode(currentToken.lexema, `node_${this.idCounter++}`);

        if (
          this.semanticAnalysisService.getMode() ===
            'declaracao_de_variaveis' ||
          this.semanticAnalysisService.getMode() === 'nome_programa'
        ) {
          this.semanticAnalysisService.setCategory(SymbolCategory.Variable);
          this.semanticAnalysisService.addIdentifier(currentToken.symbolIndex);
        } else if (
          this.semanticAnalysisService.getMode() ===
          'declaracao_de_procedimento'
        ) {
          this.semanticAnalysisService.setType('procedure-name');
          this.semanticAnalysisService.setCategory(SymbolCategory.Procedure);
          this.semanticAnalysisService.addIdentifier(currentToken.symbolIndex);
          //this.semanticAnalysisService.setScope('func_' + currentToken.lexema);
          this.semanticAnalysisService.pushBlock('func_' + currentToken.lexema);
          this.semanticAnalysisService.enterNewLexicalLevel();
          this.semanticAnalysisService.done();
        } else if (
          this.semanticAnalysisService.getMode() === 'parametros_formais'
        ) {
          if (
            this.semanticAnalysisService.getMode() === 'parametros_formais' &&
            this.lastTerminal.lexema === ':'
          ) {
            this.semanticAnalysisService.setType(currentToken.lexema);
            this.semanticAnalysisService.setCategory(
              SymbolCategory.FormalParam,
            );
            this.semanticAnalysisService.consolidate();
          }
          this.semanticAnalysisService.accumulate(currentToken.symbolIndex);
        } else {
          this.semanticAnalysisService.checkIdentifier(currentToken);
        }

        this.loggerService.log(
          `✅ Removendo token ${this.wrapSymbolInTags(currentToken.lexema)} que foi validada`,
          'stp',
          path.concat([
            'derivação',
            'validando identificador',
            'tokens de entrada',
          ]),
          1,
        );

        this.lastTerminal = this.input.shift();
        return 'continue';
      } else if (this.stack[this.stack.length - 1].value === '<número>') {
        this.loggerService.log(
          `Símbolos do tipo ${this.wrapSymbolInTags('<número>')} serão validados diretamente`,
          'stp',
          path.concat(['derivação', 'validando número']),
          1,
        );

        if (
          currentToken.token !== 'número-natural' &&
          currentToken.token !== 'número-real'
        ) {
          this.errorService.add(
            201,
            currentToken.row,
            currentToken.col,
            currentToken.row,
            currentToken.col + currentToken.lexema.length,
            path,
            `${currentToken.lexema} (${currentToken.token}) encontrado.`,
          );

          this.loggerService.log(
            `👎 A token atual (${this.wrapSymbolInTags(currentToken.lexema)} do tipo ${currentToken.token}) não é um número válido.`,
            'err',
            path.concat(['derivação', 'validando número']),
            1,
          );

          this.loggerService.log(
            `❌ Descartando token ${this.wrapSymbolInTags(currentToken.lexema)} em virtude de erro sintático`,
            'err',
            path.concat(['derivação', 'validando número', 'tokens de entrada']),
            1,
          );

          this.loggerService.log(
            `❌ Descartando símbolo ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} em virtude de erro sintático`,
            'err',
            path.concat(['derivação', 'validando número', 'pilha de símbolos']),
            1,
          );

          this.hasErrors = true;
          this.popped = this.stack.pop();

          this.lastTerminal = this.input.shift();
          return 'continue';
        }

        this.loggerService.log(
          `👍 A token atual (${this.wrapSymbolInTags(currentToken.lexema)} do tipo ${currentToken.token}) é um número válido`,
          'stp',
          path.concat(['derivação', 'validando número', 'tokens de entrada']),
          1,
        );

        this.loggerService.log(
          `✅ Removendo token ${this.wrapSymbolInTags(currentToken.lexema)} que foi validada`,
          'stp',
          path.concat(['derivação', 'validando número', 'tokens de entrada']),
          1,
        );

        this.loggerService.log(
          `✅ Removendo símbolo ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} que foi validado`,
          'stp',
          path.concat([
            'derivação',
            'validando identificador',
            'pilha de símbolos',
          ]),
          1,
        );

        this.popped = this.stack.pop();
        this.addNode(currentToken.lexema, `node_${this.idCounter++}`);
        this.lastTerminal = this.input.shift();
        return 'continue';
      }

      this.loggerService.log(
        `Procurando derivação de ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} que aponte para ${this.wrapSymbolInTags(currentToken.lexema)} na tabela sintática`,
        'stp',
        path.concat(['derivação', 'tabela sintática']),
        1,
      );

      const row = this.syntacticTable.row.find(
        (r) => r.header === this.stack[this.stack.length - 1].value,
      );
      const col = row.col.find((c) => {
        let searchFor = currentToken.lexema;
        if (
          [
            'identificador-válido',
            'boolean-verdadeiro',
            'boolean-falso',
          ].includes(currentToken.token)
        ) {
          searchFor = '[a-zA-Z_][a-zA-Z_0-9]*';
        } else if (
          ['número-natural', 'número-real'].includes(currentToken.token)
        ) {
          searchFor = '[0-9]+';
        }
        return c.header === searchFor;
      });
      const expected = row.col
        .filter((c) => c.cell[0] !== 'TOKEN_SYNC' && c.header !== '$')
        .map((c) => c.header)
        .join(', ');

      if (col === undefined) {
        this.lastTerminal = this.input.shift();
        this.errorService.add(
          202,
          currentToken.row,
          currentToken.col,
          currentToken.row,
          currentToken.col + currentToken.lexema.length,
          path,
          `Entretanto, "${currentToken.lexema}" (${currentToken.token}) foi encontrado. ${expected} esperado.`,
        );

        this.loggerService.log(
          `👎 Derivação de ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} que aponte para ${this.wrapSymbolInTags(currentToken.lexema)} não foi encontrada. Erro sintático encontrado!`,
          'err',
          path.concat(['derivação', 'tabela sintática']),
          1,
        );

        this.hasErrors = true;
        return 'continue';
      }
      if (col?.cell[0] === 'TOKEN_SYNC') {
        this.loggerService.log(
          `👎 Derivação de ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} que aponte para ${this.wrapSymbolInTags(currentToken.lexema)} encontrou <span class="monospace">TOKEN_SYNC</span>, o que significa que o estado de erro pode ser recuperado usando o modo pânico`,
          'err',
          path.concat(['derivação', 'tabela sintática']),
          1,
        );

        if (this.input[0].lexema !== '$') {
          this.popped = this.stack.pop();

          this.loggerService.log(
            `❌ Desempilhando símbolo ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)}  da pilha de símbolos para tentar recuperar do modo pânico`,
            'err',
            path.concat(['derivação', 'modo pânico', 'pilha de símbolos']),
            1,
          );

          return 'continue';
        } else {
          this.errorService.add(
            203,
            currentToken.row,
            currentToken.col,
            currentToken.row,
            currentToken.col + currentToken.lexema.length,
            path,
            `Uma das seguintes tokens era esperada: ${expected}.`,
          );

          this.loggerService.log(
            `❌ Não há mais tokens na entrada para se recuperar do modo pânico. EOF encontrado`,
            'err',
            path.concat(['derivação', 'modo pânico', 'pilha de símbolos']),
            1,
          );

          this.hasErrors = true;
          this.eof = true;
          return 'break';
        }
      }

      const derivacaoLog = col.cell.map((s) => this.wrapSymbolInTags(s));

      this.loggerService.log(
        `👍 Derivação encontrada: ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)}</span> ➞ ${derivacaoLog.join(' ')}`,
        'stp',
        path.concat(['derivação']),
        1,
      );

      this.popped = this.stack.pop();
      if (col.cell[0] === EPSILON) {
        this.loggerService.log(
          `Derivação em <span class="monospace">${EPSILON}</span> encontrada. Nada será empilhado`,
          'stp',
          path.concat(['derivação']),
          1,
        );

        this.addNode(EPSILON, `node_${this.idCounter++}`);
        return 'continue';
      }
      /**
       * Inversão da derivação a ser empilhada em stack, para que seja
       * empilhada na ordem correta.
       */
      const invertedDerivation = [];

      const ids: string[] = [];

      for (const e of col?.cell) {
        invertedDerivation.unshift(e);

        ids.unshift(`node_${this.idCounter++}`);
        this.addNode(e, ids[0]);
      }

      // Um loop a mais apenas para imprimir os símbolos empilhados
      // na ordem correta
      for (const e of invertedDerivation) {
        const partToBeStacked = this.wrapSymbolInTags(e);

        this.loggerService.log(
          `➕ Empilhando ${partToBeStacked} na pilha de símbolos`,
          'stp',
          path.concat(['derivação', 'pilha de símbolos']),
          1,
        );
      }

      this.stack.push(
        ...invertedDerivation.map((el) => ({
          value: el,
          id: ids.shift(),
        })),
      );

      if (this.popped.value === '<seção_de_parâmetros_formais>') {
        this.semanticAnalysisService.setMode('parametros_formais');
        // aqui o tipo padrão é setado como valor, e caso um <var> seja
        // encontrado, ele mudado para .Reference
        this.semanticAnalysisService.setPassedAs(SymbolPassedAs.Value);
      }
    } else {
      if (this.popped.value === '<programa>') {
        this.semanticAnalysisService.setMode('nome_programa');
        this.semanticAnalysisService.setType('nome_programa');
      } else if (this.popped.value === '<tipo>') {
        this.semanticAnalysisService.setMode('declaracao_de_variaveis');
        this.semanticAnalysisService.setType(currentToken.lexema);
      } else if (this.popped.value === '<declaração_de_procedimento>') {
        this.semanticAnalysisService.setMode('declaracao_de_procedimento');
      } else if (currentToken.lexema === ';') {
        this.semanticAnalysisService.done();
      } else if (currentToken.lexema === 'var') {
        this.semanticAnalysisService.setPassedAs(SymbolPassedAs.Reference);
      } else if (currentToken.lexema === 'begin') {
        // mantém o nome do escopo atual
        this.semanticAnalysisService.pushBlock('begin');
      } else if (currentToken.lexema === 'end') {
        this.semanticAnalysisService.popBlock();
      }
      // O topo da stack é um terminal

      this.loggerService.log(
        'Ação de símbolo <span class="monospace">terminal</span>: validar com a token atual',
        'stp',
        path.concat(['terminal']),
        1,
      );

      if (this.stack[this.stack.length - 1].value === currentToken.lexema) {
        this.loggerService.log(
          `👍 O símbolo no topo da pilha ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} é igual à token atual ${this.wrapSymbolInTags(currentToken.lexema)}. Token atual foi validada`,
          'stp',
          path.concat(['terminal', 'validação']),
          1,
        );

        this.loggerService.log(
          `✅ Removendo token ${this.wrapSymbolInTags(currentToken.lexema)} que foi validada`,
          'stp',
          path.concat(['terminal', 'validação', 'tokens de entrada']),
          1,
        );

        this.loggerService.log(
          `✅ Removendo símbolo ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} que foi validado`,
          'stp',
          path.concat(['terminal', 'validação', 'pilha de símbolos']),
          1,
        );

        this.lastTerminal = this.input.shift();
        this.popped = this.stack.pop();
      } else {
        this.loggerService.log(
          `👎 O símbolo no topo da pilha ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} não corresponde à token atual ${this.wrapSymbolInTags(currentToken.lexema)}. Deve ser então descartado como um erro sintático`,
          'err',
          path.concat(['terminal', 'validação']),
          1,
        );

        this.loggerService.log(
          `❌ Descartando símbolo ${this.wrapSymbolInTags(this.stack[this.stack.length - 1].value)} em virtude de erro sintático`,
          'err',
          path.concat(['terminal', 'validação', 'pilha de símbolos']),
          1,
        );

        this.popped = this.stack.pop();
      }
    }

    return '';
  }

  addNode(content: string, id: string = ''): void {
    const newNode = {
      id,
      label: content,
      dimension: {
        width: 9.64 * content.length + 20,
        height: 30,
      },
      isTerminal: content.match(/<.+>/g) === null,
    };

    this.syntacticTree.nodes = [...this.syntacticTree.nodes, newNode];

    if (this.popped.id !== '') {
      const newLink: SyntacticTreeLink = {
        id: `link_${this.idCounter++}`,
        label: '',
        source: this.popped.id,
        target: newNode.id,
      };
      this.syntacticTree.links = [...this.syntacticTree.links, newLink];
    }
  }

  /** escapa uma tag HTML como texto plano */
  escapeHTML(str: string): string {
    return str.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  }

  /**
   * Faz a escolha certa de formatação para símbolos terminais e
   * não-terminais durante a análise para logs
   *
   * @param symbol símbolo a ser formatado
   */
  wrapSymbolInTags(symbol: string): string {
    let symbolText = '';
    if (symbol.match(/<.+>/g) !== null)
      symbolText = `<span class="monospace secondary-container on-secondary-container-text tiny-padding">${this.escapeHTML(symbol)}</span>`;
    else symbolText = `<span class="monospace">${symbol}</span>`;

    return symbolText;
  }
}
