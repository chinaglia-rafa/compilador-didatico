import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import '@material/web/button/text-button';
import '@material/web/button/filled-tonal-button';
import { SyntacticAnalysisService } from '../../../services/syntactic-analysis/syntactic-analysis.service';
import { IsTerminalPipe } from '../../../pipes/is-terminal.pipe';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import {
  LogEntry,
  LoggerService,
} from '../../../services/logger/logger.service';
import { map } from 'rxjs';
import { LogItemComponent } from '../../../components/log-item/log-item.component';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-syntactic-analysis',
  standalone: true,
  imports: [
    CommonModule,
    IsTerminalPipe,
    NgScrollbarModule,
    LogItemComponent,
    ScrollingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './syntactic-analysis.component.html',
  styleUrl: './syntactic-analysis.component.scss',
})
export class SyntacticAnalysisComponent implements OnInit {
  @ViewChild('scrollbarStackComponent') scrollbarStack: NgScrollbar;
  @ViewChild('scrollbarTokensComponent') scrollbarTokens: NgScrollbar;
  @ViewChild('scrollbarLogsComponent') scrollbarLogs: NgScrollbar;
  @ViewChild('virtualViewport') virtualScroll: CdkVirtualScrollViewport;

  /** lista de logs filtrada apenas para momentos da análise sintática */
  logs: LogEntry[] = [];
  /** Indica se a tela está no modo tela cheia ou não */
  fullscreen = false;

  constructor(
    public syntacticAnalysisService: SyntacticAnalysisService,
    public loggerService: LoggerService,
  ) {}

  ngOnInit(): void {
    this.loggerService.logs$
      .pipe(map((logs) => logs.filter((log) => log.path.includes('parse()'))))
      .subscribe((logs) => {
        this.logs = logs;
        this.virtualScroll.checkViewportSize();
      });
  }

  stepByStep(): void {
    this.loggerService.clear();

    this.syntacticAnalysisService.startStepByStep();
    this.virtualScroll.checkViewportSize();
  }

  next(): void {
    this.syntacticAnalysisService.parseStep();

    setTimeout(() => {
      this.scrollbarStack.scrollTo({ top: 0 });
      this.scrollbarTokens.scrollTo({ left: 0 });
    }, 100);
  }

  stopStepByStep(): void {
    this.syntacticAnalysisService.stopStepByStep();
  }

  toggleFullscreen(force: boolean = null): void {
    if (force !== null) this.fullscreen = force;
    else this.fullscreen = !this.fullscreen;
  }
}
