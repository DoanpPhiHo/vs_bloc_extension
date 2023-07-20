import * as vscode from "vscode";
import { newPage } from "./commands/new-page.commands";
import { newPresentation } from "./commands/new-presentation.commands";
import { newBloc } from "./commands/new-bloc.commands";
import { newModel } from "./commands/new-model.commands";
import { newCore } from "./commands/new-core.commands";
import { newColor } from "./commands/new-color.commands";
import { wrapFunction } from "./commands/wrap-function.commands";
import { getSelectedTextFunc } from "./utils/get-selected-func";
const DART_MODE = { language: "dart", scheme: "file" };
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bloc-flow" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand("bloc-flow.new_feature", newPage),
    vscode.commands.registerCommand(
      "bloc-flow.new_presentation",
      newPresentation
    ),
    vscode.commands.registerCommand("bloc-flow.new_bloc", newBloc),
    vscode.commands.registerCommand("bloc-flow.new_model", newModel),
    vscode.commands.registerCommand("bloc-flow.new_core", newCore),
    vscode.commands.registerCommand("bloc-flow.new_color", newColor),
    vscode.commands.registerCommand("bloc-flow.wrap-function", wrapFunction),
    vscode.languages.registerCodeActionsProvider(
      DART_MODE,
      new BlocFlowProvider()
    )
  );
}

export function deactivate() {}

class BlocFlowProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Selection | vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    return [
      {
        command: "bloc-flow.wrap-function",
        title: "Wrap function",
      },
    ];
  }
}
