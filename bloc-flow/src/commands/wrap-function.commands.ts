import { SnippetString, commands, window } from "vscode";
import { getSelectedTextFunc } from "../utils/get-selected-func";

const interpolatedVarReExp = new RegExp("\\$", "g");

const wrapFunctionSnippet = (func: string) => {
  return `void \${1:func}(){
        ${func}
    }`;
};

export const wrapWith = async (snippet: (widget: string) => string) => {
  let editor = window.activeTextEditor;
  if (!editor) {
    return;
  }
  const selection = getSelectedTextFunc(editor);
  const func = editor.document
    .getText(selection)
    .replace(interpolatedVarReExp, "\\$");
  editor.insertSnippet(new SnippetString(snippet(func)), selection);
  await commands.executeCommand("editor.action.formatDocument");
};

export const wrapFunction = async () => wrapWith(wrapFunctionSnippet);
