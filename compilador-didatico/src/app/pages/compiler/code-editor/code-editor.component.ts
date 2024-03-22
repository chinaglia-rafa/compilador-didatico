import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  NgZone,
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

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [
    MonacoEditorModule,
    FormsModule,
    ConsoleComponent,
    LoggerDisplayComponent,
    OpenFileComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: NGX_MONACO_EDITOR_CONFIG },
  ],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss',
})
export class CodeEditorComponent implements OnInit {
  @ViewChild('panel1Element') panel1?: ElementRef;
  @ViewChild('panel2Element') panel2?: ElementRef;
  @ViewChild('panel3Element') panel3?: ElementRef;

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
  code: string = `// teste
{
  teste
  teste
  teste!
}
program teste;
  int alfa, beta;
  boolean omega;
  begin
      alfa:= false;
      beta:= 1 + 1
  end.
  `;

  monaco: any;

  constructor(
    private loggerService: LoggerService,
    private ngZone: NgZone,
    private filemanager: FilemanagerService,
    private compilerService: CompilerService,
  ) {}

  ngOnInit(): void {
    this.filemanager.sourceText$.subscribe((data) => (this.code = data));
  }

  registerLanguage(monaco: any): void {
    this.monaco.languages.register({ id: 'LALG' });
    const keywords = [
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

    const symbols = [';', '.', '(', ')', ':', '[', ']'];

    const operators = [
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

    this.monaco.languages.setMonarchTokensProvider('LALG', {
      keywords,
      operators,
      symbols,
      tokenizer: {
        root: [
          [
            /[a-zA-Z][\w$]*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@default': 'variable',
              },
            },
          ],
          [
            /[\+\-\<\>\*\=\:\;\.\(\)\\[\]\,]+$/,
            {
              cases: {
                '@symbols': 'symbols',
                '@operators': 'operator',
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

    const tabs = [this.panel1, this.panel2, this.panel3];
    for (const tab of tabs) tab?.nativeElement.setAttribute('hidden', true);
    tabs[index]?.nativeElement.removeAttribute('hidden');
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
}
