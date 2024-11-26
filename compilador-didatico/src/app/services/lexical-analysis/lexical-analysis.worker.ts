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
  tokens: (Token & { scope: number })[];
  errors: LexicalAnalysisError[];
}

/** Representa um erro encontrado na análise léxica */
export interface LexicalAnalysisError {
  errorCode: number;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  /** conteúdo da linha onde o erro ocorreu */
  lineContent: string;
}

let receivedData: LexicalAnalysisInput;
/** lista de tokens geradas pelo processo */
const tokens: (Token & { scope: number })[] = [];
/** lista de erros léxicos */
const errors: LexicalAnalysisError[] = [];
/** escopo lésico atual */
let scope = -1;
/** pilha de aberturas de blocos */
let blockStack: string[] = [];
/**
 * quando true, mantém o nível léxico por mais uma consolidação
 * de token. Isso é usado para que o nome da função gere um símbolo
 * com o nível léxico que o declarou, ao invés do nível que ela criou
 */
let awaitForName: boolean = false;

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
  token.col = col - token.lexema.length;

  if (token.token === 'número-real-mal-formatado') {
    errors.push({
      errorCode: ERROR_CODES.LEX_MALFORMED_FLOAT.code,
      startRow: row,
      startCol: col - token.lexema.length,
      endRow: row,
      endCol: col,
      lineContent: line,
    });
  } else if (token.token === 'número-natural-muito-longo') {
    errors.push({
      errorCode: ERROR_CODES.LEX_NUMBER_TOO_BIG.code,
      startRow: row,
      startCol: col - token.lexema.length,
      endRow: row,
      endCol: col,
      lineContent: line,
    });
  } else if (token.token === 'identificador-muito-longo') {
    errors.push({
      errorCode: ERROR_CODES.LEX_IDENTIFIER_TOO_BIG.code,
      startRow: row,
      startCol: col - token.lexema.length,
      endRow: row,
      endCol: col,
      lineContent: line,
    });
  } else if (token.token === 'identificador-inválido') {
    errors.push({
      errorCode: ERROR_CODES.LEX_INVALID_IDETIFIER.code,
      startRow: row,
      startCol: col - token.lexema.length,
      endRow: row,
      endCol: col,
      lineContent: line,
    });
  }

  if (awaitForName) {
    awaitForName = false;
    tokens.push({ ...token, scope: scope - 1 });
  } else {
    tokens.push({ ...token, scope: scope });
  }

  /** lista de palavras reservadas que iniciam novos escopos */
  const scopeStarters = ['program', 'procedure', 'begin'];
  /** lista de palavras reservadas que fecham escopos abertos */
  const scopeEnders = ['end'];

  // Atualiza os dados de nível léxico
  if (scopeStarters.includes(token.lexema)) {
    blockStack.push(token.lexema);

    // hax, sem tempo pra explicar...
    if (token.lexema === 'procedure') awaitForName = true;

    if (token.lexema !== 'begin') {
      scope++;
    }
  } else if (scopeEnders.includes(token.lexema)) {
    blockStack.pop();

    if (blockStack[blockStack.length - 1] !== 'begin') {
      scope--;
      blockStack.pop();
    }
  }

  return token;
}

function newToken(): Token {
  // TODO: deixar de ser preguiçoso e criar uma classe ao invés de uma interface
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

  /** Divide o código-fonte em linhas */
  const code = receivedData.code.replaceAll('\r', '').split('\n');

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
       *  contido no alfabeto da linguagem.
       *  ===========================================================
       */
      if (!isInAphabet(currentChar)) {
        console.log('Caractere não contido no alfabeto');

        currentToken.token = identifyToken(currentToken.lexema);
        consolidateToken(currentToken, row, col, currentLine);
        currentToken = newToken();

        currentToken.lexema = currentChar;

        currentToken.token = identifyToken(currentToken.lexema);
        consolidateToken(currentToken, row, col, currentLine);

        errors.push({
          errorCode: ERROR_CODES.LEX_NOT_IN_ALPHABET.code,
          startRow: row,
          startCol: col,
          endRow: row,
          endCol: col + 1,
          lineContent: currentLine,
        });

        currentToken = newToken();

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

        if (currentChar === ' ' || currentChar === '\t') continue;

        /**
         *  ===========================================================
         *  Identificando tokens como:
         *  := <> <= >=
         *  ===========================================================
         */
        if (currentChar === ':' && currentLine[col + 1] === '=') {
          // Caso seja :=
          currentToken.lexema = ':=';
        } else if (currentChar === '>' && currentLine[col + 1] === '=') {
          // Caso seja >=
          currentToken.lexema = '>=';
        } else if (currentChar === '<') {
          // Caso seja <=
          if (currentLine[col + 1] === '=') currentToken.lexema = '<=';
          // Caso seja <>
          else if (currentLine[col + 1] === '>') currentToken.lexema = '<>';
          // Caso seja apenas <
          else currentToken.lexema = currentChar;
          // Caso seja um divisor diferente dos citados acima
        } else currentToken.lexema = currentChar;
        /**
         *  Agora que o divisor foi identificado, deve-se
         *  consolidá-lo como token
         */
        currentToken.token = identifyToken(currentToken.lexema);
        consolidateToken(currentToken, row, col, currentLine);
        // Caso seja uma token com divisor composta,
        // deve-se saltar 2x no loop de colunas.
        if ([':=', '>=', '<=', '<>'].includes(currentToken.lexema)) {
          col += 1;
        }
        currentToken = newToken();

        continue;
      } else if (currentChar === '.' && currentToken.lexema === 'end') {
        // O algoritmo entra nesse if caso haja um ponto final precedido de um "end",
        // o que indica que o ponto não é um indicador de casa decimal de um número real,
        // mas sim a token ponto-final

        /** Consolida o "end" que está acumulado na token atual */
        currentToken.token = identifyToken(currentToken.lexema);
        consolidateToken(currentToken, row, col, currentLine);

        currentToken = newToken();

        /** consolida o "." final */
        currentToken.lexema = currentChar;
        currentToken.token = identifyToken(currentToken.lexema);
        consolidateToken(currentToken, row, col, currentLine);

        currentToken = newToken();

        continue;
      }
      /**
       *  Caso não tenha sido encontrado divisor de nenhum tipo,
       *  então o lexema atual ainda está sendo construído, e
       *  portanto o caractere atual deve ser acumulado ao
       *  lexema corrente.
       */
      currentToken.lexema += currentChar;
    }
    /**
     *  ao chegar ao fim da linha (após sua última coluna), haverá
     *  uma token possivelmente acumulada em currentToken. Por isso,
     *  deve-se consolidá-la, se presente.
     */
    if (currentToken.lexema !== '') {
      currentToken.token = identifyToken(currentToken.lexema);
      consolidateToken(currentToken, row, currentLine.length - 1, currentLine);
    }
  }

  /**
   *  Se o arquivo chegou ao fim no modo isInComment, então o arquivo está
   *  incorretamente finalizado.
   */
  if (isInComment === true) {
    errors.push({
      errorCode: ERROR_CODES.LEX_UNEXPECTED_EOF.code,
      startRow: code.length - 1,
      startCol: 0,
      endRow: code.length - 1,
      endCol: 0,
      lineContent: '',
    });
  }

  postMessage({
    tokens,
    errors,
  });
});
