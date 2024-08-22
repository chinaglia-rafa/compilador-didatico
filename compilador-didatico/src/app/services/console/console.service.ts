import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConsoleService {
  messages: string[] = [];

  constructor() {}

  clear(): void {
    this.messages = [];
  }

  add(text: string): void {
    // Estou usando essa técnica estranha ao invés de .push()
    // porque eu sei de antemão que vou querer que os templates
    // do Angular atualizem ao adicionar, e gerar uma nova array
    // causa isso automaticamente, ao invés de apenas adicionar
    // ou remover elementos.
    //
    // bjos, R.
    this.messages = [...this.messages, text];
  }
}
