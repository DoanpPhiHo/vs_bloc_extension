import * as vscode from "vscode";
import { newPage } from "./commands/new-page.commands";
import { newPresentation } from "./commands/new-presentation.commands";
import { newBloc } from "./commands/new-bloc.commands";
import { newModel } from "./commands/new-model.commands";
import { newCore } from "./commands/new-core.commands";
import { newColor } from "./commands/new-color.commands";
import { newPageMVC } from "./commands/new-page-mvc.commands";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bloc-flow" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand("bloc-flow.new_feature", newPage),
    vscode.commands.registerCommand("bloc-flow.new_feature_bloc_mvc", newPageMVC),
    vscode.commands.registerCommand(
      "bloc-flow.new_presentation",
      newPresentation
    ),
    vscode.commands.registerCommand("bloc-flow.new_bloc", newBloc),
    vscode.commands.registerCommand("bloc-flow.new_model", newModel),
    vscode.commands.registerCommand("bloc-flow.new_core", newCore),
    vscode.commands.registerCommand("bloc-flow.new_color", newColor),
  );
}

export function deactivate() {}
