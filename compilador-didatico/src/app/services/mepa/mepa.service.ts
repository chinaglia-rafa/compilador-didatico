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
    | ((p1: number, p2: number) => void)
    | ((p1: number, p2: number, p3: number) => void);
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
  /** Terceiro parâmetro do comando, se existir */
  p3?: number;
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
  programCounter: number = 0;
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

  lastCommand: Command = null;

  constructor(private console: ConsoleService) {
    this.reset();
    this.loadInstructions();
    /**
     * =====================================
     * =====================================
     * PROGRAMA DE EXEMPLO! (pág. 126)
     * =====================================
     * =====================================
     */
  }

  /** Reinicia o serviço sem apagar o programa atual */
  restart(): void {
    this.programCounter = 0;
    this.memoryStack = Array(100);
    this.stackTop = -1;
    this.lexicalLevelsTable = Array(12);
    this.lexicalLevelsTable[0] = 0;
    this.lexicalLevel = 0;
    this.done = false;
    this.lastCommand = null;
  }

  /** reinicia todas as variáveis do serviço */
  reset(): void {
    this.programQueue = [];
    this.programCounter = 0;
    this.memoryStack = Array(100);
    this.stackTop = -1;
    this.lexicalLevelsTable = Array(12);
    this.lexicalLevelsTable[0] = 0;
    this.lexicalLevel = 0;
    this.done = false;
    this.lastCommand = null;
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
    run: (p1: number, p2: number, p3: number) => void,
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

    // O p1 é o nível léxico do procedimento que está RETORNANDO
    this.defineInstruction('RTPR', 'Retornar de procedimento', 1, (p1) => {
      //this.setLexicalLevelSlot(p1, this.memoryStack[this.stackTop]);
      //this.setProgramCounter(this.memoryStack[this.stackTop - 2]);
      //this.moveStackTop(-(p2 + 3));
      let tmp = this.getValueFromMemory(this.stackTop - 1);
      this.setLexicalLevelSlot(tmp, this.getValueFromMemory(this.stackTop - 2));
      this.setProgramCounter(this.getValueFromMemory(this.stackTop - 3));
      this.moveStackTop(-(p1 + 4));
      while (tmp >= 2) {
        this.setLexicalLevelSlot(
          tmp - 1,
          this.getValueFromMemory(this.getLexicalLevelOffset(tmp) - 1),
        );
        tmp--;
      }
    });

    this.defineInstruction('ARMI', 'Armazenar indiretamente', 2, (p1, p2) => {
      this.setMemorySlot(
        this.getValueFromMemory(this.getLexicalLevelOffset(p1) + p2),
        this.getValueFromMemory(this.stackTop),
      );
      this.popFromMemory();
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
      this.pushToMemory(this.getLexicalLevelOffset(p1 - 1));
      this.setLexicalLevelSlot(p1, this.stackTop + 1);
    });

    // Aqui, p1 é o endereço do primeiro comando do procedimento
    // e p2 é o nível léxico que CHAMOU o procedimento
    this.defineInstruction('CHPR', 'Chamar procedimento', 2, (p1, p2) => {
      this.pushToMemory(this.programCounter + 1);
      this.pushToMemory(this.getLexicalLevelOffset(p2));
      this.pushToMemory(p2);
      this.setProgramCounter(p1);
    });

    this.defineInstruction(
      'CHPP',
      'Chamar procedimento que é parâmetro',
      3,
      (p1, p2, p3) => {
        this.pushToMemory(this.programCounter + 1);
        this.pushToMemory(this.getLexicalLevelOffset(p3));
        this.pushToMemory(p3);
        this.setProgramCounter(
          this.getValueFromMemory(this.getLexicalLevelOffset(p1) + p2),
        );
        let tmp = this.getValueFromMemory(
          this.getLexicalLevelOffset(p1) + p2 + 2,
        );
        this.setLexicalLevelSlot(
          tmp,
          this.getValueFromMemory(this.getLexicalLevelOffset(p1) + p2 + 1),
        );

        while (tmp >= 2) {
          this.setLexicalLevelSlot(
            tmp - 1,
            this.getValueFromMemory(this.getLexicalLevelOffset(tmp) - 1),
          );
          tmp--;
        }
      },
    );

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
        'Carregando o valor da posição',
        this.getLexicalLevelOffset(p1) + p2,
        'da pilha = ',
        this.getValueFromMemory(this.getLexicalLevelOffset(p1) + p2),
      );
    });

    // Pág 68 do PDF
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

    this.defineInstruction('AMEM', 'Aloca memória', 1, (p1) => {
      this.moveStackTop(p1);
      //for (let k = 0; k < p2; k++) {
      //this.pushToMemory(this.getValueFromMemory(p1 + k));
      //}
    });

    this.defineInstruction('IMPR', 'Impressão', 0, () => {
      const v = this.popFromMemory();
      console.log('IMPRESSÃO:', v);
      this.console.add(`[MEPA]: ${v}`);
    });

    this.defineInstruction('LEIT', 'Leitura', 0, () => {
      // TODO: implementar "chamada de sistema"
      let p: string;
      do {
        p = prompt('Digite o valor (numérico) para a entrada:');
      } while (isNaN(parseFloat(p)) && p != null);

      let v: number;

      if (p === null) {
        this.console.add(
          '[MEPA]: Entrada cancelada pelo usuário. A entrada será considerada como 0.',
        );
        v = 0;
      } else {
        v = parseFloat(p);
      }
      this.pushToMemory(v);
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
        this.getValueFromMemory(this.stackTop - 1) !== 0 ||
        this.getValueFromMemory(this.stackTop) !== 0
      ) {
        this.setMemorySlot(this.stackTop - 1, 1);
      } else {
        this.setMemorySlot(this.stackTop - 1, 0);
      }
      this.popFromMemory();
    });

    this.defineInstruction('CONJ', 'Conjunção (AND)', 0, () => {
      if (
        this.getValueFromMemory(this.stackTop - 1) !== 0 &&
        this.getValueFromMemory(this.stackTop) !== 0
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

    this.defineInstruction(
      'CREG',
      'Carregar endereço generalizado',
      2,
      (p1, p2) => {
        this.pushToMemory(p1);
        this.pushToMemory(this.getLexicalLevelOffset(p2));
        this.pushToMemory(p2);
      },
    );
  }

  /**
   * Adiciona um comando com base nas definições existentes na META
   *
   * @param name Nome do comando como PARA, CRCT, etc
   * @param p1 Primeiro parâmetro, se existir
   * @param p2 Segundo parâmetro, se existir
   * @param p3 Terceiro parâmetro, se existir
   *
   * @return retorna o endereço do comando criado
   */
  addNewCommand(
    name: string,
    p1: number = null,
    p2: number = null,
    p3: number = null,
  ): number {
    const newCommand = this.createCommand(name, p1, p2, p3);
    this.programQueue.push(newCommand);
    return this.programQueue.length - 1;
  }

  /**
   * Cria um objeto de comando com base nas definições existentes na META
   *
   * @param name Nome do comando como PARA, CRCT, etc
   * @param p1 Primeiro parâmetro, se existir
   * @param p2 Segundo parâmetro, se existir
   * @param p3 Terceiro parâmetro, se existir
   *
   * @return retorna o comando
   */

  createCommand(
    name: string,
    p1: number = null,
    p2: number = null,
    p3: number = null,
  ): Command {
    if (!this.instructions.has(name)) {
      // TODO: adicionar erro
      console.log('ERRO, COMANDO NÃO ENCONTRADO!', name, p1, p2, p3);
      return null;
    }

    const commandRef = this.instructions.get(name);

    if (
      (commandRef.paramsCount === 1 && p1 === null) ||
      (commandRef.paramsCount === 2 && p1 === null && p2 === null) ||
      (commandRef.paramsCount === 3 &&
        p1 === null &&
        p2 === null &&
        p3 === null)
    ) {
      console.log('ERRO: NÚMERO INCORRETO DE PARÂMETROS', name, p1, p2, p3);
      return null;
    }

    const newCommand: Command = {
      name,
      p1,
      p2,
      p3,
      commandRef,
    };

    return newCommand;
  }

  /** Executa o próximo comando e retorna true quando a MEPA estiver ociosa. */
  run(): boolean {
    if (this.isDone()) return true;
    if (this.programCounter > this.programQueue.length) {
      return true;
    }

    const currentCommand = this.programQueue[this.programCounter];
    console.log(currentCommand.commandRef.description);
    currentCommand.commandRef.run(
      currentCommand.p1,
      currentCommand.p2,
      currentCommand.p3,
    );

    this.lastCommand = currentCommand;

    if (!['DSVF', 'DSVS', 'CHPR', 'RTPR'].includes(currentCommand.name))
      this.next();

    return false;
  }

  processProgramText(text: string): boolean {
    const parsedCommands: Command[] = [];
    const lines = text.split('\n').map((s) => s.trim());
    console.log(lines);
    while (lines.length > 0) {
      const current = lines.shift();
      if (current === undefined || current === '') break;
      const r = this.parseCommandAsText(current);
      if (r === null) return false;
      parsedCommands.push(r);
    }

    this.reset();
    this.loadProgram(parsedCommands);

    return true;
  }

  parseCommandAsText(command: string): Command {
    const parts = command.split(' ');
    const name = parts[0];
    const p1 = parts[1] ? parseInt(parts[1]) : undefined;
    const p2 = parts[2] ? parseInt(parts[2]) : undefined;
    const p3 = parts[3] ? parseInt(parts[3]) : undefined;

    return this.createCommand(name, p1, p2, p3);
  }
}
