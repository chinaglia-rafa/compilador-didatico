import { Component, OnInit, ViewChild } from '@angular/core';
import { LogEntry, LoggerService } from '../../services/logger/logger.service';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import { LogItemComponent } from '../log-item/log-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'logger-display',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, LogItemComponent],
  templateUrl: './logger-display.component.html',
  styleUrl: './logger-display.component.scss',
})
export class LoggerDisplayComponent implements OnInit {
  @ViewChild('scrollbarComponent') scrollbar: NgScrollbar;

  logs: LogEntry[] = [];

  constructor(private loggerService: LoggerService) {}

  ngOnInit(): void {
    this.loggerService.logs$.subscribe((logs) => (this.logs = logs));

    this.loggerService.log('Primeiro log do projeto', 'dev', ['logger'], 0);
    this.loggerService.log(
      'Segundo log bem aqui.',
      'dev',
      ['logger', 'log()'],
      1
    );
    this.loggerService.log(
      'Aqui nós usaremos as tabelas First e Follow para validar uma certa entrada de tokens. Essa tabela pode ser calculada para qualquer gramática regular, mas a nossa já está em cache :)',
      'edu',
      ['Compilador', 'análise léxica', 'tokenização', 'scan()'],
      1
    );
    this.loggerService.log(
      'Executando análise léxica...',
      'stp',
      ['logger', 'log()'],
      1
    );
    this.loggerService.log(
      'Erro: gramática mal-configurada.',
      'err',
      ['Compilador', 'análise léxica', 'tokenização', 'scan()'],
      1
    );

    setInterval(() => {
      this.loggerService.log(
        'Erro: gramática mal-configurada.',
        'err',
        ['Compilador', 'análise léxica', 'tokenização', 'scan()'],
        1
      );

      if (
        this.scrollbar.nativeElement.scrollTop ==
        this.scrollbar.nativeElement.scrollHeight -
          this.scrollbar.nativeElement.clientHeight
      )
        this.scrollbar.scrollTo({ bottom: -48 });
    }, 10000);
  }
}
