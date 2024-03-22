import { Injectable, OnInit } from '@angular/core';
import { LoggerService } from '../logger/logger.service';
import { BehaviorSubject } from 'rxjs';
import {
  LexicalAnalysisError,
  LexicalAnalysisInput,
} from './lexical-analysis.worker';

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

@Injectable({
  providedIn: 'root',
})
export class LexicalAnalysisService implements OnInit {
  tokens$ = new BehaviorSubject<Token[]>([]);
  /** emite valores booleanos indicando se a análise léxica está executando ou não */
  loading$ = new BehaviorSubject<boolean>(false);

  /** Array com os caracteres que compõem o alfabeto válido do LALG */
  private alfabeto =
    '0987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_;.,():=<>+-*{}/[]'.split(
      '',
    );
  /** Array com os caracteres que são capazes de dividir tokens */
  private dividers = [
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
  private reservedWords = [
    { token: 'program', desc: 'programa' },
    { token: ';', desc: 'ponto-e-vírgula' },
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

  errors$ = new BehaviorSubject<LexicalAnalysisError[]>([]);

  constructor(private logger: LoggerService) {}

  ngOnInit(): void {}

  scan(code: string): void {
    this.loading$.next(true);

    if (typeof Worker !== 'undefined') {
      const worker = new Worker(
        new URL('./lexical-analysis.worker', import.meta.url),
      );
      worker.onmessage = ({ data }) => {
        console.log(data);
        this.errors$.next(data.errors);
        this.tokens$.next(data.tokens);
        this.loading$.next(false);
      };

      const message: LexicalAnalysisInput = {
        alphabet: this.alfabeto,
        reservedWords: this.reservedWords,
        dividers: this.dividers,
        oneLineComment: '//',
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
