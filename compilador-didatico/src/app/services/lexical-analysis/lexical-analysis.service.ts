import { Injectable, OnInit } from '@angular/core';
import { LoggerService } from '../logger/logger.service';

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
  symbolIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class LexicalAnalysisService implements OnInit {
  tokens: Token[] = [];

  constructor(private logger: LoggerService) {}

  ngOnInit(): void {
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(
        new URL('./lexical-analysis.worker', import.meta.url),
      );
      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
      worker.postMessage('hello');
    } else {
      this.logger.log(
        'Workers não são suportados no seu navegador. Você precisa de um mais novo.',
        'err',
        ['Compilador', 'análise léxica'],
        0,
      );
    }
  }

  scan(): void {
    console.log('scan!');
  }
}
