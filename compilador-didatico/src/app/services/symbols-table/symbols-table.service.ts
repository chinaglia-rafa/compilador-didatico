import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum SymbolPassedAs {
  Value = 'valor',
  Reference = 'referência',
}

export enum SymbolCategory {
  Variable = 'variável',
  FormalParam = 'parâmetro-formal',
  Procedure = 'procedimento',
  Reference = 'referência',
}

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
  /** Categoria de símbolo (variável, parâmetro formal, nome de procedimento, etc) */
  category?: SymbolCategory;
  /** Indica se o símbolo foi passado por valor ou referência */
  passedAs?: SymbolPassedAs;
  /** Nível léxico onde o símbolo foi declarado */
  lexicalLevel?: number;
  /** Número de parâmetros formais do procedimento */
  paramsCount?: number;
  /** Rótulo interno do parâmetro */
  label?: string;
  /** Lista de tipos de passagem de cada parâmetro formal do procedimento */
  paramsPassedAs?: SymbolPassedAs[];
  /** Linha onde o símbolo se encontra no código-fonte */
  row: number;
  /** Coluna onde o símbolo se encontra no código-fonte */
  col: number;
}

/** Dados que podem ser atualizados em um símbolo */
export interface UpdateData {
  type?: string;
  scope?: string;
  value?: number;
  used?: boolean;
  category?: SymbolCategory;
  passedAs?: SymbolPassedAs;
  lexicalLevel?: number;
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
      lexicalLevel: 0,
      used: true,
      category: SymbolCategory.Variable,
      row: 0,
      col: 0,
    },
    {
      lexema: 'false',
      type: 'boolean',
      scope: 'global',
      lexicalLevel: 0,
      used: true,
      category: SymbolCategory.Variable,
      row: 0,
      col: 0,
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
   * @param category categoria do símbolo
   * @param passedAs tipo de passagem de variável (valor ou referencia)
   * @param lexicalLevel nível léxico do elemento
   * @param row linha onde o símbolo está no código
   * @param col coluna onde o símbolo está no código
   * @returns índice da tabela de símbolos que contém o novo item adicionado.
   */
  add(
    lexema: string,
    tokenType: string,
    category: SymbolCategory,
    passedAs: SymbolPassedAs = null,
    lexicalLevel: number,
    row: number,
    col: number,
  ): number {
    const newTableItem: TableItem = {
      lexema: '',
      scope: '',
      used: false,
      category,
      passedAs,
      lexicalLevel,
      row,
      col,
    };

    newTableItem.lexema = lexema;
    newTableItem.lexicalLevel = lexicalLevel;

    if (tokenType === 'número-natural') {
      newTableItem.value = parseInt(lexema);
      newTableItem.type = 'int';
    } else if (tokenType === 'número-real') {
      newTableItem.value = parseFloat(lexema);
      newTableItem.type = 'float';
    } else if (tokenType === 'identificador-válido') {
      /*const index = this.table$.value.findIndex(
        (el) => el.lexema === lexema && el.lexicalLevel === lexicalLevel,
      );
      if (index >= 0) return index;*/
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

  /**
   * Busca um símbolo com base em seu nome e escopo
   *
   * @param name Nome do símbolo cuja declaração está sendo buscada
   * @param scope Escopo do símbolo
   */
  getByNameAndScope(name: string, scope: string): [TableItem, number] {
    const i = this.table$.value.findIndex(
      (el) => el.scope === scope && el.lexema === name,
    );
    return [this.get(i), i];
  }

  update(index: number, updateData: UpdateData): void {
    if (updateData.type !== undefined) this.get(index).type = updateData.type;
    if (updateData.scope !== undefined)
      this.get(index).scope = updateData.scope;
    if (updateData.value !== undefined)
      this.get(index).value = updateData.value;
    if (updateData.used !== undefined) this.get(index).used = updateData.used;
    if (updateData.category !== undefined)
      this.get(index).category = updateData.category;
    if (updateData.passedAs !== undefined)
      this.get(index).passedAs = updateData.passedAs;
    if (updateData.lexicalLevel !== undefined)
      this.get(index).lexicalLevel = updateData.lexicalLevel;
  }

  reset(): void {
    this.table$.next([
      {
        lexema: 'true',
        type: 'boolean',
        scope: 'global',
        lexicalLevel: 0,
        used: true,
        category: SymbolCategory.Variable,
        row: 0,
        col: 0,
      },
      {
        lexema: 'false',
        type: 'boolean',
        scope: 'global',
        lexicalLevel: 0,
        used: true,
        category: SymbolCategory.Variable,
        row: 0,
        col: 0,
      },
    ]);

    this.count$.next(this.table$.value.length);
  }

  getIdentifiersCount(): number {
    return this.table$.value.filter((el) => el?.scope != '').length;
  }
}
