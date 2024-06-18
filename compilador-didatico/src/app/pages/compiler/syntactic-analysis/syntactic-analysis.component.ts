import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import '@material/web/iconbutton/icon-button';
import '@material/web/button/text-button';
import '@material/web/button/filled-tonal-button';

import { SyntacticAnalysisService } from '../../../services/syntactic-analysis/syntactic-analysis.service';
import { NgxGraphModule } from '@kr0san89/ngx-graph';

@Component({
  selector: 'app-syntactic-analysis',
  standalone: true,
  imports: [CommonModule, NgxGraphModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './syntactic-analysis.component.html',
  styleUrl: './syntactic-analysis.component.scss',
})
export class SyntacticAnalysisComponent {
  fullscreen = false;

  constructor(public syntacticAnalysisService: SyntacticAnalysisService) {}

  next(): void {
    this.syntacticAnalysisService.parseStep();
  }

  stepByStep(): void {
    this.syntacticAnalysisService.startStepByStep();
  }
}
