import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LogEntry, LoggerService } from '../../services/logger/logger.service';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import { LogItemComponent } from '../log-item/log-item.component';
import { CommonModule } from '@angular/common';
import '@material/web/iconbutton/icon-button';
import '@material/web/select/outlined-select';
import '@material/web/select/select-option';

@Component({
  selector: 'logger-display',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, LogItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './logger-display.component.html',
  styleUrl: './logger-display.component.scss',
})
export class LoggerDisplayComponent implements OnInit {
  @ViewChild('scrollbarComponent') scrollbar: NgScrollbar;

  logs: LogEntry[] = [];

  /** indica se os filtros estão expandidos **/
  filterOpened = false;

  currentLogLevel = 2;

  scrolled = false;

  private lastKnownScrollPosition = 0;
  private ticking = false;

  constructor(private loggerService: LoggerService) {}

  ngOnInit(): void {
    this.loggerService.logs$.subscribe((logs) => (this.logs = logs));

    this.currentLogLevel = this.loggerService.level;

    this.loggerService.log('Primeiro log do projeto', 'dev', ['logger'], 0);
    this.loggerService.log(
      'Segundo log bem aqui.',
      'dev',
      ['logger', 'log()'],
      1,
    );
    this.loggerService.log(
      'Aqui nós usaremos as tabelas First e Follow para validar uma certa entrada de tokens. Essa tabela pode ser calculada para qualquer gramática regular, mas a nossa já está em cache :)',
      'edu',
      ['Compilador', 'análise léxica', 'tokenização', 'scan()'],
      1,
    );
    this.loggerService.log(
      'Executando análise léxica...',
      'stp',
      ['logger', 'log()'],
      1,
    );
    this.loggerService.log(
      'Erro: gramática mal-configurada.',
      'err',
      ['Compilador', 'análise léxica', 'tokenização', 'scan()'],
      1,
    );

    setInterval(() => {
      this.loggerService.log(
        'Erro: gramática mal-configurada.',
        'err',
        ['Compilador', 'análise léxica', 'tokenização', 'scan()'],
        1,
      );

      if (
        this.scrollbar.nativeElement.scrollTop ==
        this.scrollbar.nativeElement.scrollHeight -
          this.scrollbar.nativeElement.clientHeight
      )
        this.scrollbar.scrollTo({ bottom: -48 });
    }, 10000);
  }

  scrollUpdate(): void {
    this.lastKnownScrollPosition = this.scrollbar.nativeElement.scrollTop;

    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        if (this.lastKnownScrollPosition === 0) this.scrolled = false;
        else this.scrolled = true;
        this.ticking = false;
      });

      this.ticking = true;
    }
  }

  clear(): void {
    this.loggerService.clear();
  }

  toggleFilters(): void {
    this.filterOpened = !this.filterOpened;

    if (this.filterOpened === false) {
      this.currentLogLevel = 1;
      this.loggerService.setLevel(1);
    }
  }

  logLevelChange(value: string): void {
    this.currentLogLevel = parseInt(value);
    this.loggerService.setLevel(this.currentLogLevel);
  }
}
