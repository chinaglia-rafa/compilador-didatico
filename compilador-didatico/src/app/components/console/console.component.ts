import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import '@material/web/icon/icon';
import { ConsoleService } from '../../services/console/console.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-console',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './console.component.html',
  styleUrl: './console.component.scss',
})
export class ConsoleComponent implements OnDestroy {
  @ViewChild('scrollbarComponent') scrollbar: NgScrollbar;
  @ViewChildren('commandsComponent') commands: QueryList<any>;

  destroyed = new Subject();

  constructor(public consoleService: ConsoleService) {}

  ngAfterViewInit(): void {
    this.commands.changes.pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.scrollbar.scrollTo({ bottom: 0 });
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(true);
    this.destroyed.complete();
  }
}
