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

@Component({
  selector: 'app-syntactic-analysis',
  standalone: true,
  imports: [CommonModule, IsTerminalPipe, NgScrollbarModule, LogItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './syntactic-analysis.component.html',
  styleUrl: './syntactic-analysis.component.scss',
})
export class SyntacticAnalysisComponent implements OnInit {
  @ViewChild('scrollbarStackComponent') scrollbarStack: NgScrollbar;
  @ViewChild('scrollbarTokensComponent') scrollbarTokens: NgScrollbar;

  /** lista de logs filtrada apenas para momentos da análise sintática */
  logs: LogEntry[] = [];

  constructor(
    public syntacticAnalysisService: SyntacticAnalysisService,
    public loggerService: LoggerService,
  ) {}

  ngOnInit(): void {
    this.loggerService.logs$
      .pipe(map((logs) => logs.filter((log) => log.path.includes('parse()'))))
      .subscribe((logs) => (this.logs = logs));
  }

  stepByStep(): void {
    this.syntacticAnalysisService.startStepByStep();
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
}
