import {
  CUSTOM_ELEMENTS_SCHEMA,
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
import '@material/web/iconbutton/icon-button';
import '@material/web/switch/switch';
import '@material/web/slider/slider';
import '@material/web/menu/menu';
import '@material/web/menu/menu-item';
import { ConsoleComponent } from '../../../components/console/console.component';
import { ConsoleService } from '../../../services/console/console.service';

@Component({
  selector: 'app-mepa',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, ReversePipe, ConsoleComponent],
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

  stepByStep: boolean = true;
  speed: number = 800;
  canScrollProgram: boolean = true;
  canScrollMemory: boolean = true;

  constructor(
    private consoleService: ConsoleService,
    public mepaService: MepaService,
  ) {}

  ngOnDestroy() {
    this.pause();
  }

  ngAfterViewInit(): void {
    this.scrollbarMemory.scrollTo({ bottom: 0 });
  }

  next(): void {
    if (!this.working && this.mepaService.isDone()) {
      this.consoleService.add(
        '[MEPA]: Reiniciando estado da MEPA para uma nova execução!',
      );
      this.reset();
    }
    this.mepaService.run();
    this.updateScrollbars();
  }

  all(): void {
    if (!this.working && this.mepaService.isDone()) {
      this.consoleService.add(
        '[MEPA]: Reiniciando estado da MEPA para uma nova execução!',
      );
      this.reset();
    }
    this.working = true;
    this.timer = setInterval(
      () => {
        this.mepaService.run();

        this.updateScrollbars();
        if (this.mepaService.isDone()) {
          clearInterval(this.timer);
          this.working = false;
        }
      },
      this.stepByStep === true ? this.speed : 0,
    );
  }
  pause(): void {
    clearInterval(this.timer);
    this.working = false;
  }

  updateScrollbars(): void {
    if (this.canScrollProgram)
      this.scrollbarProgram
        .scrollTo({
          duration: 200,
          top:
            this.programTable.nativeElement.querySelector(
              `#program-id-${this.mepaService.programCounter}`,
              // o 222 é um offset razoável entre o elemento a ser focado e o topo
            ).offsetTop - 222,
        })
        .then(() => (this.canScrollProgram = true));

    if (this.mepaService.stackTop >= 0 && this.canScrollMemory) {
      this.scrollbarMemory
        .scrollTo({
          top:
            this.memoryTable.nativeElement.querySelector(
              `#memory-id-${this.mepaService.stackTop}`,
              // o 30 é um offset razoável entre o elemento a ser focado e o topo
            ).offsetTop - 30,
        })
        .then(() => (this.canScrollMemory = true));

      this.canScrollMemory = false;
    }
    this.canScrollProgram = false;
  }

  /** Evento ativado ao trocar o valor do switch de passo-a-passo */
  stepByStepChanges(event: any): void {
    this.stepByStep = event.target.selected;
    this.pause();
  }

  /** Evento ativado ao trocar o valor do slider de velocidade */
  speedChange(event: any): void {
    this.speed = event.target.value;
    this.pause();
  }

  reset(): void {
    this.pause();
    this.mepaService.restart();
    this.scrollbarProgram.scrollTo({ top: 0 });
    this.scrollbarMemory.scrollTo({ bottom: 0 });
  }
}
