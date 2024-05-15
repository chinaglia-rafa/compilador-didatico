/** Facilita o uso do carcatere "vazio" quando necessário */
export const EPSILON = 'ε';

export class Grammar {
  /** nome da gramática para referência */
  name: string;
  /** Lista de produçõesqu e forma a linguagem */
  productions: Production[] = [];

  constructor(name: string, productions: Production[]) {
    this.name = name;
    this.productions = productions;
  }
}

export class Production {
  /**
   * Lado esquerdo da produção, ou seja: o símbolo que a origina.
   * Para símbolos não-terminais, utilizar <nome_do_simbolo>.
   */
  leftSide: string;
  /**
   * Lado direito da produção, ou seja: as opções de derivação de leftSide.
   * Para derivações de símbolos terminais, rightSide === [].
   *
   * ALERTA: O uso do não-terminal <CONVERT_TO_FINAL> faz a compilação tratar
   * o símbolo do lado esquerdo como terminal e é usada em não-terminais cujo
   * processamento e / ou comportamento é melhor tratado usando meios que não
   * a estrutura da própria gramática (como identificadores, letras e números)
   */
  rightSide: string[][];

  constructor(leftSide: string, rightSide: string[][]) {
    if (leftSide === '')
      throw 'O lado esquerdo de uma produção não pode ser vazio!';

    this.leftSide = leftSide;

    if (leftSide.match(/^<.+>$/).length === 0) this.rightSide = [];
    else this.rightSide = rightSide;
  }
}

/**
 *  Tabela sintática responsável por ser a base para a
 *  validação de tokens.
 */
export class TabelaSintatica {
  /** Cada linha da tabela sintática, contendo um <não-terminal> como cabeçalho e cada terminal como coluna */
  row: LinhaSintatica[] = [];
}

export class LinhaSintatica {
  /** nome do símbolo <não-terminal> do qual células da linha derivam. */
  header: string;
  /** Lista de colunas da tabela sintática */
  col: ColunaSintantica[] = [];

  constructor(header: string) {
    this.header = header;
  }
}

/** Uma coluna da tabela sintática */
export class ColunaSintantica {
  /** nome do símbolo terminal que será alcançado ao derivar cell */
  header: string;
  /** célula da tabela sintática, que contém a derivação que leva ao símbolo terminal em header.  */
  cell: string[] = [];

  constructor(header: string) {
    this.header = header;
  }
}
