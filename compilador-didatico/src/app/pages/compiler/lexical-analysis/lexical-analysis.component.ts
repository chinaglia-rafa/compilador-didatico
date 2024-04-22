import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  LexicalAnalysisService,
  Token,
} from '../../../services/lexical-analysis/lexical-analysis.service';
import { TokenComponent } from '../../../components/token/token.component';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-lexical-analysis',
  standalone: true,
  imports: [CommonModule, TokenComponent, NgScrollbarModule],
  templateUrl: './lexical-analysis.component.html',
  styleUrl: './lexical-analysis.component.scss',
})
export class LexicalAnalysisComponent implements AfterViewInit, OnInit {
  tokens: Token[] = [];

  constructor(private lexicalAnalysisService: LexicalAnalysisService) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.lexicalAnalysisService.tokens$.subscribe((tokens) => {
      this.tokens = tokens;
    });
  }
}
