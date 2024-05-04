import { EPSION, Grammar, Production } from './grammar.model';

export const lalg = new Grammar('LALG', []);

lalg.productions.push(
  new Production('<programa>', [
    ['program', '<identificador>', ';', '<bloco>', '.'],
  ]),
);

lalg.productions.push(
  new Production('<bloco>', [
    [
      '<parte_de_declarações_de_variáveis>',
      '<parte_de_declarações_de_subrotinas>',
      '<comando_composto>',
    ],
  ]),
);

lalg.productions.push(
  new Production('<parte_de_declarações_de_variáveis>', [
    ['<declaração_de_variáveis>', ';', "<declaração_de_variáveis'>"],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production("<declaração_de_variáveis'>", [
    ['<declaração_de_variáveis>', "<declaração_de_variáveis'>", ';'],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production('<declaração_de_variáveis>', [
    ['<tipo>', '<lista_de_identificadores>'],
  ]),
);

lalg.productions.push(
  new Production('<lista_de_identificadores>', [
    ['<identificador>', "<lista_de_identificadores'>"],
  ]),
);

lalg.productions.push(
  new Production("<lista_de_identificadores'>", [
    [',', '<identificador>', "<lista_de_identificadores'>"],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production('<parte_de_declarações_de_subrotinas>', [
    ['<declaração_de_procedimento>', ';', "<declaração_de_procedimento'>"],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production("<declaração_de_procedimento'>", [
    ['<declaração_de_procedimento>', "<declaração_de_procedimento'>", ';'],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production('<declaração_de_procedimento>', [
    ['procedure', '<identificador>', '<parâmetros_formais>', ';', '<bloco>'],
  ]),
);

lalg.productions.push(
  new Production('<parâmetros_formais>', [
    ['(', '<seção_de_parâmetros_formais>', "<parâmetros_formais'>", ')'],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production("<parâmetros_formais'>", [
    [';', '<seção_de_parâmetros_formais>', "<parâmetros_formais'>"],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production('<seção_de_parâmetros_formais>', [
    ['<var>', '<lista_de_identificadores>', ':', '<identificador>'],
  ]),
);

lalg.productions.push(new Production('<var>', [['var'], [EPSION]]));

lalg.productions.push(
  new Production('<comando_composto>', [
    ['begin', '<comando>', "<comando_composto'>", 'end'],
  ]),
);

lalg.productions.push(
  new Production("<comando_composto'>", [
    [';', '<comando>', "comando_composto'>"],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production('<comando>', [
    ['<atribuição>'],
    ['<chamada_de_procedimento>'],
    ['<comando_condicional_1>'],
    ['<comando_repetitivo_1>'],
    ['<comando_composto>'],
  ]),
);

lalg.productions.push(
  new Production('<atribuição>', [['<variável>', ':=', '<expressão>']]),
);

lalg.productions.push(
  new Production('<chamada_de_procedimento>', [
    ['<identificador>', "chamada_de_procedimento'>"],
  ]),
);

lalg.productions.push(
  new Production("<chamada_de_procedimento'>", [
    ['(', '<lista_de_expressões>', ')'],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production('<comando_condicional_1>', [
    ['if', '<expressão>', 'then', '<comando>', '<else>'],
  ]),
);

lalg.productions.push(
  new Production('<else>', [['else', '<comando>'], [EPSION]]),
);

lalg.productions.push(
  new Production('<comando_repetitivo_1>', [
    ['while', '<expressão>', 'do', '<comando>'],
  ]),
);

lalg.productions.push(
  new Production('<expressão>', [['<expressão_simples>', "<expressão'>"]]),
);

lalg.productions.push(
  new Production("<expressão'>", [
    ['<relação>', '<expressão_simples>'],
    [EPSION],
  ]),
);

lalg.productions.push(
  new Production('<relação>', [['='], ['<>'], ['<'], ['<='], ['=>'], ['>']]),
);

lalg.productions.push(
  new Production('<expressão_simples>', [
    ['<op>', '<termo>', "expressão_simples'>"],
  ]),
);

lalg.productions.push(new Production('<op>', [['+'], ['-'], [EPSION]]));

lalg.productions.push(
  new Production("<expressão_simples'>", [
    ['<op2>', '<termo>', "expressão_simples'>"],
    [EPSION],
  ]),
);

lalg.productions.push(new Production('<op2>', [['+'], ['-'], ['or']]));

lalg.productions.push(new Production('<termo>', [['<fator>', "<termo'>"]]));

lalg.productions.push(
  new Production("<termo'>", [['<op3>', '<fator>', "<termo'>"], [EPSION]]),
);

lalg.productions.push(new Production('<op3>', [['*'], ['div'], ['and']]));

lalg.productions.push(
  new Production('<fator>', [
    ['<variável>'],
    ['<número>'],
    ['(', '<expressão>', ')'],
    ['not', '<fator>'],
  ]),
);

lalg.productions.push(
  new Production('<variável>', [['<identificador>', "<variável'>"]]),
);

lalg.productions.push(
  new Production("<variável'>", [['[', '<expressão>', ']'], [EPSION]]),
);

lalg.productions.push(
  new Production('<lista_de_expressões>', [
    ['<expressão>', "<lista_de_expressões'>"],
  ]),
);

lalg.productions.push(
  new Production("<lista_de_expressões'>", [
    [',', '<expressão>', "lista_de_expressões'>"],
    [EPSION],
  ]),
);

lalg.productions.push(new Production('<número>', [['<CONVERT_TO_FINAL>']]));

lalg.productions.push(
  new Production('<identificador>', [['<CONVERT_TO_FINAL>']]),
);
