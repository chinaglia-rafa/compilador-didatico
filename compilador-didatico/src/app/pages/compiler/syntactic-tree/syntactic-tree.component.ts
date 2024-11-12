import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ViewChild } from '@angular/core';
import '@material/web/iconbutton/icon-button';
import '@material/web/button/text-button';
import '@material/web/button/filled-tonal-button';

import { SyntacticAnalysisService } from '../../../services/syntactic-analysis/syntactic-analysis.service';
import {
  GraphComponent,
  NgxGraphModule,
  NgxGraphStateChangeEvent,
  NgxGraphStates,
} from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-syntactic-tree',
  standalone: true,
  imports: [CommonModule, NgxGraphModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './syntactic-tree.component.html',
  styleUrl: './syntactic-tree.component.scss',
})
export class SyntacticTreeComponent {
  fullscreen = false;

  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  panToNode$: Subject<string> = new Subject();
  zoomToFit$: Subject<{ force: boolean; autoCenter: boolean }> = new Subject();

  @ViewChild('graph') graphComponent: GraphComponent;

  constructor(public syntacticAnalysisService: SyntacticAnalysisService) {}

  next(): void {
    const nodeCount = this.syntacticAnalysisService.syntacticTree.nodes.length;

    while (
      nodeCount === this.syntacticAnalysisService.syntacticTree.nodes.length &&
      this.syntacticAnalysisService.started
    )
      this.syntacticAnalysisService.parseStep();
  }

  stopStepByStep(): void {
    this.syntacticAnalysisService.stopStepByStep();
  }

  stateChange(event: NgxGraphStateChangeEvent): void {
    if (
      event.state !== NgxGraphStates.Output ||
      !this.graphComponent?.hasDims()
    ) {
      return;
    }

    if (!this.syntacticAnalysisService.autoMode) {
      this.centerOnNode(
        this.syntacticAnalysisService.syntacticTree.nodes[
          this.syntacticAnalysisService.syntacticTree.nodes.length - 1
        ].id,
      );
    }
  }

  stepByStep(): void {
    this.syntacticAnalysisService.startStepByStep();
  }

  updateGraph() {
    this.update$.next(true);
  }

  centerOnRoot(): void {
    this.graphComponent.zoomLevel = 1;
    this.centerOnNode('node_1');
  }

  toggleFullscreen(force: boolean = null): void {
    if (force !== null) this.fullscreen = force;
    else this.fullscreen = !this.fullscreen;
    setTimeout(() => {
      this.updateGraph();
    }, 150);
  }

  centerGraph() {
    this.center$.next(true);
  }

  centerOnNode(nodeID: string) {
    this.panToNode$.next(nodeID);
  }

  fitGraph() {
    this.zoomToFit$.next({ force: true, autoCenter: true });
  }
}
