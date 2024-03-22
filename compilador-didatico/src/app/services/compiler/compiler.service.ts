import { Injectable, OnInit } from '@angular/core';
import { LexicalAnalysisService } from '../lexical-analysis/lexical-analysis.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompilerService implements OnInit {
  constructor(private lexicalAnalysisService: LexicalAnalysisService) {
    this.lexicalAnalysisService.loading$.subscribe((loading) => {
      const states = this.loading$.value;
      states[1] = loading;
      this.loading$.next(states);
    });
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

  ngOnInit(): void {}

  /**
   * Inicia o processo de compilação do código
   *
   * @param code código-fonte a ser compilado
   */
  compile(code: string): void {
    this.lexicalAnalysisService.scan(code);
  }
}
