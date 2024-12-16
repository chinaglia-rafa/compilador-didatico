# compilador-didatico

Compilador didático feito como TCC para o curso de Ciência da Computação pela FCT/UNESP.

## Acesso

Acesse o ambiente web para ensino-aprendizagem de Compiladores [clicando aqui](https://chinaglia-rafa.github.io/compilador-didatico) :)

# CompiladorDidatico

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.1.

## Contribuindo

Este projeto é parte da comunidade Open Source e convida a todos a contribuir para seu crescimento e melhoria. Como parte dessa intenção, além dos comentários já presentes nos arquivos, segue abaixo uma série de pontos importantes para considerar ao contribuir com o projeto.

### Áreas importantes

#### src/app/pages

Neste diretório estão localizados os componentes carreagdos pelas rotas (`/src/app/app.routes.ts`) da aplicação. Isso inclui a tela inicial e a tela sobre, bem como todas as telas das etapas de compilação, presentes em `pages/compiler/`.

#### src/app/grammar

Neste diretório está definida a LALG (`LALG.ts`). Para os projetos futuros que quiserem dinamizar as gramáticas carregáveis na aplicação, é preciso estar atento aos seguintes pontos:

1. a aplicação valida manualmente os não-termianis <identificador> e <número>, e portanto gramáticas personalizadas precisariam levar isso em conta;
2. o formato do arquivo é baseado nos modelos presntes em `grammar.model.ts`.

#### src/app/services

Os serviços da aplicação estão neste diretório. Um serviço é uma classe singleton que pode ser injetada em qualquer componente, permitindo a interação entre componentes, entre outras coisas. Os serviços principais desta aplicação incluem:

- `compiler.service.ts` o serviço de compilação em si, responsável por centralizar as etapas e comunicar ao restante da aplicação as mudanças de status de cada uma;
- `lexical-analysis` é o serviço de análise léxica, que chama um worker para paralelizar o processo de tokenização;
- `logger` e `errors` são serviços auxiliares que alimentam os componentes de log e de listagem de erros, e são usados por toda a aplicação;
- `mepa` serviço responsável por executar comandos da máquina virtual MEPA.

Se sua contribuição envolver alguma etapa da compilação, você provavelmente trabalhará sorbe esse diretório.

#### src/app/components

Diretório de componentes, que são utilizados e reutilizados em várias áreas da aplicação. Por exemplo, cada item de log é um `LogItemComponent` e sua definição está nesse diretório.

### Estrutura da LALG.ts

O trecho abaixo ilustra a estrutura da definição da LALG no código-fonte.

```typescript
export const lalg = new Grammar("LALG", []);

lalg.productions.push(
  new Production("<programa>", [
    ["program", "<identificador>", ";", "<bloco>", "."],
  ])
);

lalg.productions.push(
  new Production("<bloco>", [
    [
      "<parte_de_declarações_de_variáveis>",
      "<parte_de_declarações_de_subrotinas>",
      "<comando_composto>",
    ],
  ])
);
```

A lalg em si é um objeto da classe Grammar, e sua raiz é a primeira produção adicionada. Para adicionar produções, você precisa:

1. adicionar um novo elemento do tipo `Production` à array `productions` através, por exemplo, do comando `lalg.productions.push()`;
2. o construtor de `Production` exige um primeiro parâmetro representando o símbolo não-terminal que será derivado, e um segundo parâmetro contendo um array de produções, onde cada parte da mesma produção é um elemento de uma lista.
3. cada símbolo terminal e não-terminal é representado por uma string, então confira com atenção se todas as instâncias do mesmo símbolo estão digitadas corretamente.

No construtor do serviço de análise sintática, os conjuntos _first_, _follow_ e a tabela sintática para a gramática são calculados com base no arquivo `LALG.ts`, assim como as questões semânticas.

Abaixo seguem considerações relevantes sobre a LALG:

- A LALG é também chamada de Pascal Simplificado, mas isso só diz respeito à sua origem, e não significa que ela herde oficialmente as estruturas do Pascal;
- A LALG não tem suporte para strings em sua implementação atual;
- A LALG não tem suporte para funções em sua etapa de análise, mas a MEPA é capaz de entender códigos gerados para ela que contenham funções;
- A LALG não tem suporte para arrays no momento;
- A LALG não tem suporte para rótulos, rótulos são feios.

## Interface de usuário

A UI segue os padrões do [Material 3](https://m3.material.io/). Se você pretende fazer uma contribuição que quebre esse padrão, é melhor ter um bom motivo. Caso contrário, estudar um sistema de design consistente e com alto reconhecimento como o M3 é uma ótima escolha. Os componentes do material utilizam os Web Components (como pode ser visto no package.json) ao invés do Angular Material. Isso porque ele não tinha sido atualizado ainda quando o projeto começou. Atualizar o uso de componentes para o Angular Material é uma boa ideia, inclusive.

## Barra lateral

A barra lateral esquerda é importante porque possui muitos valores alimentados por diversas partes dos algoritmos da compilação. Já existem diversos exemplos dos funcionamentos dos cards, então qualquer contribuição naquela região pode e deve aprender com os usos já presentes.

## Geração de Código

Um dos pontos principais que foram considerados para os projetos futuros é a geração de código diretamente na aplicação. Para fazer isso, você poderá implementar o serviço `CodeGenerationService` e fazer bom uso da tabela de símbolos presente em `SymbolsTableService` para calcular os diversos fatores envolvidos na geração de código, como número de parâmetros formais (que devem ser contados com base nos tipos e escopos das variáveis presentes na tabela de símbolos), etc.

A geração de código pode ser implementada durante a análise sintática ou ser um algoritmo novo, que varre o código todo com base nas _tokens_. Qualquer que seja a decisão, basta lembrar-se que a LALG não possui funções na gramática, mas a MEPA é capaz de entendê-las, já.

## Começando a desenvolver

Se você quiser uma forma rápida começar os trabalhos e verificar se está tudo okay, siga os passos abaixo:

### Pré-requisitos

Você precisa de:

- node.js >= v18.x

### Baixando e executando

```bash
# Clone o repositório
git clone git@github.com:chinaglia-rafa/compilador-didatico.git

# Entre na pasta do projeto do Angular
cd compilador-didatico/compilador-didatico

# o uso de --legacy-peer-deps pode ser necessário
# para fazer algumas dependências antigas funcionarem
# bem com as versões mais recentes do node
npm install --legacy-peer-deps

# Esse comando vai começar a rodar o projeto localmente
# e abrir uma abinha nova com ele no navegador para você
ng serve -o
```

Se tudo estiver certo, você verá a tela de edição de código :)

## Deploy

Se você tiver as permissões corretaas, pode fazer deploy do projeto no GitHub Pages usando o seguinte comando:

```bash
ng deploy --base-href=/compilador-didatico/
```

Se não tiver permissão, entre em contato!
