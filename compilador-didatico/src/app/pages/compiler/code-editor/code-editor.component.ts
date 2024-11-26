import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MonacoEditorModule,
  NGX_MONACO_EDITOR_CONFIG,
} from 'ngx-monaco-editor-v2';
import '@material/web/tabs/tabs';
import '@material/web/tabs/primary-tab';
import '@material/web/tabs/secondary-tab';
import '@material/web/button/filled-tonal-button';
import { ConsoleComponent } from '../../../components/console/console.component';
import { LoggerDisplayComponent } from '../../../components/logger-display/logger-display.component';
import { LoggerService } from '../../../services/logger/logger.service';
import { OpenFileComponent } from '../../../components/open-file/open-file.component';
import { FilemanagerService } from '../../../services/filemanager/filemanager.service';
import { CompilerService } from '../../../services/compiler/compiler.service';
import { ErrorsService } from '../../../services/errors/errors.service';
import { ErrorDisplayComponent } from '../../../components/error-display/error-display.component';
import '@material/web/dialog/dialog';
import { MdDialog } from '@material/web/dialog/dialog';

export const EDITOR_KEYWORDS = [
  'program',
  'procedure',
  'var',
  'int',
  'boolean',
  'read',
  'write',
  'true',
  'false',
  'begin',
  'end',
  'if',
  'then',
  'else',
  'while',
  'do',
];

export const EDITOR_SYMBOLS = [';', '.', '(', ')', ':', '[', ']'];

export const EDITOR_OPERATORS = [
  ':=',
  '=',
  '<>',
  '>',
  '<',
  '<=',
  '=>',
  '+',
  '-',
  '*',
  'div',
  'and',
  'or',
  'not',
];

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [
    MonacoEditorModule,
    FormsModule,
    ConsoleComponent,
    LoggerDisplayComponent,
    OpenFileComponent,
    ErrorDisplayComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: NGX_MONACO_EDITOR_CONFIG },
  ],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss',
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  //@ViewChild('panel1Element') panel1?: ElementRef;
  @ViewChild('panel2Element') panel2?: ElementRef;
  @ViewChild('panel3Element') panel3?: ElementRef;

  @ViewChild('confirmNewDialog') confirmNewDialogComponent: ElementRef;

  confirmNewDialogOpen: boolean = false;

  editorOptions = {
    minimap: { enabled: false },
    scrollbar: { verticalScrollbarSize: '5px', horizontalScrollbarSize: '5px' },
    contextmenu: false,
    overviewRulerBorder: false,
    rulers: {},
    hideCursorInOverviewRuler: true,
    padding: { top: '16px', bottom: '0' },
    lineHeight: '27px',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    fontSize: '20px',
    theme: 'vs-light',
    language: 'LALG',
  };
  code: string = '';

  monaco: any;

  constructor(
    private loggerService: LoggerService,
    private ngZone: NgZone,
    private filemanager: FilemanagerService,
    private compilerService: CompilerService,
    private errorService: ErrorsService,
  ) {}

  ngOnInit(): void {
    this.filemanager.sourceText$.subscribe((data) => {
      this.code = data;
      this.compilerService.updateLineCount(this.code);
    });
  }

  ngOnDestroy(): void {
    this.filemanager.setSourceText(this.code);
  }

  registerLanguage(monaco: any): void {
    this.monaco.languages.register({ id: 'LALG' });

    this.monaco.languages.setMonarchTokensProvider('LALG', {
      EDITOR_KEYWORDS,
      EDITOR_OPERATORS,
      EDITOR_SYMBOLS,
      tokenizer: {
        root: [
          [
            /[a-zA-Z][\w$]*/,
            {
              cases: {
                '@EDITOR_KEYWORDS': 'keyword',
                '@default': 'variable',
              },
            },
          ],
          [
            /[\+\-\<\>\*\=\:\;\.\(\)\\[\]\,]+$/,
            {
              cases: {
                '@EDITOR_SYMBOLS': 'symbols',
                '@EDITOR_OPERATORS': 'operator',
              },
            },
          ],
          [/\d+/, 'number'],
          [/\/\/.*/, 'comment'],
          [/{/, 'comment', '@comment'],
        ],
        comment: [
          [/}/, 'comment', '@pop'],
          [/./, 'comment.content'],
        ],
      },
    });

    this.monaco.editor.defineTheme('LALG-theme', {
      base: 'vs',
      colors: {
        'editor.background': '#fff8f6',
        'editorLineNumber.foreground': '#c0a9a2',
        'editorLineNumber.activeForeground': '#ff8d77',
        'editor.lineHighlightBackground': '#e9d6d270',
        'editor.selectionBackground': '#ffc2b6',
        'editor.wordHighlightBackground': '#ffdad6',
        // 'editorIndentGuide.background': '#e9d6d2B0',
        // 'editor.lineHighlightBorder': '#e9d6d270',
      },
      rules: [
        { token: 'keyword', foreground: '#a13e2c', fontStyle: 'bold' },
        { token: 'operator', foreground: '#231917' },
        { token: 'symbols', foreground: '#231917' },
        { token: 'comment', foreground: '#999999' },
        { token: 'number', foreground: '#4caf50' },
        { token: 'variable', foreground: '#686000' },
      ],
    });

    monaco.editor.addKeybindingRules([
      {
        keybinding: monaco.KeyCode.F1,
        command: '', // ID
        when: 'textInputFocus', // When
      },
    ]);

    this.monaco.editor.setTheme('LALG-theme');
  }

  setCommands(editor: any): void {
    editor.addAction({
      id: 'compile',
      label: 'Compilar',
      keybindings: [this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.Enter],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 0,
      run: () => {
        this.compile();
      },
    });
  }

  initMonacoEditor(editor: any): void {
    this.monaco = (window as any).monaco;
    this.registerLanguage(this.monaco);
    this.setCommands(editor);

    this.monaco.editor.getModels()[0].onDidChangeContent(() => {
      this.onChange();
      this.monaco.editor.setModelMarkers(editor.getModel(), 'test', []);
    });

    this.errorService.errors$.subscribe((errors) => {
      this.monaco.editor.setModelMarkers(
        editor.getModel(),
        'test',
        errors.map((err) => ({
          startLineNumber: err.startRow + 1,
          startColumn: err.startCol + 1,
          endLineNumber: err.endRow + 1,
          startLine: err.endCol + 1,
          message: err.description,
          severity: this.monaco.MarkerSeverity.Error,
        })),
      );
    });
  }

  /**
   * Implementa manualmente a troca de abas (sem animação, por enquanto)
   * TODO: adicionar animações :)
   * @param event Evento vindo de md-tabs
   * @returns
   */
  tabChange(event: Event): void {
    const index = (event.target as any)?.activeTabIndex;

    if (index === undefined) return;

    const tabs = [/*this.panel1*/ this.panel2, this.panel3];
    for (const tab of tabs) tab?.nativeElement.setAttribute('hidden', true);
    tabs[index]?.nativeElement.removeAttribute('hidden');
  }

  onChange(): void {
    this.compilerService.updateLineCount(
      this.monaco.editor.getModels()[0].getValue(),
    );
  }

  compile(): void {
    this.ngZone.run(() => {
      this.loggerService.log('Compilando.', 'stp', ['Compilador', 'editor'], 0);
      this.compilerService.compile(this.code);
    });
  }

  download(): void {
    let file = this.filemanager.returnNewFile(this.code);
    const link = document.createElement('a');
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /** Abre o prompt confirmando o reset do conteúdo do editor */
  newFilePrompt(): void {
    this.confirmNewDialogOpen = true;
  }

  /** limpa o conteúdo do editor de código e reseta a compilação prévia */
  newFile(): void {
    this.code = '';
    this.compilerService.resetCompilation();
  }

  /** evento chamado ao fechar o dialog tendo escolhido uma opção */
  dialogClosed(): void {
    if (this.confirmNewDialogComponent.nativeElement.returnValue === 'ok') {
      this.newFile();
    }
    this.confirmNewDialogOpen = false;
  }
}
