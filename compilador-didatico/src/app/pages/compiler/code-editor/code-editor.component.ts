import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MonacoEditorModule,
  NGX_MONACO_EDITOR_CONFIG,
} from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [MonacoEditorModule, FormsModule],
  providers: [
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: NGX_MONACO_EDITOR_CONFIG },
  ],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss',
})
export class CodeEditorComponent {
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
program teste;
  int alfa, beta;
  boolean omega;
  begin
      alfa:=false;
      beta:= 1 + 1
  end.
  `;

  monaco: any;

  ngAfterViewInit(): void {}

  registerLanguage(monaco: any): void {
    this.monaco.languages.register({ id: 'LALG' });
    const keywords = [
      'program',
      ';',
      '.',
      'procedure',
      'var',
      '(',
      ')',
      ':',
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
      '[',
      ']',
    ];

    this.monaco.languages.setMonarchTokensProvider('LALG', {
      keywords,
      tokenizer: {
        root: [
          [
            /@?[a-zA-Z][\w$]*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@default': 'variable',
              },
            },
          ],
          // [/".*?"/, 'string'],
          [/\d+/, 'number'],
          [/\/\/.*/, 'comment'],
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
    // this.editorOptions.theme = 'LALG-theme';
  }

  initMonacoEditor(editor: any): void {
    // editor.languages.register({ id: 'mylang' });
    console.log('editor', editor.getPosition());
    this.monaco = (window as any).monaco;
    this.registerLanguage(this.monaco);
  }
}
