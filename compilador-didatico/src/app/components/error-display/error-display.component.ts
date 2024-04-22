import { Component, OnInit } from '@angular/core';
import { LogItemComponent } from '../log-item/log-item.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule } from '@angular/common';
import { Error, ErrorsService } from '../../services/errors/errors.service';

@Component({
  selector: 'error-display',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, LogItemComponent],
  templateUrl: './error-display.component.html',
  styleUrl: './error-display.component.scss',
})
export class ErrorDisplayComponent implements OnInit {
  /** lista local de erros de compilação */
  errors: Error[] = [];

  /** indica se os filtros estão expandidos **/
  filterOpened = false;

  scrolled = false;

  constructor(private errorsService: ErrorsService) {}

  ngOnInit(): void {
    this.errorsService.errors$.subscribe((errors) => {
      console.log(errors);
      this.errors = errors;
    });
  }
}
