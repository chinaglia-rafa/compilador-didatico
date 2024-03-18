import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const dummyText = `// teste
{
  teste
  teste
  teste!
}
program teste;
  int alfa, beta;
  boolean omega;
  begin
      alfa:= false;
      beta:= 1 + 1
  end.
  `;

@Injectable({
  providedIn: 'root',
})
export class FilemanagerService {
  /** Texto-fonte presente no editor de texto ou carregado do disco */
  sourceText$ = new BehaviorSubject<string>(dummyText);

  constructor() {}

  /**
   * função responsável para subir um arquivo do tipo text/plain
   * @param arq arquivo que vai ser uplodado
   * @returns não retorna nada (void)
   */
  upload(arq: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (arq.type != 'text/plain') {
        reject(`O formato ${arq.type} não é suportado`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        this.sourceText$.next(reader.result as string);
        resolve(true);
      };
      reader.readAsText(arq);
    });
  }
}
