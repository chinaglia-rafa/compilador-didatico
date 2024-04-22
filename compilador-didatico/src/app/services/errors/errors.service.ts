import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ERROR_CODES } from '../../error-codes';

/** Representa um erro ocorrido durante o processo de compilação */
export interface Error {
  /** Código do erro */
  errorCode: number;
  /** Descrição do erro de forma legível ao usuário */
  description: string;
  /** linha onde o erro começa */
  startRow: number;
  /** coluna onde o erro começa */
  startCol: number;
  /** linha onde o erro termina */
  endRow: number;
  /** coluna onde o erro termina */
  endCol: number;
  /** caminho de onde o erro surgiu */
  path: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  /** lista de erros ocorridos durante a compilação */
  errors$ = new BehaviorSubject<Error[]>([]);
  errorDescripions: { [key: string]: string } = {};

  constructor() {
    // Carrega cada erro e sua descrição
    Object.values(ERROR_CODES).map(
      (err) => (this.errorDescripions[err.code] = err.desc),
    );
  }

  /** Limpa os erros registrados */
  reset(): void {
    this.errors$.next([]);
  }

  /** Adiciona um novo erro */
  add(
    errorCode: number,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    path: string[],
  ): void {
    const err: Error = {
      errorCode,
      description: this.parseDescription(errorCode),
      startRow,
      startCol,
      endRow,
      endCol,
      path,
    };
    this.errors$.next([...this.errors$.value, err]);
  }

  parseDescription(errorCode: number): string {
    return `(${errorCode}) ${this.errorDescripions[errorCode]}`;
  }
}
