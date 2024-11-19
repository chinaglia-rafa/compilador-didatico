import { Injectable } from '@angular/core';
import {
  SymbolCategory,
  SymbolPassedAs,
  SymbolsTableService,
} from '../symbols-table/symbols-table.service';
import { Token } from '../lexical-analysis/lexical-analysis.service';
import { ErrorsService } from '../errors/errors.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SemanticAnalysisService {
  currentType: string;
  currentCategory: SymbolCategory;
  /** Indica se a variável é passada por valor ou referência */
  currentPassedAs: SymbolPassedAs;
  currentScope: string[] = ['global'];
  blocks: string[] = [];
  currentLexicalLevel: number = 0;
  mode: string;
  /** lista de identificadores acumulados para receber o mesmo tipo */
  acc: number[] = [];
  count$ = new BehaviorSubject<number>(0);
  errors$ = new BehaviorSubject<number>(0);

  /**
   * Esse boolean é usado para que seja ignorado o primeiro begin encontrado
   * após a declaração de uma procedure (isso porque o end que corresponde a esse)
   * begin é, ao mesmo tempo, o end da procedure.
   */
  expectingProcedureBegin = false;

  constructor(
    private symbols: SymbolsTableService,
    private errorService: ErrorsService,
  ) {}

  reset(): void {
    this.currentType = '';
    this.currentScope = ['global'];
    this.blocks = [];
    this.mode = '';
    this.acc = [];
    this.errors$.next(0);
    this.count$.next(0);
  }

  setType(type: string): void {
    this.currentType = type;
  }

  setCategory(category: SymbolCategory): void {
    this.currentCategory = category;
  }

  setPassedAs(passedAs: SymbolPassedAs): void {
    this.currentPassedAs = passedAs;
  }

  setScope(scope: string[]): void {
    this.expectingProcedureBegin = true;
    this.currentScope = scope;
  }

  pushBlock(block: string): void {
    if (block !== 'begin') {
      // quando o bloco não é um begin, pode empilhá-lo diretamente
      this.blocks.push(block);

      this.setScope(this.blocks.filter((el) => el !== 'begin'));
    } else {
      // Caso não se esteje esperando o begin que vem logo após
      // a token procedure, então empilha o elemento
      if (!this.expectingProcedureBegin) this.blocks.push(block);
      this.expectingProcedureBegin = false;
    }
  }

  popBlock(): void {
    const a = this.blocks.pop();
    if (a !== 'begin')
      this.setScope(this.blocks.filter((el) => el !== 'begin'));
    // this.setScope(this.blocks.at(-1));
  }

  getMode(): string {
    return this.mode;
  }

  setMode(mode: string): void {
    if (mode === 'declaracao_de_variaveis') {
      this.mode = 'declaracao_de_variaveis';
    } else if (mode === '') {
      this.mode = '';
    } else if (mode === 'nome_programa') {
      this.mode = 'nome_programa';
    } else if (mode === 'declaracao_de_procedimento') {
      this.mode = 'declaracao_de_procedimento';
    } else if (mode === 'parametros_formais') {
      this.mode = 'parametros_formais';
    } else {
      console.log('MODO DESCONHECIDO.');
    }
  }

  accumulate(index: number): void {
    this.acc.push(index);
  }

  consolidate(): void {
    while (this.acc.length > 0) {
      const el = this.acc.pop();
      this.addIdentifier(el);
    }
  }

  addIdentifier(index: number): void {
    if (
      this.mode !== 'declaracao_de_variaveis' &&
      this.mode !== 'nome_programa' &&
      this.mode !== 'declaracao_de_procedimento' &&
      this.mode !== 'parametros_formais'
    )
      return;
    if (index === undefined) return;

    this.symbols.update(index, {
      type: this.currentType,
      scope: this.currentScope.at(-1),
      category: this.currentCategory,
      passedAs: this.currentPassedAs,
    });
    // O nome do programa é sempre já usado
    if (this.mode === 'nome_programa')
      this.symbols.update(index, { used: true });
  }

  done(): void {
    this.currentType = '';
    this.currentCategory = null;
    this.currentPassedAs = null;
    this.setMode('');
  }

  enterNewLexicalLevel(): number {
    this.currentLexicalLevel++;

    return this.currentLexicalLevel;
  }

  checkIdentifier(token: Token): void {
    const path = ['Compilador', 'Análise Semântica', 'checkIdentifier()'];
    const symbol = this.symbols.get(token.symbolIndex);

    // Procura pela declaração da variável nos escopos acessíveis
    let declaration, index;
    for (let i = this.currentScope.length - 1; i >= 0; i--) {
      [declaration, index] = this.symbols.getByNameAndScope(
        symbol.lexema,
        this.currentScope.at(i),
      );
      if (declaration) break;
    }

    if (!symbol || !declaration) {
      this.errorService.add(
        300,
        token.row,
        token.col,
        token.row,
        token.col + token.lexema.length,
        path,
        symbol.lexema,
      );
      this.errors$.next(this.errors$.value + 1);
    } else {
      // Atualiza o símbolo em questão
      this.symbols.update(token.symbolIndex, {
        used: true,
        category: SymbolCategory.Reference,
        scope: this.currentScope.at(-1),
        type: declaration.type,
      });
      // Atualiza sua declaração
      this.symbols.update(index, {
        used: true,
      });
    }
  }

  nextIdentifiersCount() {
    this.count$.next(this.symbols.getIdentifiersCount());
  }

  checkUnusedIdentifiers(): void {
    const path = [
      'Compilador',
      'Análise Semântica',
      'checkUnusedIdentifiers()',
    ];
    for (const row of this.symbols.table$.value) {
      if (row.used === false) {
        this.errorService.add(
          301,
          row.row,
          row.col,
          row.row,
          row.col + row.lexema.length,
          path,
          row.lexema,
        );
        this.errors$.next(this.errors$.value + 1);
      }
    }
  }
}
