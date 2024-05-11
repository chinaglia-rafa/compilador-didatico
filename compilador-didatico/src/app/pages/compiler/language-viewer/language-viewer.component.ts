import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import {
  FirstList,
  FollowList,
  SyntacticAnalysisService,
} from '../../../services/syntactic-analysis/syntactic-analysis.service';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
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

  constructor(private syntacticAnalysisService: SyntacticAnalysisService) {
    this.syntacticAnalysisService.ready.subscribe((status) => {
      console.log('status', status);
      if (status === false) return;
      this.loading = false;
      this.grammar = this.syntacticAnalysisService.selectedGrammar;
      this.firsts = this.syntacticAnalysisService.firsts;
      this.follows = this.syntacticAnalysisService.follows;
    });
  }
}
