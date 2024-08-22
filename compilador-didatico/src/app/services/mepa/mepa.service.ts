import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConsoleService } from '../console/console.service';

/**
 * Representa uma instrução da MEPA, como ARMZ ou RTPR, seu número
 * de parâmetros e código a ser executado.
 */
export interface InstructionDef {
  /** nome da instrução */
  name: string;
  /** número de parâmetros aceitos pela instrução */
  paramsCount: number;
  /** breve descrição do comando */
  description: string;
  /** função a ser executada pela instrução */
  run:
    | (() => void)
    | ((p1: number) => void)
    | ((p1: number, p2: number) => void);
}

/**
 * Representa um comando da MEPA, com até dois parâmetros possíveis.
 */
export interface Command {
  /** Nome do comando */
  name: string;
  /** Primeiro parâmetro do comando, se existir */
  p1?: number;
  /** Segundo parâmetro do comando, se existir */
  p2?: number;
  /** Referência para a definição do comando */
  commandRef: InstructionDef;
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
  programQueue: Command[] = [];
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
  memoryStack: number[] = Array(100);
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
  lexicalLevelsTable: number[] = Array(12);
  /**
   * nível léxico atual, começando de 0 (global).
   *
   * Na literatura, chama-se k.
   */
  lexicalLevel: number = 0;
  /** Mapa de instruções registradas na MEPA */
  instructions: Map<string, InstructionDef> = new Map();

  /** Emite valores quando há atualização na memória principal */
  memoryChanges$ = new Subject();

  /** Indica se a execução foi concluída com sucesso */
  done: boolean = false;

  constructor(private console: ConsoleService) {
    this.reset();
    this.loadInstructions();
    /**
     * =====================================
     * =====================================
     * PROGRAMA DE EXEMPLO! (pág. 104)
     * =====================================
     * =====================================
     */
    this.addNewCommand('INPP');
    this.addNewCommand('AMEM', 0, 2);
    this.addNewCommand('AMEM', 0, 3);
    this.addNewCommand('LEIT');
    this.addNewCommand('ARMZ', 0, 0);
    this.addNewCommand('CRCT', 0);
    this.addNewCommand('ARMZ', 0, 2);
    this.addNewCommand('CRCT', 1);
    this.addNewCommand('ARMZ', 0, 3);
    this.addNewCommand('CRCT', 1);
    this.addNewCommand('ARMZ', 0, 1);
    this.addNewCommand('NADA');
    this.addNewCommand('CRVL', 0, 1);
    this.addNewCommand('CRVL', 0, 0);
    this.addNewCommand('CMEG');
    this.addNewCommand('DSVF', 28);
    this.addNewCommand('CRVL', 0, 2);
    this.addNewCommand('CRVL', 0, 3);
    this.addNewCommand('SOMA');
    this.addNewCommand('ARMZ', 0, 4);
    this.addNewCommand('CRVL', 0, 3);
    this.addNewCommand('ARMZ', 0, 2);
    this.addNewCommand('CRVL', 0, 4);
    this.addNewCommand('ARMZ', 0, 3);
    this.addNewCommand('CRVL', 0, 1);
    this.addNewCommand('CRCT', 1);
    this.addNewCommand('SOMA');
    this.addNewCommand('ARMZ', 0, 1);
    this.addNewCommand('DSVS', 11);
    this.addNewCommand('NADA');
    this.addNewCommand('CRVL', 0, 0);
    this.addNewCommand('IMPR');
    this.addNewCommand('CRVL', 0, 2);
    this.addNewCommand('IMPR');
    this.addNewCommand('PARA');
  }

  /** Reinicia o serviço sem apagar o programa atual */
  restart(): void {
    this.programCounter = -1;
    this.memoryStack = Array(100);
    this.stackTop = -1;
    this.lexicalLevelsTable = Array(12);
    this.lexicalLevelsTable[0] = 0;
    this.lexicalLevel = 0;
    this.done = false;
  }

  /** reinicia todas as variáveis do serviço */
  reset(): void {
    this.programQueue = [];
    this.programCounter = -1;
    this.memoryStack = Array(100);
    this.stackTop = -1;
    this.lexicalLevelsTable = Array(12);
    this.lexicalLevelsTable[0] = 0;
    this.lexicalLevel = 0;
    this.done = false;
  }

  /** Retorna true caso a MEPA esteja ociosa. */
  isDone(): boolean {
    return this.done;
  }

  /**
   * Carrega um novo programa na MEPA
   *
   * @param program lista de comandos a ser carregados.
   */
  loadProgram(program: Command[]): void {
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
    this.memoryStack = [...this.memoryStack];
    this.memoryChanges$.next(true);
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
    this.memoryStack = [...this.memoryStack];
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
      description,
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
      this.pushToMemory(
        this.getValueFromMemory(this.getLexicalLevelOffset(p1) + p2),
      );
      console.log(
        'Valor',
        this.getValueFromMemory(this.getLexicalLevelOffset(p1) + p2),
        'está no topo da pilha',
      );
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
      this.done = true;
      this.console.add(`[MEPA]: Execução finalizada.`);
    });

    this.defineInstruction('AMEM', 'Aloca memória', 2, (p1, p2) => {
      for (let k = 0; k < p2; k++) {
        this.pushToMemory(this.getValueFromMemory(p1 + k));
        console.log('alocando elemento', k);
      }
    });

    this.defineInstruction('IMPR', 'Impressão', 0, () => {
      const v = this.popFromMemory();
      console.log('IMPRESSÃO:', v);
      this.console.add(`[MEPA]: ${v}`);
    });

    this.defineInstruction('LEIT', 'Leitura', 0, () => {
      // TODO: implementar "chamada de sistema"
      let v = parseInt(prompt('Digite o valor (numérico) para a entrada:'));
      console.log('captured value is', v);
      if (v === null) {
        console.log('ERRO: entrada inválida! Será 0.');
        v = 0;
      }
      this.pushToMemory(v);
    });

    this.defineInstruction('NADA', 'Faz nada', 0, () => {
      //
    });

    this.defineInstruction('DSVF', 'Desvia se falso', 1, (p1) => {
      if (this.popFromMemory() === 0) {
        this.setProgramCounter(p1);
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
      console.log(
        'Tentando somar',
        this.getValueFromMemory(this.stackTop - 1),
        '+',
        this.getValueFromMemory(this.stackTop),
      );
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

  /**
   * Adiciona um comando com base nas definições existentes na META
   *
   * @param name Nome do comando como PARA, CRCT, etc
   * @param p1 Primeiro parâmetro, se existir
   * @param p2 Segundo parâmetro, se existir
   */
  addNewCommand(name: string, p1: number = null, p2: number = null): void {
    if (!this.instructions.has(name)) {
      // TODO: adicionar erro
      console.log('ERRO, COMANDO NÃO ENCONTRADO!', name, p1, p2);
      return;
    }

    const commandRef = this.instructions.get(name);

    if (
      (commandRef.paramsCount === 1 && p1 === null) ||
      (commandRef.paramsCount === 2 && p1 === null && p2 === null)
    ) {
      console.log('ERRO: NÚMERO INCORRETO DE PARÂMETROS');
      return;
    }

    const newCommand: Command = {
      name,
      p1,
      p2,
      commandRef,
    };

    this.programQueue.push(newCommand);
  }

  /** Executa o próximo comando e retorna true quando a MEPA estiver ociosa. */
  run(): boolean {
    if (this.isDone()) return true;
    this.next();
    if (this.programCounter > this.programQueue.length) {
      console.log('Acabou.');
      return true;
    }

    const currentCommand = this.programQueue[this.programCounter];
    console.log(
      '[COMANDO]',
      currentCommand.commandRef.description,
      currentCommand.p1,
      currentCommand.p2,
    );
    currentCommand.commandRef.run(currentCommand.p1, currentCommand.p2);

    return false;
  }
}
