import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { NgScrollbar } from 'ngx-scrollbar';
import { Observable, map } from 'rxjs';
import {
  LexicalAnalysisService,
  Token,
} from '../../../services/lexical-analysis/lexical-analysis.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ErrorItemComponent } from '../../../components/error-item/error-item.component';
import { Error, ErrorsService } from '../../../services/errors/errors.service';

@Component({
  selector: 'app-semantic-analysis',
  standalone: true,
  imports: [NgScrollbar, AsyncPipe, CommonModule, ErrorItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './semantic-analysis.component.html',
  styleUrl: './semantic-analysis.component.scss',
})
export class SemanticAnalysisComponent implements OnInit {
  identifiers$ = new Observable<Token[]>();
  errors$ = new Observable<Error[]>();

  constructor(
    private lexicalAnalysisService: LexicalAnalysisService,
    private errorsService: ErrorsService,
  ) {}

  ngOnInit(): void {
    this.identifiers$ = this.lexicalAnalysisService.tokens$.pipe(
      map((tokens: Token[]) =>
        [
          {
            lexema: 'true',
            token: 'identificador-válido',
            row: 0,
            col: 0,
            symbolIndex: 0,
          } as Token,
          {
            lexema: 'false',
            token: 'identificador-válido',
            row: 0,
            col: 0,
            symbolIndex: 1,
          } as Token,
        ].concat(
          tokens.filter((token) => token.token === 'identificador-válido'),
        ),
      ),
    );

    this.errors$ = this.errorsService.errors$.pipe(
      map((errors) =>
        errors.filter((e) => e.path.includes('Análise Semântica')),
      ),
    );
  }
}
