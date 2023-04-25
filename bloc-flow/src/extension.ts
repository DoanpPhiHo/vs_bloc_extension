import * as vscode from "vscode";
import { newPage } from "./commans/new-page.commands";
import fetch, { Headers } from "node-fetch";
import { log } from "console";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bloc-flow" is now active!');
  let disposable = vscode.commands.registerCommand(
    "bloc-flow.new_page",
    newPage
  );

  // const rootPath =
  //   vscode.workspace.workspaceFolders &&
  //     vscode.workspace.workspaceFolders.length > 0
  //     ? vscode.workspace.workspaceFolders[0].uri.fsPath
  //     : undefined;

  // vscode.window.registerTreeDataProvider(
  //   "bloc-flow",
  //   new DepNodeProvider(rootPath)
  // );
  context.subscriptions.push(disposable);
  const provider = new ColorsViewProvider(
    context.extensionUri,
    context.globalState
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ColorsViewProvider.viewType,
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bloc-flow.addColor", () => {
      provider.addColor();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bloc-flow.clearColors", () => {
      provider.clearColors();
    })
  );
}

export function deactivate() {}

const decode = (str: string): string =>
  Buffer.from(str, "base64").toString("binary");
const encode = (str: string): string =>
  Buffer.from(str, "binary").toString("base64");

class ColorsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "bloc-flow.colorsView";
  private token?: string;
  private sha?: string;
  private imageNew?: string;

  private dataGit = <any>[];

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly store: vscode.Memento
  ) {
    this.token = store.get("token");
    this.sha = store.get("sha");
  }
  /**
   *
   * @param value base64
   */
  private uploadFile(value: String): any {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/vnd.github+json");
    myHeaders.append("Authorization", `Bearer ${this.token}`);
    myHeaders.append("X-GitHub-Api-Version", "2022-11-28");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      message: "a new commit message",
      committer: {
        name: "Ho doan",
        email: "doanphj5@gmail.com",
      },
      content: value,
      sha: this.sha,
    });

    fetch(
      "https://api.github.com/repos/ho-doan/vs_bloc_extension/contents/bloc-flow/assets/images/$$$data.json",
      { method: "PUT", headers: myHeaders, body: raw, redirect: "follow" }
    )
      .then((response) => response.json())
      .then((result) => result)
      .catch((error) => error);
  }

  private async upload(value: any) {
    if (this.imageNew) {
      let _value = {
        image: this.imageNew,
        ...value,
      };
      this.dataGit.push(_value);
      let result = await this.uploadFile(encode(this.dataGit));
      console.log(result);
    }
  }

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
      switch (data.type) {
        case "setToken": {
          this.store.update("token", data.value);
          this.token = data.value;
        }
        case "setToken": {
          this.store.update("sha", data.value);
          this.sha = data.value;
        }
        case "setImage": {
          this.imageNew = data.value;
        }
        case "add-widget": {
          this.upload(data.value);
        }
        case "fetchData": {
          console.log(data.value);
          fetch(data.value)
            .then((value) => value.json())
            .then((value) => {
              for (let i = 0; i < value.length; i++) {
                this.dataGit.push(value[i]);
                this.addColor2(value[i]);
              }
            });
          break;
        }
        case "updateFile": {
        }
        case "colorSelected": {
          console.log(data);
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(`#${data.value}`)
          );
          break;
        }
      }
    });
  }

  public addColor() {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage({ type: "addColor" });
    }
  }
  public addColor2(data: { name: string; icon: string; content: string }) {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage({ type: "addColor", ...data });
    }
  }

  public clearColors() {
    if (this._view) {
      this._view.webview.postMessage({ type: "clearColors" });
    }
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
				<meta http-equiv="Content-Security-Policy" crossorigin="anonymous" content="*; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Cat Colors</title>
			</head>
			<body>
        <div>
          <input class="input-file" value="https://raw.githubusercontent.com/ho-doan/vs_bloc_extension/master/bloc-flow/assets/data.json"/>
          <button class="get-file">Get</button>
        </div>
				<ul class="color-list" width="100%">
				</ul>
        <input class="token" value="${this.token}"/>
        <button class="update-token-button">Update token</button>
        <input class="sha" value="${this.sha}"/>
        <input class="input-name"/>
        <input class="input-icon"/>
        <img id="my_image" height="200">
        <textarea id="my-code" name="my-code"
          rows="5" cols="33">
        My code...
        </textarea>
				<button class="add-color-button">Add Widget</button>
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
