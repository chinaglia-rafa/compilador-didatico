import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule } from '@angular/common';
import { Error, ErrorsService } from '../../services/errors/errors.service';
import '@material/web/iconbutton/icon-button';
import '@material/web/select/outlined-select';
import '@material/web/select/select-option';
import { ErrorItemComponent } from '../error-item/error-item.component';

@Component({
  selector: 'error-display',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, ErrorItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './error-display.component.html',
  styleUrl: './error-display.component.scss',
})
export class ErrorDisplayComponent implements OnInit {
  /** lista local de erros de compilação */
  errors: Error[] = [];

  @ViewChild('scrollbarComponent') scrollbar: NgScrollbar;

  /** indica se os filtros estão expandidos **/
  filterOpened = false;

  scrolled = false;

  private lastKnownScrollPosition = 0;
  private ticking = false;

  constructor(private errorsService: ErrorsService) {}

  ngOnInit(): void {
    this.errorsService.errors$.subscribe((errors) => {
      this.errors = errors;
    });
  }

  clear(): void {
    this.errorsService.reset();
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
}
