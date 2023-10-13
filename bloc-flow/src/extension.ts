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
    vscode.commands.registerCommand("bloc-flow.new_feature_bloc_mvc", newPageMVC),
    vscode.commands.registerCommand(
      "bloc-flow.new_presentation",
      newPresentation
    ),
    vscode.commands.registerCommand("bloc-flow.new_bloc", newBloc),
    vscode.commands.registerCommand("bloc-flow.new_model", newModel),
    vscode.commands.registerCommand("bloc-flow.new_core", newCore),
    vscode.commands.registerCommand("bloc-flow.new_color", newColor),
    vscode.commands.registerCommand("bloc-flow.wrap-function", wrapFunction),

    vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider),
    
    // vscode.languages.registerCodeActionsProvider(
    //   DART_MODE,
    //   new BlocFlowProvider()
    // )
  );

  // ///TODO: hodoan extras function
  // vscode.workspace.onDidSaveTextDocument((e) => {
  //   let workspaceCurrent = e.fileName.split("/.flow")[0];
  //   let flowPath = `${workspaceCurrent}/.flow/flow.json`;
  //   let flowFile = fs.readFileSync(flowPath, "utf-8");
  //   let configs = JSON.parse(flowFile);
  //   let fileCurrent = e.getText();

  //   let fileCurrentJson = JSON.parse(fileCurrent);

  //   try {
  //     if (e.fileName.includes(".model.json")) {
  //       let classP: Array<string> = [];
  //       let lstClass = defineListClass(fileCurrentJson, "Home");
  //       for (let index = 0; index < lstClass.length; index++) {
  //         const element = lstClass[index];
  //         let str = createClass(element.value, element.name);
  //         if (str !== undefined) {
  //           classP.push(str);
  //         }
  //       }
  //       let modelPath =
  //         configs["path_model"] === undefined ? "" : configs["path_model"];
  //       try {
  //         createFile(
  //           "home_model.dart",
  //           `${workspaceCurrent}/${modelPath}`,
  //           `
  //             import 'package:json_annotation/json_annotation.dart';
    
  //             part 'home_model.g.dart';
  
  //             ${classP.join("\n\n")}
  //         `
  //         );
  //         vscode.window.activeTerminal?.sendText(
  //           `dart format ${workspaceCurrent}/${modelPath}/home_model.dart`
  //         );
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });
}

export function deactivate() {}

// class BlocFlowProvider implements vscode.CodeActionProvider {
//   provideCodeActions(
//     document: vscode.TextDocument,
//     range: vscode.Selection | vscode.Range,
//     context: vscode.CodeActionContext,
//     token: vscode.CancellationToken
//   ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
//     return [
//       {
//         command: "bloc-flow.wrap-function",
//         title: "Wrap function",
//       },
//     ];
//   }
// }

// function createFile(
//   fileName: string,
//   targetDirectory: string,
//   content: string
// ) {
//   return new Promise<void>(async () => {
//     vscode.window.showInformationMessage(
//       `create file ${targetDirectory}/${fileName}`
//     );
//     fs.writeFileSync(`${targetDirectory}/${fileName}`, content, "utf8");
//   });
// }

// function createClass(str: any, name: string): string | undefined {
//   console.log(str, name, typeof str);

//   let check = typeof str === "object";
//   let checkNull = str === null || str === undefined;
//   let checkNumber = typeof name === "number";
//   if (!check || checkNull || checkNumber) {
//     return undefined;
//   }
//   let keys: Array<string> = Object.keys(str);

//   let p: Array<string> = [];
//   let ps: Array<string> = [];
//   for (let index = 0; index < keys.length; index++) {
//     const element = keys[index];
//     if (element === "" || element === undefined) {
//       continue;
//     }
//     const k: Array<string> = element.split("@");
//     if (k.length > 1) {
//       p.push(`@JsonKey(name: '${k[0]}')
//       final ${k[1]}? ${k[0]}`);
//       ps.push(`this.${k[0]}`);
//     } else if (typeof str[element] === "string") {
//       p.push(`@JsonKey(name: '${element}')
//       final ${defineType(k, str[element])} ${element}`);
//       ps.push(`this.${element}`);
//     } else if (Array.isArray(str[element])) {
//       let name = str[element].length === 0 ? "dynamic" : element.toUpperCase();
//       p.push(`@JsonKey(name: '${element}')
//       final ${defineType(k, str[element])} ${element}`);
//       ps.push(`this.${element}`);
//     } else if (typeof str[element] === "object") {
//       p.push(`@JsonKey(name: '${element}')
//         final ${defineType(k, str[element])} ${element}`);
//       ps.push(`this.${element}`);
//     } else if (typeof str[element] === "boolean") {
//       p.push(`@JsonKey(name: '${element}')
//       final ${defineType(k, str[element])} ${element}`);
//       ps.push(`this.${element}`);
//     } else if (typeof str[element] === "number") {
//       if (`${str[element]}`.includes(".")) {
//         p.push(`@JsonKey(name: '${element}')
//         final ${defineType(k, str[element])} ${element}`);
//         ps.push(`this.${element}`);
//       } else {
//         p.push(`@JsonKey(name: '${element}')
//         final ${defineType(k, str[element])} ${element}`);
//         ps.push(`this.${element}`);
//       }
//     } else {
//       p.push(`@JsonKey(name: '${element}')
//       final ${defineType(k, str[element])} ${element}`);
//       ps.push(`this.${element}`);
//     }
//   }
//   let nameS =
//     name.split("@").length > 1 ? name.split("@")[1] : name.toUpperCase();
//   return classStr(p, ps, nameS);
// }

// function defineType(k: Array<string>, str: any): string {
//   if (k.length > 1) {
//     return `${k[1]}?`;
//   } else if (typeof str === "string") {
//     return `String?`;
//   } else if (Array.isArray(str)) {
//     let name = str.length === 0 ? "dynamic?" : defineType(k, str[0]);
//     return `List<${name.replace("?", "")}>?`;
//   } else if (typeof str === "object") {
//     return `${k[0].toUpperCase()}?`;
//   } else if (typeof str === "boolean") {
//     return `bool?`;
//   } else if (typeof str === "number") {
//     if (`${str}`.includes(".")) {
//       return `double?`;
//     } else {
//       return `int?`;
//     }
//   }
//   return `dynamic?`;
// }

// function classStr(p: Array<string>, ps: Array<string>, name: string): string {
//   let _name = name.trim();
//   if (_name === "" || _name === undefined || _name === null) {
//     return "";
//   }
//   return `
//   @JsonSerializable(explicitToJson: true)
//   class ${name} {
//     ${ps.length > 0 ? "" : "const"} ${name}(${
//     ps.length > 0 ? `{${ps.join(",\n")},}` : ""
//   });
//     factory ${name}.fromJson(Map<String, dynamic> json) =>
//         _$${name}FromJson(json) ${ps.length > 0 ? ";" : ""}
//     ${p.join(";\n")};
//   }
//   `;
// }

// function defineListClass(value: any, name: string): Array<ModelGen> {
//   var list: Array<ModelGen> = [];
//   if (Array.isArray(value)) {
//     if (value.length > 0) {
//       let lst = defineListClass(value[0], name);
//       list.push(...lst);
//       return list;
//     }
//   } else if (typeof value === "object") {
//     let m = new ModelGen();
//     m.name = name;
//     m.value = value;
//     list.push(m);
//   }
//   let keys = Object.keys(value);
//   for (let i = 0; i < keys.length; i++) {
//     let key = keys[i];
//     if (Array.isArray(value[key]) || typeof value[key] === "object") {
//       let lst = defineListClass(value[key], key);
//       list.push(...lst);
//     }
//   }
//   return list;
// }
// class ModelGen {
//   name: string = "";
//   value: any;
// }


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
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; frame-src https://ho-doan.github.io; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>

        <iframe frameborder="0" sandbox="allow-scripts allow-same-origin" scrolling="yes" flex-grow=1 width="100%" height="100%" src="https://ho-doan.github.io"></iframe>
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