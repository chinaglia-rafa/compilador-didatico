import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

const dummyText = `
// teste
{
  teste
  teste
  teste!
}
program teste;
  int alfa, beta;
  boolean omega;
  procedure soma(um, dois: int; tres: boolean);
  begin
    um := um + dois;
    end;
procedure sub(um, dois: int; tres: boolean);
  begin
    if (um = 1) then begin
      dois := dois;
    end;
    um := um + dois;
    end;
  begin
      alfa:= false;
      beta:= 1 + 1;
  end.
`;

@Injectable({
  providedIn: 'root',
})
export class FilemanagerService {
  /** Texto-fonte presente no editor de texto ou carregado do disco */
  sourceText$ = new BehaviorSubject<string>('');

  constructor(private loggerService: LoggerService) {}

  setSourceText(str: string): void {
    this.sourceText$.next(str);
  }

  /**
   * função responsável para subir um arquivo do tipo text/plain
   * @param arq arquivo que vai ser enviado
   * @returns promise que resoverá com true caso o upload seja bem sucedido.
   */
  upload(arq: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (arq.type != 'text/plain') {
        this.loggerService.log(
          `O formato ${arq.type} não é suportado`,
          'dev',
          ['Editor', 'gestão de arquivos', 'upload()'],
          2,
        );
        reject(`O formato ${arq.type} não é suportado`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        this.sourceText$.next(reader.result as string);
        this.loggerService.log(
          `Arquivo <strong class="monospace">${arq.name}</strong> carregado com sucesso.`,
          'dev',
          ['Editor', 'gestão de arquivos', 'upload()'],
          2,
        );

        resolve(true);
      };
      reader.readAsText(arq);
    });
  }

  returnNewFile(content: string): File {
    const arr = [content];
    let file = new File(arr, 'new.txt', { type: 'text/plain' });
    return file;
  }
}
