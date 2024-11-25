var d={LEX_NOT_IN_ALPHABET:{code:100,desc:"Caractere n\xE3o encontrado no alfabeto"},LEX_MALFORMED_FLOAT:{code:101,desc:"N\xFAmero real mal-formatado encontrado."},LEX_NUMBER_TOO_BIG:{code:102,desc:"N\xFAmero excede tamanho m\xE1ximo permitido."},LEX_IDENTIFIER_TOO_BIG:{code:103,desc:"Identificador excede tamanho m\xE1ximo permitido."},LEX_INVALID_IDETIFIER:{code:104,desc:"Identificador inv\xE1lido encontrado."},LEX_UNEXPECTED_EOF:{code:105,desc:"O arquivo acabou de forma inesperada. Talvez haja um } faltante."},SYN_VALUE_EXPECTED:{code:200,desc:"Identificador v\xE1lido ou valor experado."},SYN_NUMBER_EXPECTED:{code:201,desc:"N\xFAmero esperado n\xE3o foi encontrado."},SYN_UNEXPECTED_TOKEN:{code:202,desc:"Trecho inesperado encontrado."},SYN_UNEXPECTED_EOF:{code:203,desc:"O arquivo acabou de forma inesperada. Token esperada n\xE3o foi encontrada."},SEM_VARIABLE_NOT_DECLARED:{code:300,desc:"A seguinte vari\xE1vel foi utilizada antes de sua declara\xE7\xE3o neste escopo:"},SEM_VARIABLE_NOT_USED:{code:301,desc:"A seguinte vari\xE1vel foi declarada, mas n\xE3o foi utilizada:"}};var f,C=[],m=[],_=-1,E=[],p=!1;function x(o){return o===""?!1:o===" "||o==="	"?!0:f.alphabet.includes(o)}function l(o){let t=f.reservedWords.find(s=>s.token===o);return t!==void 0?t.desc:/(^\.\d*$)|(^\d*\.$)/.test(o)?"n\xFAmero-real-mal-formatado":/^\d+\.\d+$/.test(o)?"n\xFAmero-real":/^\d+$/.test(o)?o.length<=8?"n\xFAmero-natural":"n\xFAmero-natural-muito-longo":/^[a-zA-z_][a-zA-z_0-9]*$/.test(o)?o.length<=15?"identificador-v\xE1lido":"identificador-muito-longo":"identificador-inv\xE1lido"}function c(o,t,s,i){o.row=t,o.col=s-o.lexema.length,o.token==="n\xFAmero-real-mal-formatado"?m.push({errorCode:d.LEX_MALFORMED_FLOAT.code,startRow:t,startCol:s-o.lexema.length,endRow:t,endCol:s,lineContent:i}):o.token==="n\xFAmero-natural-muito-longo"?m.push({errorCode:d.LEX_NUMBER_TOO_BIG.code,startRow:t,startCol:s-o.lexema.length,endRow:t,endCol:s,lineContent:i}):o.token==="identificador-muito-longo"?m.push({errorCode:d.LEX_IDENTIFIER_TOO_BIG.code,startRow:t,startCol:s-o.lexema.length,endRow:t,endCol:s,lineContent:i}):o.token==="identificador-inv\xE1lido"&&m.push({errorCode:d.LEX_INVALID_IDETIFIER.code,startRow:t,startCol:s-o.lexema.length,endRow:t,endCol:s,lineContent:i}),p?(p=!1,C.push({...o,scope:_-1})):C.push({...o,scope:_});let n=["program","procedure","begin"],e=["end"];return n.includes(o.lexema)?(E.push(o.lexema),o.lexema==="procedure"&&(p=!0),o.lexema!=="begin"&&_++):e.includes(o.lexema)&&(E.pop(),E[E.length-1]!=="begin"&&(_--,E.pop())),o}function u(){return{lexema:"",token:"",row:-1,col:-1}}addEventListener("message",({data:o})=>{f=o;let t=!1,s=f.code.split(`
`);for(let i=0;i<s.length;i++){let n=s[i];if(n==="")continue;let e=u();for(let r=0;r<n.length;r++){let a=n[r];if(a==="{"&&(t=!0),t&&a==="}"){t=!1;continue}if(!t){if(r<n.length-1&&a===n[r+1]&&a===f.oneLineComment)break;if(!x(a)){console.log("Caractere n\xE3o contido no alfabeto"),e.token=l(e.lexema),c(e,i,r,n),e=u(),e.lexema=a,e.token=l(e.lexema),c(e,i,r,n),m.push({errorCode:d.LEX_NOT_IN_ALPHABET.code,startRow:i,startCol:r,endRow:i,endCol:r+1,lineContent:n}),e=u();continue}if(f.dividers.includes(a)){if(e.lexema!==""&&(e.token=l(e.lexema),c(e,i,r,n),e=u()),a===" "||a==="	")continue;a===":"&&n[r+1]==="="?e.lexema=":=":a===">"&&n[r+1]==="="?e.lexema=">=":a==="<"?n[r+1]==="="?e.lexema="<=":n[r+1]===">"?e.lexema="<>":e.lexema=a:e.lexema=a,e.token=l(e.lexema),c(e,i,r,n),[":=",">=","<=","<>"].includes(e.lexema)&&(r+=1),e=u();continue}else if(a==="."&&e.lexema==="end"){e.token=l(e.lexema),c(e,i,r,n),e=u(),e.lexema=a,e.token=l(e.lexema),c(e,i,r,n),e=u();continue}e.lexema+=a}}e.lexema!==""&&(e.token=l(e.lexema),c(e,i,n.length-1,n))}t===!0&&m.push({errorCode:d.LEX_UNEXPECTED_EOF.code,startRow:s.length-1,startCol:0,endRow:s.length-1,endCol:0,lineContent:""}),postMessage({tokens:C,errors:m})});