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
  currentScope: string = 'global';
  blocks: string[] = [];
  currentLexicalLevel: number = 0;
  mode: string;
  /** lista de identificadores acumulados para receber o mesmo tipo */
  acc: number[] = [];
  count$ = new BehaviorSubject<number>(0);
  errors$ = new BehaviorSubject<number>(0);

  constructor(
    private symbols: SymbolsTableService,
    private errorService: ErrorsService,
  ) {}

  reset(): void {
    this.currentType = '';
    this.currentScope = 'global';
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

  setScope(scope: string): void {
    this.currentScope = scope;
  }

  pushBlock(block: string): void {
    console.log('current block list BEFORE', this.blocks.join('|'));
    console.log('Novo bloco:', block);
    this.blocks.push(block);
    if (block !== 'begin') this.setScope(block);
    console.log('current block list AFTER', this.blocks.join('|'));
  }

  popBlock(): void {
    console.log('current block list BEFORE', this.blocks.join('|'));
    const a = this.blocks.pop();
    console.log('Bloco fechado:', a);
    if (a !== 'begin') this.setScope(a);
    console.log('current block list AFTER', this.blocks.join('|'));
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
      scope: this.currentScope,
      category: this.currentCategory,
      passedAs: this.currentPassedAs,
    });
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

    if (!symbol || !symbol.type || symbol.type === '') {
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
      this.symbols.update(token.symbolIndex, { used: true });
    }
  }

  nextIdentifiersCount() {
    this.count$.next(this.symbols.getIdentifiersCount());
  }
}
