import { Routes } from '@angular/router';
import { SobreComponent } from './pages/sobre/sobre.component';
import { HomeComponent } from './pages/home/home.component';
import { CodeEditorComponent } from './pages/compiler/code-editor/code-editor.component';
import { LexicalAnalysisComponent } from './pages/compiler/lexical-analysis/lexical-analysis.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'compiler' },
  {
    path: 'sobre',
    component: SobreComponent,
    data: { animation: 'AboutPage' },
  },
  {
    path: 'compiler',
    component: HomeComponent,
    data: { animation: 'HomePage' },
    children: [
      {
        path: 'code-editor',
        component: CodeEditorComponent,
        data: { animation: 'CodeEditorPage' },
      },
      {
        path: 'lexical-analysis',
        component: LexicalAnalysisComponent,
        data: { animation: 'LexicalAnalysisPage' },
      },
    ],
  },
];
