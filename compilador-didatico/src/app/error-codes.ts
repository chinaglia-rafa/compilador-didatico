export const ERROR_CODES = {
  /** O caractere encontrado não está no alfabeto da linguagem */
  LEX_NOT_IN_ALPHABET: 100,
  /** A token é um número real mal formatado */
  LEX_MALFORMED_FLOAT: 101,
  /** A token é um número muito grande */
  LEX_NUMER_TOO_BIG: 102,
  /** A token é um identificador muito grande */
  LEX_IDENTIFIER_TOO_BIG: 103,
  /** A token é um identificador inválido */
  LEX_INVALID_IDETIFIER: 104,
  /** O arquivo acabou de forma inexperada. Havia algo a ser fechado, provavelmente. */
  LEX_UNEXPECTED_EOF: 105,
};
