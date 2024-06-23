import { Injectable } from '@angular/core';
import { SymbolsTableService } from '../symbols-table/symbols-table.service';
import { Token } from '../lexical-analysis/lexical-analysis.service';
import { ErrorsService } from '../errors/errors.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SemanticAnalysisService {
  currentType: string;
  currentScope: string = 'global';
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
    this.mode = '';
    this.acc = [];
    this.errors$.next(0);
  }

  setType(type: string): void {
    this.currentType = type;
  }

  setScope(scope: string): void {
    this.currentScope = scope;
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
    });
  }

  done(): void {
    this.currentType = '';
    this.setMode('');
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
