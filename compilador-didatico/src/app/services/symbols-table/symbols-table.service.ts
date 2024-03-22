import { Injectable } from '@angular/core';

/** Linha da tabela de símbolos */
export interface TableItem {
  /** conteúdo (lexema) que uma dada token representa */
  lexema: string;
  /** valor avaliado da token, quando é o caso */
  value?: number;
  /** tipo de dado, quando presente */
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SymbolsTableService {
  table: TableItem[] = [];

  constructor() {}

  /**
   * Adiciona um novo item na tabela de símbolos
   *
   * @param lexema conteúdo da token a ser registrada
   * @param tokenType tipo de token
   * @returns índice da tabela de símbolos que contém o novo item adicionado.
   */
  add(lexema: string, tokenType: string): number {
    const newTableItem: TableItem = {
      lexema: '',
    };

    newTableItem.lexema = lexema;

    if (tokenType === 'numero-natural') {
      newTableItem.value = parseInt(lexema);
      newTableItem.type = 'int';
    } else if (tokenType === 'numero-real') {
      newTableItem.value = parseFloat(lexema);
      newTableItem.type = 'float';
    }

    this.table.push(newTableItem);

    return this.table.length - 1;
  }

  /**
   * Recupera um item da tabela de símbolos
   *
   * @param index índice a ser buscado
   * @returns TableItem com o item ou null caso não seja encontrado.
   */
  get(index: number): TableItem {
    return this.table[index] || null;
  }
}
