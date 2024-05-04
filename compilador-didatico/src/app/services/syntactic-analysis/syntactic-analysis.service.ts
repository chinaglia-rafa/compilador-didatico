import { Injectable } from '@angular/core';
import { Grammar } from '../../grammar/grammar.model';
import { lalg } from '../../grammar/LALG';

@Injectable({
  providedIn: 'root',
})
export class SyntacticAnalysisService {
  selectedGrammar: Grammar;

  constructor() {
    this.selectedGrammar = lalg;

    console.log('LALG:', this.selectedGrammar);
  }
}
