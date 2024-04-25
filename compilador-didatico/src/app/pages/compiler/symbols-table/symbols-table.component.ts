import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import {
  SymbolsTableService,
  TableItem,
} from '../../../services/symbols-table/symbols-table.service';

@Component({
  selector: 'app-symbols-table',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule],
  templateUrl: './symbols-table.component.html',
  styleUrl: './symbols-table.component.scss',
})
export class SymbolsTableComponent implements OnInit {
  symbols: TableItem[] = [];

  constructor(private symbolsTableService: SymbolsTableService) {}

  ngOnInit(): void {
    this.symbolsTableService.table$.subscribe((data) => (this.symbols = data));
  }
}
