export const ERROR_CODES = {
  /** O caractere encontrado não está no alfabeto da linguagem */
  LEX_NOT_IN_ALPHABET: {
    code: 100,
    desc: 'Caractere não encontrado no alfabeto',
  },
  /** A token é um número real mal formatado */
  LEX_MALFORMED_FLOAT: {
    code: 101,
    desc: 'Número real mal-formatado encontrado.',
  },
  /** A token é um número muito grande */
  LEX_NUMBER_TOO_BIG: {
    code: 102,
    desc: 'Número excede tamanho máximo permitido.',
  },
  /** A token é um identificador muito grande */
  LEX_IDENTIFIER_TOO_BIG: {
    code: 103,
    desc: 'Identificador excede tamanho máximo permitido.',
  },
  /** A token é um identificador inválido */
  LEX_INVALID_IDETIFIER: {
    code: 104,
    desc: 'Identificador inválido encontrado.',
  },
  /** O arquivo acabou de forma inexperada. Havia algo a ser fechado, provavelmente. */
  LEX_UNEXPECTED_EOF: {
    code: 105,
    desc: 'O arquivo acabou de forma inesperada. Talvez haja um } faltante.',
  },
};
