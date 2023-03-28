import * as vscode from "vscode";
import { newPage } from "./commans/new-page.commands";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bloc-flow" is now active!');
  let disposable = vscode.commands.registerCommand(
    "bloc-flow.new_page",
    newPage
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
