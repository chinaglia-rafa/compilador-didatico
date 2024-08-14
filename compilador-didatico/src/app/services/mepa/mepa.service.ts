import { Injectable } from '@angular/core';

/**
 * Representa uma instrução da MEPA, como ARMZ ou RTPR, seu número
 * de parâmetros e código a ser executado.
 */
export interface InstructionDef {
  /** nome da instrução */
  name: string;
  /** número de parâmetros aceitos pela instrução */
  paramsCount: number;
  /** função a ser executada pela instrução */
  run:
    | (() => void)
    | ((p1: number) => void)
    | ((p1: number, p2: number) => void);
}

@Injectable({
  providedIn: 'root',
})
export class MepaService {
  /**
   * parte da memória reservada para armazenar as instruções
   * do programa a ser executado pela MEPA.
   *
   * Na literatura, chama-se P.
   */
  programQueue: string[] = [];
  /**
   * contador de programa, responsável por indicar em qual
   * item da lista programCounter (P) a MEPA está.
   *
   * Na literatura, chama-se i.
   */
  programCounter: number = -1;
  /**
   * memória principal da MEPA, onde são empilhadas os
   * valores e dados conforme os comandos os utiliza.
   *
   * Na literatura, chama-se M.
   */
  memoryStack: number[] = [];
  /**
   * indica o topo da pilha da memória principal da MEPA.
   *
   * Na literatura, chama-se s.
   */
  stackTop: number = -1;
  /**
   * registro de endereços para os escopos do programa na
   * memória principal (M). Essa tabela é responsável por
   * cuidar dos níveis léxicos da MEPA.
   *
   * Na literatura, chama-se D.
   */
  lexicalLevelsTable: number[] = [];
  /**
   * nível léxico atual, começando de 0 (global).
   *
   * Na literatura, chama-se k.
   */
  lexicalLevel: number = 0;
  /** Mapa de instruções registradas na MEPA */
  instructions: Map<string, InstructionDef> = new Map();
  constructor() {
    this.loadInstructions();
  }

  /** reinicia todas as variáveis do serviço */
  reset(): void {
    this.programQueue = [];
    this.programCounter = -1;
    this.memoryStack = [];
    this.stackTop = -1;
    this.lexicalLevelsTable = [];
    this.lexicalLevel = 0;
  }

  /**
   * Carrega um novo programa na MEPA
   *
   * @param program lista de comandos a ser carregados.
   */
  loadProgram(program: string[]): void {
    this.programQueue = program;
  }

  /**
   * Seta o valor do programCounter (i)
   *
   * @param i índice do programCounter a ser setada.
   */
  setProgramCounter(i: number): void {
    this.programCounter = i;
  }

  /** Avança para o próximo comando */
  next(): void {
    this.programCounter += 1;
  }

  /**
   * Adiciona um valor ao topo da memória (M)
   *
   * @param value valor a ser empilhado
   */
  pushToMemory(value: number): void {
    this.moveStackTop(1);
    this.memoryStack[this.stackTop] = value;
  }

  /**
   * Seta o valor do topo da pilha de memória (s)
   *
   * @param value novo valor do topo da pilha
   */
  setStackTop(value: number): void {
    this.stackTop = value;
  }

  /**
   * Move o pointer do topo da memória delta unidades
   *
   * @param delta valor positivo ou negativo de deslocamento do
   * topo da pilha de memória
   */
  moveStackTop(delta: number): void {
    this.stackTop = this.stackTop + delta;
  }

  /**
   * Seta o valor de um slot específico de memória cuja posição é index
   * e o valor será value.
   *
   * @param index índice da memória para modificar
   * @param value valor a ser registrado
   */
  setMemorySlot(index: number, value: number): void {
    this.memoryStack[index] = value;
  }

  /**
   * Seta um valor para o slot de nível léxico
   *
   * @param index índice a ser modificado
   * @param value valor a ser registrado
   */
  setLexicalLevelSlot(index: number, value: number): void {
    this.lexicalLevelsTable[index] = value;
  }

  /**
   * Retorna o valor da memória na posição idnex
   *
   * @param index índice a ser recuperado
   * @returns valor da memória na posição index
   */
  getValueFromMemory(index: number): number {
    return this.memoryStack[index];
  }

  /**
   * Recupera o endereço de memória do primeiro valor do nível léxico lexicalLevel
   *
   * @param lexicalLevel nível léxico cujo endereço deve ser recuperado
   * @returns o endereço de memória do primeiro valor no nível léxico lexicalLevel
   */
  getLexicalLevelOffset(lexicalLevel: number): number {
    return this.lexicalLevelsTable[lexicalLevel];
  }

  /**
   * Retorna o valor do topo da pilha de memória (M) e remove-o
   *
   * @returns retorna o valor do topo da pilha de memória (M) e move o pointer s abaixo.
   */
  popFromMemory(): number {
    this.moveStackTop(-1);
    return this.getValueFromMemory(this.stackTop + 1);
  }

  /**
   * Define uma instrução da MEPA para ser chamada durante a execução
   * de códigos.
   *
   * @param name nome do comando (ex. INPP, ARMZ)
   * @param description descrição do comando, para uso didático
   * @param paramsCount número de parâmetros da instrução, de 0 a 2
   * @param run função com 0, 1 ou 2 parâmetros a ser executada na instrução
   */
  private defineInstruction(
    name: string,
    description: string,
    paramsCount: number,
    run: (p1: number, p2: number) => void,
  ): void {
    this.instructions.set(name, {
      name,
      paramsCount,
      run,
    });
  }

  private loadInstructions(): void {
    this.defineInstruction('INPP', 'Iniciar programa principal', 0, () => {
      this.setStackTop(-1);
      this.setLexicalLevelSlot(0, 0);
    });

    this.defineInstruction('RTPR', 'Retornar de procedimento', 2, (p1, p2) => {
      this.setLexicalLevelSlot(p1, this.memoryStack[this.stackTop]);
      this.setProgramCounter(this.memoryStack[this.stackTop - 1]);
      this.moveStackTop(-(p2 + 2));
    });

    this.defineInstruction('ARMI', 'Armazenar indiretamente', 2, (p1, p2) => {
      this.setMemorySlot(
        this.getValueFromMemory(this.getLexicalLevelOffset(p1) + p2),
        this.getValueFromMemory(this.stackTop), //TODO: pop()?
      );
      this.moveStackTop(1);
    });

    this.defineInstruction(
      'CRVI',
      'Carregar valor indiretamente',
      2,
      (p1, p2) => {
        this.pushToMemory(
          this.getValueFromMemory(
            this.getValueFromMemory(this.getLexicalLevelOffset(p1) + p2),
          ),
        );
      },
    );

    this.defineInstruction('CREN', 'Carregar endereço', 2, (p1, p2) => {
      this.pushToMemory(this.getLexicalLevelOffset(p1) + p2);
    });

    this.defineInstruction('ENPR', 'Entrada no procedimento', 1, (p1) => {
      this.pushToMemory(this.getLexicalLevelOffset(p1));
      this.setLexicalLevelSlot(p1, this.stackTop + 1);
    });

    this.defineInstruction('CHPR', 'Chamar procedimento', 1, (p1) => {
      this.pushToMemory(this.programCounter + 1);
      this.setProgramCounter(p1);
    });

    this.defineInstruction('DMEM', 'Desalocar memória', 1, (p1) => {
      this.moveStackTop(-p1);
    });

    this.defineInstruction('ARMZ', 'Armazenar valor', 2, (p1, p2) => {
      this.setMemorySlot(
        this.getLexicalLevelOffset(p1) + p2,
        this.popFromMemory(),
      );
    });

    this.defineInstruction('CRVL', 'Carregar valor', 2, (p1, p2) => {
      this.pushToMemory(this.getLexicalLevelOffset(p1) + p2);
    });

    this.defineInstruction(
      'IPVL',
      'Inicializar parâmetros por valor',
      2,
      (p1, p2) => {
        for (let k = 0; k < p2 - 1; k++) {
          const currentValue = this.getValueFromMemory(p1 + k);
          this.setMemorySlot(
            p1 + k,
            this.getValueFromMemory(this.stackTop - p2 + k),
          );
          this.setMemorySlot(this.stackTop - p2 + k, currentValue);
        }
      },
    );

    this.defineInstruction('PARA', 'Parar', 0, () => {
      // TODO: implementar uma "chamada de sistema" para parar a execução da MEPA.
    });

    this.defineInstruction('AMEM', 'Aloca memória', 2, (p1, p2) => {
      for (let k = 0; k < p2 - 1; k++) {
        this.pushToMemory(this.getValueFromMemory(p1 + k));
      }
    });

    this.defineInstruction('IMPR', 'Impressão', 0, () => {
      // TODO: implementar "chamada de sistema"
      console.log('IMPRESSÃO:', this.popFromMemory());
    });

    this.defineInstruction('LEIT', 'Leitura', 0, () => {
      // TODO: implementar "chamada de sistema"
      this.pushToMemory(parseInt(prompt('Digite o valor para a entrada:')));
    });

    this.defineInstruction('NADA', 'Faz nada', 0, () => {
      //
    });

    this.defineInstruction('DSVF', 'Desvia se falso', 1, (p1) => {
      if (this.popFromMemory() === 0) {
        this.setProgramCounter(p1);
      } else {
        this.next();
      }
    });

    this.defineInstruction('DSVS', 'Desvia sempre', 1, (p1) => {
      this.setProgramCounter(p1);
    });

    this.defineInstruction('CMAG', 'Compara maior ou igual', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) >=
        this.getValueFromMemory(this.stackTop)
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('CMEG', 'Compara menor ou igual', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) <=
        this.getValueFromMemory(this.stackTop)
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('CMDG', 'Compara desigual', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) !==
        this.getValueFromMemory(this.stackTop)
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('CMIG', 'Compara igual', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) ===
        this.getValueFromMemory(this.stackTop)
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('CMMA', 'Compara maior', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) >
        this.getValueFromMemory(this.stackTop)
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('CMME', 'Compara menor', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) <
        this.getValueFromMemory(this.stackTop)
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('NEGA', 'Negação', 0, () => {
      this.setMemorySlot(
        this.stackTop,
        1 - this.getValueFromMemory(this.stackTop),
      );
    });

    this.defineInstruction('DISJ', 'Disjunção (OR)', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) === 1 ||
        this.getValueFromMemory(this.stackTop) === 1
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('CONJ', 'Conjunção (AND)', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) === 1 &&
        this.getValueFromMemory(this.stackTop) === 1
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('INVR', 'Inverter sinal', 0, () => {
      this.setMemorySlot(
        this.stackTop,
        -this.getValueFromMemory(this.stackTop),
      );
    });

    this.defineInstruction('DIVI', 'Dividir', 0, () => {
      this.setMemorySlot(
        this.stackTop - 1,
        this.getValueFromMemory(this.stackTop - 1) /
          this.getValueFromMemory(this.stackTop),
      );
      this.popFromMemory();
    });

    this.defineInstruction('MULT', 'Multiplicar', 0, () => {
      this.setMemorySlot(
        this.stackTop - 1,
        this.getValueFromMemory(this.stackTop - 1) *
          this.getValueFromMemory(this.stackTop),
      );
      this.popFromMemory();
    });

    this.defineInstruction('SUBT', 'Subtrair', 0, () => {
      this.setMemorySlot(
        this.stackTop - 1,
        this.getValueFromMemory(this.stackTop - 1) -
          this.getValueFromMemory(this.stackTop),
      );
      this.popFromMemory();
    });

    this.defineInstruction('SOMA', 'Somar', 0, () => {
      this.setMemorySlot(
        this.stackTop - 1,
        this.getValueFromMemory(this.stackTop - 1) +
          this.getValueFromMemory(this.stackTop),
      );
      this.popFromMemory();
    });

    this.defineInstruction('CRCT', 'Carregar constante', 1, (p1) => {
      this.pushToMemory(p1);
    });

    console.log(this.instructions);
  }
}
