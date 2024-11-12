import { Routes } from '@angular/router';
import { SobreComponent } from './pages/sobre/sobre.component';
import { HomeComponent } from './pages/home/home.component';
import { CodeEditorComponent } from './pages/compiler/code-editor/code-editor.component';
import { LexicalAnalysisComponent } from './pages/compiler/lexical-analysis/lexical-analysis.component';
import { SymbolsTableComponent } from './pages/compiler/symbols-table/symbols-table.component';
import { SyntacticAnalysisComponent } from './pages/compiler/syntactic-analysis/syntactic-analysis.component';
import { LanguageViewerComponent } from './pages/compiler/language-viewer/language-viewer.component';
import { MepaComponent } from './pages/compiler/mepa/mepa.component';
import { CodeGenerationComponent } from './pages/compiler/code-generation/code-generation.component';
import { SyntacticTreeComponent } from './pages/compiler/syntactic-tree/syntactic-tree.component';

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
        path: '',
        pathMatch: 'full',
        redirectTo: 'code-editor',
      },
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
      {
        path: 'symbols',
        component: SymbolsTableComponent,
        data: { animation: 'LexicalAnalysisPage' },
      },
      {
        path: 'syntactic-analysis',
        component: SyntacticAnalysisComponent,
        data: { animation: 'LexicalAnalysisPage' },
      },
      {
        path: 'syntactic-tree',
        component: SyntacticTreeComponent,
        data: { animation: 'LexicalAnalysisPage' },
      },
      {
        path: 'language-viewer',
        component: LanguageViewerComponent,
        data: { animation: 'LexicalAnalysisPage' },
      },
      {
        path: 'mepa',
        component: MepaComponent,
        data: { animation: 'LexicalAnalysisPage' },
      },
      {
        path: 'code-generation',
        component: CodeGenerationComponent,
        data: { animation: 'LexicalAnalysisPage' },
      },
    ],
  },
];
