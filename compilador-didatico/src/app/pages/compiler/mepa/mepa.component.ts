import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MepaService } from '../../../services/mepa/mepa.service';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule } from '@angular/common';
import { ReversePipe } from '../../../pipes/reverse.pipe';
import '@material/web/icon/icon';
import '@material/web/button/filled-tonal-button';

@Component({
  selector: 'app-mepa',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, ReversePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mepa.component.html',
  styleUrl: './mepa.component.scss',
})
export class MepaComponent implements OnDestroy {
  @ViewChild('scrollbarMemoryComponent') scrollbarMemory: NgScrollbar;
  @ViewChild('scrollbarProgramComponent') scrollbarProgram: NgScrollbar;
  @ViewChild('programTableComponent') programTable: ElementRef;
  @ViewChild('memoryTableComponent') memoryTable: ElementRef;

  timer: any;
  working: boolean = false;

  constructor(
    public mepaService: MepaService,
    private changeDetection: ChangeDetectorRef,
  ) {}

  ngOnDestroy() {
    this.mepaService.memoryChanges$.unsubscribe();
    this.pause();
  }

  ngAfterViewInit(): void {
    this.scrollbarMemory.scrollTo({ bottom: 0 });
  }

  next(): void {
    this.mepaService.run();
    this.updateScrollbars();
  }

  all(): void {
    this.working = true;
    this.timer = setInterval(() => {
      this.mepaService.run();

      this.updateScrollbars();
      if (this.mepaService.isDone()) {
        clearInterval(this.timer);
        this.working = false;
      }
    }, 1000);
  }
  pause(): void {
    clearInterval(this.timer);
    this.working = false;
  }

  updateScrollbars(): void {
    console.log(`#program-id-${this.mepaService.programCounter}`);
    this.scrollbarProgram.scrollTo({
      top:
        this.programTable.nativeElement.querySelector(
          `#program-id-${this.mepaService.programCounter}`,
          // o 222 é um offset razoável entre o elemento a ser focado e o topo
        ).offsetTop - 222,
    });

    if (this.mepaService.stackTop >= 0) {
      this.scrollbarMemory.scrollTo({
        top:
          this.memoryTable.nativeElement.querySelector(
            `#memory-id-${this.mepaService.stackTop}`,
            // o 222 é um offset razoável entre o elemento a ser focado e o topo
          ).offsetTop - 30,
      });
    }
  }
}
