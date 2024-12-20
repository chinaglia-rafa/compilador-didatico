import { Injectable, OnInit } from '@angular/core';
import { LexicalAnalysisService } from '../lexical-analysis/lexical-analysis.service';
import { BehaviorSubject, first, skip, take } from 'rxjs';
import { ErrorsService } from '../errors/errors.service';
import { SyntacticAnalysisService } from '../syntactic-analysis/syntactic-analysis.service';
import { SemanticAnalysisService } from '../semantic-analysis/semantic-analysis.service';
import { SymbolsTableService } from '../symbols-table/symbols-table.service';

@Injectable({
  providedIn: 'root',
})
export class CompilerService implements OnInit {
  constructor(
    private lexicalAnalysisService: LexicalAnalysisService,
    private syntacticAnalysisService: SyntacticAnalysisService,
    private semanticAnalysisService: SemanticAnalysisService,
    private symbolsTable: SymbolsTableService,
    private errorsService: ErrorsService,
  ) {
    this.lexicalAnalysisService.loading$.subscribe((loading) => {
      const states = this.loading$.value;
      states[1] = loading;
      this.loading$.next(states);
    });
    this.syntacticAnalysisService.loading$.subscribe((loading) => {
      const states = this.loading$.value;
      states[3] = loading;
      this.loading$.next(states);
    });

    this.lexicalAnalysisService.errors$.subscribe((errors) => {
      this.errorsService.reset();
      if (!errors) return;
      for (const error of errors) {
        this.errorsService.add(
          error.errorCode,
          error.startRow,
          error.startCol,
          error.endRow,
          error.endCol,
          ['Compilador', 'Análise léxica'],
        );
      }
    });

    /*setTimeout(() => {
      const c = `

// teste
{
  teste
  teste
  teste!
}
program teste;
  int alfa, beta;
  boolean omega;
  procedure soma(um, dois: int; tres: boolean);
  begin
    um := um + dois;
    end;
procedure sub(um, dois: int; tres: boolean);
  begin
    if (um = 1) then begin
      dois := dois;
    end;
    um := um + dois;
    end;

  begin
      alfa:= false;
      beta:= 1 + 1;
  end.
`;
      this.compile(c);
    }, 1000);*/
  }

  /** Observable que emite booleanos indicando quais partes da compilação estão carregando */
  loading$ = new BehaviorSubject<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  /** contagem de linhas sendo processadas na compilação */
  linesCount$ = new BehaviorSubject<number>(0);

  ngOnInit(): void {}
  updateLineCount(code: string): void {
    if (code === '') this.linesCount$.next(0);
    else this.linesCount$.next(code.split('\n').length);
  }

  /**
   * Inicia o processo de compilação do código
   *
   * @param code código-fonte a ser compilado
   */
  compile(code: string): void {
    this.updateLineCount(code);
    this.syntacticAnalysisService.autoMode = true;
    this.lexicalAnalysisService.scan(code);
    this.lexicalAnalysisService.tokens$
      .pipe(skip(1), take(1))
      .subscribe((tokens) => {
        if (!tokens || tokens.length === 0) return;
        this.syntacticAnalysisService.parse(tokens);
      });
  }

  resetCompilation(): void {
    this.lexicalAnalysisService.reset();
    this.syntacticAnalysisService.reset();
    this.semanticAnalysisService.reset();
    this.symbolsTable.reset();
  }
}
