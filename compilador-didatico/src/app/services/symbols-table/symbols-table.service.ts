import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Linha da tabela de símbolos */
export interface TableItem {
  /** conteúdo (lexema) que uma dada token representa */
  lexema: string;
  /** valor avaliado da token, quando é o caso */
  value?: number;
  /** tipo de dado, quando presente */
  type?: string;
  /** Escopo onde a variável existe */
  scope: string;
  /** Indica se a variável foi usada */
  used?: boolean;
}

/** Dados que podem ser atualizados em um símbolo */
export interface UpdateData {
  type?: string;
  scope?: string;
  value?: number;
  used?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SymbolsTableService {
  table$ = new BehaviorSubject<TableItem[]>([
    {
      lexema: 'true',
      type: 'boolean',
      scope: 'global',
      used: true,
    },
    {
      lexema: 'false',
      type: 'boolean',
      scope: 'global',
      used: true,
    },
  ]);
  /** tamanho da tabela de símbolos */
  count$ = new BehaviorSubject<number>(0);

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
      scope: '',
      used: false,
    };

    newTableItem.lexema = lexema;

    if (tokenType === 'número-natural') {
      newTableItem.value = parseInt(lexema);
      newTableItem.type = 'int';
    } else if (tokenType === 'número-real') {
      newTableItem.value = parseFloat(lexema);
      newTableItem.type = 'float';
    } else if (tokenType === 'identificador-válido') {
      const index = this.table$.value.findIndex((el) => el.lexema === lexema);
      if (index >= 0) return index;
    }
    this.table$.next([...this.table$.value, newTableItem]);

    this.count$.next(this.table$.value.length);

    return this.table$.value.length - 1;
  }

  /**
   * Recupera um item da tabela de símbolos
   *
   * @param index índice a ser buscado
   * @returns TableItem com o item ou null caso não seja encontrado.
   */
  get(index: number): TableItem {
    return this.table$.value[index] || null;
  }

  update(index: number, updateData: UpdateData): void {
    if (updateData.type !== undefined) this.get(index).type = updateData.type;
    if (updateData.scope !== undefined)
      this.get(index).scope = updateData.scope;
    if (updateData.value !== undefined)
      this.get(index).value = updateData.value;
    if (updateData.used !== undefined) this.get(index).used = updateData.used;
  }

  reset(): void {
    this.table$.next([
      {
        lexema: 'true',
        type: 'boolean',
        scope: 'global',
        used: true,
      },
      {
        lexema: 'false',
        type: 'boolean',
        scope: 'global',
        used: true,
      },
    ]);
  }

  getIdentifiersCount(): number {
    return this.table$.value.filter((el) => el?.scope != '').length;
  }
}
