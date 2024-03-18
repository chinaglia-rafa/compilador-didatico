import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LogEntry {
  /** Descrição do log */
  text: string;
  /**
   * Hierarquia de onde o log veio. Ex.:
   * logger => add() = ['logger', 'add()']
   * compiler => lexicalAnalysis => tokenize() = ['compiler', 'lexicalAnalysis', 'tokenize()']
   */
  path: string[];
  /**
   * Tipo de log:
   *     - [dev] desenvolvimento
   *     - [stp] passo do algoritmo
   *     - [edu] log elucidativo ou didático
   *     - [err] erro no algoritmo
   */
  type: string;
  /**
   * Nível de log (níveis mais altos são mais verbosos)
   *     - 0 log básico (logs essenciais para a compreensão do algoritmo)
   *     - 1 log detalhado (logs que incrementam a compreensão do algoritmo)
   *     - 2 log minucioso (logs de desenvolvimento, debug ou coisas dessa natureza)
   */
  level: number;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  /** Lista de logs visíveis no sistema */
  logs$ = new BehaviorSubject<LogEntry[]>([]);

  /** Nível padrão de visualização de logs */
  level = 2;

  /**
   * Limpa todo o histórico de logs
   */
  clear(): void {
    this.logs$.next([]);
  }

  /**
   * Atribui um novo valor de nível de logs
   *
   * @param level Nível entre 0 e 2 a ser atribuído
   */
  setLevel(level: number): void {
    if (level < 0 || level > 2) {
      console.log('Erro: nível de log desconhecido');
      return;
    }

    this.level = level;
    console.log('novo nivel de logs é:', level);
  }

  /**
   * Adiciona um novo log
   *
   * @param str Texto a ser logado
   * @param type Tipo de log: 'dev', 'stp', 'edu', 'err'
   * @param path Caminho de origem do erro
   * @param level Nível do erro entre 0 e 2
   */
  log(str: string, type: string, path: string[] = [], level: number = 0): void {
    if (!['dev', 'stp', 'edu', 'err'].includes(type)) {
      console.log('Erro: tipo de log desconhecido');
      return;
    }
    if (level < 0 || level > 2) {
      console.log('Erro: nível de log desconhecido');
      return;
    }

    if (this.level < level) return;

    this.logs$.next([
      ...this.logs$.value,
      {
        text: str,
        path: path,
        type: type,
        level: level,
      },
    ]);
  }
}
