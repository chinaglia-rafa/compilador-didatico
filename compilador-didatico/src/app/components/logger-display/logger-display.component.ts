import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
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
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';

@Component({
  selector: 'logger-display',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, LogItemComponent, ScrollingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './logger-display.component.html',
  styleUrl: './logger-display.component.scss',
})
export class LoggerDisplayComponent implements OnInit {
  @ViewChild('scrollbarComponent') scrollbar: NgScrollbar;
  @ViewChild('virtualViewport') virtualScroll: CdkVirtualScrollViewport;

  logs: LogEntry[] = [];

  /** indica se os filtros estão expandidos **/
  filterOpened = false;

  currentLogLevel = 2;

  scrolled = false;

  timer: any;

  private lastKnownScrollPosition = 0;
  private ticking = false;

  constructor(private loggerService: LoggerService) {}

  ngOnInit(): void {
    this.loggerService.logs$.subscribe((logs) => {
      this.logs = logs;
      if (
        this.scrollbar &&
        this.scrollbar.nativeElement.scrollTop ==
          this.scrollbar.nativeElement.scrollHeight -
            this.scrollbar.nativeElement.clientHeight
      )
        this.scrollbar.scrollTo({ bottom: -48 });
    });

    this.currentLogLevel = this.loggerService.level;

    this.timer = setInterval(() => {
      this.virtualScroll?.checkViewportSize();
    }, 2000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
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
