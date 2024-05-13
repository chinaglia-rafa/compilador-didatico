import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  FirstList,
  FollowList,
  SyntacticAnalysisService,
} from '../../../services/syntactic-analysis/syntactic-analysis.service';
import { CommonModule } from '@angular/common';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import '@material/web/textfield/outlined-text-field';
import '@material/web/textfield/filled-text-field';
import '@material/web/icon/icon';
import '@material/web/iconbutton/icon-button';
import { Grammar } from '../../../grammar/grammar.model';

@Component({
  selector: 'app-language-viewer',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './language-viewer.component.html',
  styleUrl: './language-viewer.component.scss',
})
export class LanguageViewerComponent {
  loading: boolean = true;

  firsts: FirstList[];
  follows: FollowList[];

  grammar: Grammar;

  toBeHighlighted: string = '';

  /** contagem de símbolos encontrados na busca */
  totalFound: number = 0;
  /** índice do símbolo focado no momento */
  focused: number = -1;

  foundCache: HTMLElement[] = [];

  @ViewChild('content') contentElement: ElementRef;
  @ViewChild('scrollbarComponent') scrollbar: NgScrollbar;
  @ViewChild('search') searchComponent: ElementRef;

  constructor(private syntacticAnalysisService: SyntacticAnalysisService) {
    this.syntacticAnalysisService.ready.subscribe((status) => {
      if (status === false) return;
      this.loading = false;
      this.grammar = this.syntacticAnalysisService.selectedGrammar;
      this.firsts = this.syntacticAnalysisService.firsts;
      this.follows = this.syntacticAnalysisService.follows;
    });
  }

  mouseEnter(name: string): void {
    if (this.toBeHighlighted !== '') return;
    this.toBeHighlighted = name;
  }

  mouseLeave(): void {
    this.toBeHighlighted = '';
  }

  searchNext(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.totalFound === 0) return;
      if (this.focused >= 0)
        this.foundCache[this.focused].classList.remove('focused');
      if (this.focused + 1 === this.totalFound) this.focused = 0;
      else this.focused++;
      this.foundCache[this.focused].classList.add('focused');
      this.scrollbar.scrollToElement(this.foundCache[this.focused]);

      return;
    }

    this.updateSearch();
  }

  updateSearch(): void {
    this.focused = -1;

    const found = this.contentElement.nativeElement.querySelectorAll('.symbol');
    let total = 0;
    this.foundCache = [];
    for (let i = 0; i < found.length; i++) {
      if (!found[i].classList.contains('found')) continue;
      total++;
      this.foundCache.push(found[i]);
    }
    this.totalFound = total;
  }

  selectSymbol(name: string): void {
    this.resetSearch();
    this.searchComponent.nativeElement.value = name;
    this.searchComponent.nativeElement.focus();
    setTimeout(() => this.updateSearch(), 200);
  }

  resetSearch(): void {
    this.searchComponent.nativeElement.value = '';
    this.totalFound = 0;
    this.focused = -1;
    this.contentElement.nativeElement
      .querySelectorAll('.focused')
      .forEach((el: HTMLElement) => {
        el.classList.remove('focused');
      });
  }
}
