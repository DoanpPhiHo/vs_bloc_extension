import * as vscode from "vscode";
import { newPage } from "./commands/new-page.commands";
import { newPresentation } from "./commands/new-presentation.commands";
import { newBloc } from "./commands/new-bloc.commands";
import { newModel } from "./commands/new-model.commands";
import { newCore } from "./commands/new-core.commands";
import { newColor } from "./commands/new-color.commands";
import { wrapFunction } from "./commands/wrap-function.commands";
// import * as fs from "fs";
import { newPageMVC } from "./commands/new-page-mvc.commands";
// const DART_MODE = { language: "dart", scheme: "file" };
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bloc-flow" is now active!');

  const provider = new ColorsViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.commands.registerCommand("bloc-flow.new_feature", newPage),
    vscode.commands.registerCommand(
      "bloc-flow.new_feature_bloc_mvc",
      newPageMVC
    ),
    vscode.commands.registerCommand(
      "bloc-flow.new_presentation",
      newPresentation
    ),
    vscode.commands.registerCommand("bloc-flow.new_bloc", newBloc),
    vscode.commands.registerCommand("bloc-flow.new_model", newModel),
    vscode.commands.registerCommand("bloc-flow.new_core", newCore),
    vscode.commands.registerCommand("bloc-flow.new_color", newColor),
    vscode.commands.registerCommand("bloc-flow.wrap-function", wrapFunction),

    vscode.window.registerWebviewViewProvider(
      ColorsViewProvider.viewType,
      provider
    )
  );
}

export function deactivate() {}

class ColorsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "bloc-flow.colorsView";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
		console.log(data);
		
      switch (data.command) {
        case "copy-to-clipboard": {
        //   vscode.window.activeTextEditor?.insertSnippet(
        //     new vscode.SnippetString(`#${data.data}`)
        //   );
		vscode.window.showInformationMessage('copied to clipboard!');
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; frame-src https://ho-doan.github.io?frame=true; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Cat Colors</title>
			</head>
			<body>
        		<iframe id="ho_doan" frameborder="0" sandbox="allow-scripts allow-same-origin" scrolling="yes" flex-grow=1 width="100%" height="100%" src="https://ho-doan.github.io?frame=true"></iframe>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
