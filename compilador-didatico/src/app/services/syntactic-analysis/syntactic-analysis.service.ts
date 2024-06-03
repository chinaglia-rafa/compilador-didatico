import { EventEmitter, Injectable } from '@angular/core';
import {
  ColunaSintantica,
  EPSILON,
  Grammar,
  LinhaSintatica,
  Production,
  TabelaSintatica,
} from '../../grammar/grammar.model';
import { lalg } from '../../grammar/LALG';
import { Token } from '../lexical-analysis/lexical-analysis.service';
import { LoggerService } from '../logger/logger.service';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '../errors/errors.service';

export interface FirstList {
  symbol: string;
  first: string[];
}
export interface FollowList {
  symbol: string;
  follow: string[];
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
  /** Pilha usada na análise sintática descendente */
  stack: string[] = [];

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

  private _path: string[] = ['Compilador', 'Análise Sintática'];

  constructor(
    private loggerService: LoggerService,
    private errorService: ErrorsService,
  ) {
    this.selectedGrammar = lalg;

    this.prepare();
  }

  reset(): void {
    this.input = [];
    this.stack = [];
    this.firsts = [];
    this.follows = [];
    this.syntacticTable = new TabelaSintatica();
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
          continue;
        }
        // Se part for <não-terminal>
        if (part.match(/<.+>/g) !== null && part !== symbol.leftSide) {
          let firstsForCurrentPart: Set<string>;

          if (!this.pendingFirstRecursions.includes(part)) {
            // Regra 2: dado um <X> não-terminal que tem uma produção <X> -> <A>,
            // então first(<A>) faz parte de first(<X>)
            firstsForCurrentPart = new Set(
              this.findFirtsFor(part).map((element) => {
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
          if (part.match(/\[\[.+\]\]/g)) continue;

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
              .map((f) => follows.add(f));
            // Regra 3: Se existe uma produção do tipo <A> -> α<X> ou <A> -> α<X>β onde
            // first(β) contém ε, então follow(<X>) deve conter follow(<A>)
            if (firstFromCurrentSymbol.first.includes(EPSILON)) {
              this.findFollowsFor(symbol.leftSide).map((f) => follows.add(f));
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
          this.findFollowsFor(symbol.leftSide).map((f) => follows.add(f));
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
    /** Variável usada para os logs */
    const path = this._path.concat(['parse()']);

    const input = [].concat(ipt);

    /** token representando o final da entrada de tokens */
    const endToken: Token = {
      lexema: '$',
      token: '$',
      col: input[input.length - 1].col,
      row: input[input.length - 1].row,
    };

    input.push(endToken);

    this.stack = [endToken.lexema];
    const root = this.selectedGrammar.productions[0].leftSide;
    this.stack.push(root);

    /** Indica se a análise sintática chegou ao final da entrada com panicMode = true */
    let eof = false;
    /** Indica se a análise sintática está no Modo Pânico */
    let panicMode = false;
    let lastTerminal: Token;

    while (
      this.stack[this.stack.length - 1] !== '$' ||
      input[0].lexema !== '$'
    ) {
      eof = false;
      let currentToken = input[0];
      if (!currentToken) break;

      console.log('stack:', this.stack.join(' | '));
      //console.log('input:', input[0].lexema);
      console.log('input:', input.map((el) => el.lexema).join(' | '));
      console.log('================================');

      //console.log('Current Token', currentToken);

      // TODO: análise semântica
      if (this.stack[this.stack.length - 1].match(/\[\[.+\]\]/g)) {
        continue;
      }

      /*if (
        [
          'número-natural',
          'número-real',
          'identificador-válido',
          'boolean-verdadeiro',
          'boolean-falso',
        ].includes(currentToken.token)
      ) {
        currentToken = {
          ...currentToken,
          lexema: input[0].lexema[0],
        };
      }*/

      if (this.stack[this.stack.length - 1].match(/<.+>/g) !== null) {
        if (this.stack[this.stack.length - 1] === '<identificador>') {
          console.log('identificador esperado');
          if (
            ![
              'identificador-válido',
              'boolean-verdadeiro',
              'boolean-falso',
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
            this.stack.pop();
            lastTerminal = input.shift();
            continue;
          } else {
            console.log(
              'tudo certo, validei',
              currentToken.lexema,
              'manualmente',
            );
          }
          this.stack.pop();
          lastTerminal = input.shift();
          continue;
        } else if (this.stack[this.stack.length - 1] === '<número>') {
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
            this.stack.pop();
            lastTerminal = input.shift();
            continue;
          }
          this.stack.pop();
          lastTerminal = input.shift();
          continue;
        }

        const row = this.syntacticTable.row.find(
          (r) => r.header === this.stack[this.stack.length - 1],
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
          lastTerminal = input.shift();
          this.errorService.add(
            202,
            currentToken.row,
            currentToken.col,
            currentToken.row,
            currentToken.col + currentToken.lexema.length,
            path,
            `Entretanto, "${currentToken.lexema}" (${currentToken.token}) foi encontrado. ${expected} esperado.`,
          );
          continue;
        }
        if (col?.cell[0] === 'TOKEN_SYNC') {
          if (input[0].lexema !== '$') {
            this.stack.pop();
            continue;
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
            eof = true;
            break;
          }
        }
        this.stack.pop();
        if (col.cell[0] === EPSILON) continue;
        /**
         * Inversão da derivação a ser empilhada em stack, para que seja
         * empilhada na ordem correta.
         */
        const invertedDerivation = [];
        for (const e of col?.cell) invertedDerivation.unshift(e);
        this.stack.push(...invertedDerivation);
      } else {
        console.log(
          '>> comparando',
          this.stack[this.stack.length - 1],
          'e',
          currentToken.lexema,
          '<<',
        );
        // O topo da stack é um terminal
        if (this.stack[this.stack.length - 1] === currentToken.lexema) {
          console.log('equals');
          lastTerminal = input.shift();
          this.stack.pop();
        } else {
          console.log(
            'descartando topo da pilha:',
            this.stack[this.stack.length - 1],
          );
          this.stack.pop();
        }
      }
    }
    if (this.stack[this.stack.length - 1] === '$' && input[0].lexema === '$') {
      this.loggerService.log(
        'Análise Sintática concluída com sucesso. Texto-fonte foi validado.',
        'stp',
        path,
        1,
      );
    } else {
      if (!eof) {
        this.errorService.add(
          203,
          input[0].row,
          input[0].col,
          input[0].row,
          input[0].col + input[0].lexema.length,
          path,
          this.stack[this.stack.length - 1] === '$'
            ? undefined
            : `${this.stack[this.stack.length - 1]} esperado.`,
        );
      }
    }
  }
}
