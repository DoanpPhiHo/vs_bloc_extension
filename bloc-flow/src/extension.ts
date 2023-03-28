import * as vscode from "vscode";
import { newPage } from "./commans/new-page.commands";
import * as path from "path";
import * as fs from "fs";
import { Uri } from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bloc-flow" is now active!');
  let disposable = vscode.commands.registerCommand(
    "bloc-flow.new_page",
    newPage
  );

  const rootPath =
    vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

  vscode.window.registerTreeDataProvider(
    "bloc-flow",
    new DepNodeProvider(rootPath)
  );
  context.subscriptions.push(disposable);

  const provider = new ColorsViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));

  context.subscriptions.push(
    vscode.commands.registerCommand('bloc-flow.addColor', () => {
      provider.addColor();
    }));

  context.subscriptions.push(
    vscode.commands.registerCommand('bloc-flow.clearColors', () => {
      provider.clearColors();
    }));
}

export function deactivate() { }

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined | void
  > = new vscode.EventEmitter<Dependency | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No dependency in empty workspace");
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(
        this.getDepsInPackageJson(
          path.join(
            this.workspaceRoot,
            "node_modules",
            element.label,
            "package.json"
          )
        )
      );
    } else {
      const packageJsonPath = path.join(this.workspaceRoot, "package.json");
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
      } else {
        vscode.window.showInformationMessage("Workspace has no package.json");
        return Promise.resolve([]);
      }
    }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    const workspaceRoot = this.workspaceRoot;
    if (this.pathExists(packageJsonPath) && workspaceRoot) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      const toDep = (moduleName: string, version: string): Dependency => {
        if (
          this.pathExists(path.join(workspaceRoot, "node_modules", moduleName))
        ) {
          return new Dependency(
            moduleName,
            version
            // vscode.TreeItemCollapsibleState.Collapsed
          );
        } else {
          return new Dependency(
            `hihi ${moduleName}`,
            version
            // vscode.TreeItemCollapsibleState.None,
            // {
            //   command: "extension.openPackageOnNpm",
            //   title: "",
            //   arguments: [moduleName],
            // }
          );
        }
      };

      const deps = packageJson.dependencies
        ? Object.keys(packageJson.dependencies).map((dep) =>
          toDep(dep, packageJson.dependencies[dep])
        )
        : [];
      const devDeps = packageJson.devDependencies
        ? Object.keys(packageJson.devDependencies).map((dep) =>
          toDep(dep, packageJson.devDependencies[dep])
        )
        : [];
      return deps.concat(devDeps);
    } else {
      return [];
    }
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly version: string // public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) // public readonly command?: vscode.Command
  {
    super(label /*, collapsibleState*/);

    this.tooltip = `${this.label}-${this.version}`;
    this.description =
      "descriptiondescriptiondescriptiondescriptiondescriptiondescription";

    this.resourceUri = Uri.parse(
      "https://cdn-icons-png.flaticon.com/512/4436/4436481.png"
    );
  }

  iconPath = {
    light: Uri.parse("https://cdn-icons-png.flaticon.com/512/4436/4436481.png"),
    dark: Uri.parse("https://cdn-icons-png.flaticon.com/512/4436/4436481.png"),
  };

  contextValue = "edit";
}

class ColorsViewProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'bloc-flow.colorsView';

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
  ) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case 'colorSelected':
          {
            vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
            break;
          }
      }
    });
  }

  public addColor() {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage({ type: 'addColor' });
    }
  }

  public clearColors() {
    if (this._view) {
      this._view.webview.postMessage({ type: 'clearColors' });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

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
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<button class="add-color-button">Add Color</button>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}