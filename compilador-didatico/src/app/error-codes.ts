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
  SYN_VALUE_EXPECTED: {
    code: 200,
    desc: 'Identificador válido ou valor experado.',
  },
  SYN_NUMBER_EXPECTED: {
    code: 201,
    desc: 'Número esperado não foi encontrado.',
  },
  SYN_UNEXPECTED_TOKEN: {
    code: 202,
    desc: 'Trecho inesperado encontrado.',
  },
  SYN_UNEXPECTED_EOF: {
    code: 203,
    desc: 'O arquivo acabou de forma inesperada. Token esperada não foi encontrada.',
  },
  SEM_VARIABLE_NOT_DECLARED: {
    code: 300,
    desc: 'A seguinte variável foi utilizada antes de sua declaração neste escopo:',
  },
  SEM_VARIABLE_NOT_USED: {
    code: 301,
    desc: 'A seguinte variável foi declarada, mas não foi utilizada:',
  },
};
