import { Injectable } from '@angular/core';
import { LexicalAnalysisService } from '../lexical-analysis/lexical-analysis.service';

@Injectable({
  providedIn: 'root',
})
export class CompilerService {
  constructor(private lexicalAnalysisService: LexicalAnalysisService) {}

  compile(): void {
    this.lexicalAnalysisService.scan();
  }
}
