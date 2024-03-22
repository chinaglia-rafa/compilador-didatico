/// <reference lib="webworker" />

import { ERROR_CODES } from '../../error-codes';
import { Token } from './lexical-analysis.service';

/**
 * Dados de entrada para a tokenização
 */
export interface LexicalAnalysisInput {
  alphabet: string[];
  dividers: string[];
  reservedWords: { token: string; desc: string }[];
  oneLineComment: string;
  code: string;
}

export interface LexicalAnalysisOutput {
  tokens: Token[];
  errors: LexicalAnalysisError[];
}

/** Representa um erro encontrado na análise léxica */
export interface LexicalAnalysisError {
  errorCode: number;
  row: number;
  col: number;
  /** conteúdo da linha onde o erro ocorreu */
  lineContent: string;
}

let receivedData: LexicalAnalysisInput;
/** lista de tokens geradas pelo processo */
const tokens: Token[] = [];
/** lista de erros léxicos */
const errors: LexicalAnalysisError[] = [];

function isInAphabet(char: string): boolean {
  if (char === '') return false;
  // Os caracteres ' ' (espaço) e '\t' (tabulação) existe para além do alfabeto, mas a função
  // retornará true para o caso dele para que a execução não seja interrompida
  // indevidamente.
  if (char === ' ' || char === '\t') return true;

  return receivedData.alphabet.includes(char);
}

function identifyToken(lexema: string): string {
  const tokenFound = receivedData.reservedWords.find(
    (el) => el.token === lexema,
  );
  if (tokenFound !== undefined) return tokenFound.desc;
  // Verifica se é um número real
  if (/(^\.\d*$)|(^\d*\.$)/.test(lexema)) return 'número-real-mal-formatado';
  else if (/^\d+\.\d+$/.test(lexema)) return 'número-real';
  else if (/^\d+$/.test(lexema))
    if (lexema.length <= 8) return 'número-natural';
    else return 'número-natural-muito-longo';
  else if (/^[a-zA-z_][a-zA-z_0-9]*$/.test(lexema))
    if (lexema.length <= 15) return 'identificador-válido';
    else return 'identificador-muito-longo';

  // Caso a token não tenha sido identifciada, retornar que é um identificador inválido
  return 'identificador-inválido';
}

function consolidateToken(
  token: Token,
  row: number,
  col: number,
  line: string,
): Token {
  token.row = row;
  token.col = col;

  if (token.token === 'número-real-mal-formatado') {
    errors.push({
      errorCode: ERROR_CODES.LEX_MALFORMED_FLOAT,
      row,
      col,
      lineContent: line,
    });
  } else if (token.token === 'número-natural-muito-longo') {
    errors.push({
      errorCode: ERROR_CODES.LEX_NUMER_TOO_BIG,
      row,
      col,
      lineContent: line,
    });
  } else if (token.token === 'identificador-muito-longo') {
    errors.push({
      errorCode: ERROR_CODES.LEX_MALFORMED_FLOAT,
      row,
      col,
      lineContent: line,
    });
  } else if (token.token === 'identificador-inválido') {
    errors.push({
      errorCode: ERROR_CODES.LEX_INVALID_IDETIFIER,
      row,
      col,
      lineContent: line,
    });
  }

  tokens.push(token);

  return token;
}

function newToken(): Token {
  return {
    lexema: '',
    token: '',
    row: -1,
    col: -1,
  };
}

addEventListener('message', ({ data }) => {
  /**
   *  receivedData será responsável por expor os dados
   *  de entrada para as funções fraquinhas do js.
   */
  receivedData = data;
  /** indica se a tokenização está no modo comentário */
  let isInComment = false;

  const response = `worker received ${receivedData}`;

  /** Divide o código-fonte em linhas */
  const code = receivedData.code.split('\n');
  console.log('linhas', code);

  for (let row = 0; row < code.length; row++) {
    /** linha sendo trabalhada no momento */
    const currentLine = code[row];

    if (currentLine === '') continue;

    /** a token sendo criada no momento é iterada durante os loops de linhas
     *  e colunas.
     */
    let currentToken: Token = newToken();

    for (let col = 0; col < currentLine.length; col++) {
      /** caractere sendo avaliado no momento */
      const currentChar = currentLine[col];

      /**
       *  ===========================================================
       *  O fragmento abaixo lida com comentários de múltiplas linhas.
       *  ===========================================================
       */
      if (currentChar === '{') isInComment = true;
      if (isInComment && currentChar === '}') {
        isInComment = false;
        continue;
      }
      if (isInComment) continue;

      /**
       *  ===========================================================
       *  O fragmento abaixo lida com comentários de uma única linha
       *  ===========================================================
       */
      if (
        col < currentLine.length - 1 &&
        currentChar === currentLine[col + 1] &&
        currentChar === receivedData.oneLineComment
      )
        /** o break; faz com que toda a linha seja ignorada */
        break;

      /**
       *  ===========================================================
       *  Validação do alfabeto. Cada caractere do código deve estar
       *  contio no alfabeto da linguagem.
       *  ===========================================================
       */
      if (!isInAphabet(currentChar)) {
        console.log('Caractere não contido no alfabeto');
        errors.push({
          errorCode: ERROR_CODES.LEX_NOT_IN_ALPHABET,
          row,
          col,
          lineContent: currentLine,
        });

        continue;
      }

      /**
       *  ===========================================================
       *  Ao encontrar um divisor, deve-se consolidar a token acumulada
       *  até o momento.
       *  ===========================================================
       */
      if (receivedData.dividers.includes(currentChar)) {
        if (currentToken.lexema !== '') {
          currentToken.token = identifyToken(currentToken.lexema);
          consolidateToken(currentToken, row, col, currentLine);
          currentToken = newToken();
        }
      }

      if (currentChar === ' ' || currentChar === '\t') continue;

      currentToken.lexema += currentChar;
    }
  }
  postMessage({
    tokens,
    errors,
  });
});
