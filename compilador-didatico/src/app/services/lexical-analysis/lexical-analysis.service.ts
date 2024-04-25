import { Injectable, OnInit } from '@angular/core';
import { LoggerService } from '../logger/logger.service';
import { BehaviorSubject } from 'rxjs';
import {
  LexicalAnalysisError,
  LexicalAnalysisInput,
} from './lexical-analysis.worker';
import { SymbolsTableService } from '../symbols-table/symbols-table.service';

/** Interface representando cada token processada */
export interface Token {
  /** trecho capturado do código e entendido como uma token */
  lexema: string;
  /** qual a classificação do lexema no grupo de tokens válidas da linguagem LALG */
  token: string;
  /** linha onde a token está localizada */
  row: number;
  /** coluna onde começa o lexema no código-fonte */
  col: number;
  /** índice da tabela de símbolos que referencia essa token */
  symbolIndex?: number;
}

/** Array com os caracteres que compõem o alfabeto válido do LALG */
export const ALFABETO =
  '0987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_;.,():=<>+-*{}/[]'.split(
    '',
  );

/** Array com os caracteres que são capazes de dividir tokens */
export const DIVIDERS = [
  ' ',
  ';',
  ',',
  '(',
  ')',
  ':',
  '=',
  '<',
  '>',
  '+',
  '-',
  '*',
  '{',
  '}',
  '/',
  '\t',
];

/** Lista de palavras reservadas válidas */
export const RESERVED_WORDS = [
  { token: 'program', desc: 'programa' },
  { token: ';', desc: 'pev' },
  { token: '.', desc: 'ponto-final' },
  { token: ',', desc: 'vírgula' },
  { token: 'procedure', desc: 'procedimento' },
  { token: '(', desc: 'abre-parênteses' },
  { token: ')', desc: 'fecha-parênteses' },
  { token: 'var', desc: 'nova-variável' },
  { token: ':', desc: 'dois-pontos' },
  { token: 'int', desc: 'tipo-inteiro' },
  { token: 'boolean', desc: 'tipo-booleano' },
  { token: 'read', desc: 'entrada-dado' },
  { token: 'write', desc: 'saida-dado' },
  { token: 'true', desc: 'boolean-verdadeiro' },
  { token: 'false', desc: 'boolean-falso' },
  { token: 'begin', desc: 'inicio-bloco' },
  { token: 'end', desc: 'fim-bloco' },
  { token: ':=', desc: 'atribuição' },
  { token: 'if', desc: 'condicional-se' },
  { token: 'then', desc: 'condicional-então' },
  { token: 'else', desc: 'condicional-se-não' },
  { token: 'while', desc: 'repetição-enquanto' },
  { token: 'do', desc: 'repetição-faça' },
  { token: '=', desc: 'comparação-igual' },
  { token: '<>', desc: 'comparação-diferente' },
  { token: '<', desc: 'comparação-menor' },
  { token: '<=', desc: 'comparação-menor-igual' },
  { token: '>=', desc: 'comparação-maior-igual' },
  { token: '>', desc: 'comparação-maior' },
  { token: '+', desc: 'operação-soma' },
  { token: '-', desc: 'operação-subtração' },
  { token: 'or', desc: 'operação-ou' },
  { token: '*', desc: 'operação-produto' },
  { token: 'div', desc: 'operação-divisão' },
  { token: 'and', desc: 'operação-e' },
  { token: 'not', desc: 'operação-não' },
  { token: '[', desc: 'abre-colchete' },
  { token: ']', desc: 'fecha-colchete' },
];

@Injectable({
  providedIn: 'root',
})
export class LexicalAnalysisService implements OnInit {
  tokens$ = new BehaviorSubject<Token[]>([]);
  /** emite valores booleanos indicando se a análise léxica está executando ou não */
  loading$ = new BehaviorSubject<boolean>(false);

  errors$ = new BehaviorSubject<LexicalAnalysisError[]>([]);

  constructor(
    private logger: LoggerService,
    private symbolsTable: SymbolsTableService,
  ) {}

  ngOnInit(): void {}

  process(tokens: Token[]): Token[] {
    const a = tokens.map((token) => {
      if (
        ['identificador-válido', 'número-real', 'número-natural'].includes(
          token.token,
        )
      ) {
        token.symbolIndex = this.symbolsTable.add(token.lexema, token.token);
      }
      return token;
    });
    return a;
  }

  scan(code: string): void {
    this.loading$.next(true);

    this.symbolsTable.reset();

    if (typeof Worker !== 'undefined') {
      const worker = new Worker(
        new URL('./lexical-analysis.worker', import.meta.url),
      );
      worker.onmessage = ({ data }) => {
        console.log(data);
        const processedTokens = this.process(data.tokens);
        this.errors$.next(data.errors);
        this.tokens$.next(processedTokens);
        this.loading$.next(false);
      };

      const message: LexicalAnalysisInput = {
        alphabet: ALFABETO,
        reservedWords: RESERVED_WORDS,
        dividers: DIVIDERS,
        oneLineComment: '/',
        code,
      };

      worker.postMessage(message);
    } else {
      this.logger.log(
        'Workers não são suportados no seu navegador. Você precisa de um mais novo.',
        'err',
        ['Compilador', 'análise léxica'],
        0,
      );
    }
  }
}
