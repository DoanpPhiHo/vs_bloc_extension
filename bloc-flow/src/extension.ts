import * as vscode from "vscode";
import { newPage } from "./commands/new-page.commands";
import { newPresentation } from "./commands/new-presentation.commands";
import { newBloc } from "./commands/new-bloc.commands";
import { newModel } from "./commands/new-model.commands";
import { newCore } from "./commands/new-core.commands";
import { newColor } from "./commands/new-color.commands";
import { wrapFunction } from "./commands/wrap-function.commands";
import * as fs from "fs";
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
  ///TODO: hodoan extras function
  vscode.workspace.onDidSaveTextDocument((e) => {
    let workspaceCurrent = e.fileName.split("/.flow")[0];
    let flowPath = `${workspaceCurrent}/.flow/flow.json`;
    let flowFile = fs.readFileSync(flowPath, "utf-8");
    let configs = JSON.parse(flowFile);
    let fileCurrent = e.getText();

    let fileCurrentJson = JSON.parse(fileCurrent);

    try {
      if (e.fileName.includes(".model.json")) {
        let classP: Array<string> = [];
        let lstClass = defineListClass(fileCurrentJson, "Home");
        for (let index = 0; index < lstClass.length; index++) {
          const element = lstClass[index];
          console.log("forrrrr => ", element.name);

          let str = createClass(element.value, element.name);
          if (str !== undefined) {
            classP.push(str);
          }
        }
        let modelPath =
          configs["path_model"] === undefined ? "" : configs["path_model"];
        try {
          createFile(
            "home_model.dart",
            `${workspaceCurrent}/${modelPath}`,
            `
              import 'package:json_annotation/json_annotation.dart';
    
              part 'home_model.g.dart';
  
              ${classP.join("\n\n")}
          `
          );
          vscode.window.activeTerminal?.sendText(
            `dart format ${workspaceCurrent}/${modelPath}/home_model.dart`
          );
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
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

function createFile(
  fileName: string,
  targetDirectory: string,
  content: string
) {
  return new Promise<void>(async () => {
    vscode.window.showInformationMessage(
      `create file ${targetDirectory}/${fileName}`
    );
    fs.writeFileSync(`${targetDirectory}/${fileName}`, content, "utf8");
  });
}

function createClass(str: any, name: string): string | undefined {
  console.log(str, name, typeof str);

  let check = typeof str === "object";
  let checkNull = str === null || str === undefined;
  let checkNumber = typeof name === "number";
  if (!check || checkNull || checkNumber) {
    return undefined;
  }
  let keys: Array<string> = Object.keys(str);

  let p: Array<string> = [];
  let ps: Array<string> = [];
  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];
    if (element === "" || element === undefined) {
      continue;
    }
    const k: Array<string> = element.split("@");
    if (k.length > 1) {
      p.push(`@JsonKey(name: '${k[0]}')
      final ${k[1]}? ${k[0]}`);
      ps.push(`this.${k[0]}`);
    } else if (typeof str[element] === "string") {
      p.push(`@JsonKey(name: '${element}')
      final ${defineType(k, str[element])} ${element}`);
      ps.push(`this.${element}`);
    } else if (Array.isArray(str[element])) {
      let name = str[element].length === 0 ? "dynamic" : element.toUpperCase();
      p.push(`@JsonKey(name: '${element}')
      final ${defineType(k, str[element])} ${element}`);
      ps.push(`this.${element}`);
    } else if (typeof str[element] === "object") {
      p.push(`@JsonKey(name: '${element}')
        final ${defineType(k, str[element])} ${element}`);
      ps.push(`this.${element}`);
    } else if (typeof str[element] === "boolean") {
      p.push(`@JsonKey(name: '${element}')
      final ${defineType(k, str[element])} ${element}`);
      ps.push(`this.${element}`);
    } else if (typeof str[element] === "number") {
      if (`${str[element]}`.includes(".")) {
        p.push(`@JsonKey(name: '${element}')
        final ${defineType(k, str[element])} ${element}`);
        ps.push(`this.${element}`);
      } else {
        p.push(`@JsonKey(name: '${element}')
        final ${defineType(k, str[element])} ${element}`);
        ps.push(`this.${element}`);
      }
    } else {
      p.push(`@JsonKey(name: '${element}')
      final ${defineType(k, str[element])} ${element}`);
      ps.push(`this.${element}`);
    }
  }
  let nameS =
    name.split("@").length > 1 ? name.split("@")[1] : name.toUpperCase();
  return classStr(p, ps, nameS);
}

function defineType(k: Array<string>, str: any): string {
  if (k.length > 1) {
    return `${k[1]}?`;
  } else if (typeof str === "string") {
    return `String?`;
  } else if (Array.isArray(str)) {
    let name = str.length === 0 ? "dynamic?" : defineType(k, str[0]);
    return `List<${name.replace("?", "")}>?`;
  } else if (typeof str === "object") {
    return `${k[0].toUpperCase()}?`;
  } else if (typeof str === "boolean") {
    return `bool?`;
  } else if (typeof str === "number") {
    if (`${str}`.includes(".")) {
      return `double?`;
    } else {
      return `int?`;
    }
  }
  return `dynamic?`;
}

function classStr(p: Array<string>, ps: Array<string>, name: string): string {
  let _name = name.trim();
  if (_name === "" || _name === undefined || _name === null) {
    return "";
  }
  return `
  @JsonSerializable(explicitToJson: true)
  class ${name} {
    ${ps.length > 0 ? "" : "const"} ${name}(${
    ps.length > 0 ? `{${ps.join(",\n")},}` : ""
  });
    factory ${name}.fromJson(Map<String, dynamic> json) =>
        _$${name}FromJson(json) ${ps.length > 0 ? ";" : ""}
    ${p.join(";\n")};
  }
  `;
}

function defineListClass(value: any, name: string): Array<ModelGen> {
  var list: Array<ModelGen> = [];
  if (Array.isArray(value)) {
    if (value.length > 0) {
      let lst = defineListClass(value[0], name);
      list.push(...lst);
      return list;
    }
  } else if (typeof value === "object") {
    let m = new ModelGen();
    m.name = name;
    m.value = value;
    list.push(m);
  }
  let keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (Array.isArray(value[key]) || typeof value[key] === "object") {
      let lst = defineListClass(value[key], key);
      list.push(...lst);
    }
  }
  return list;
}
class ModelGen {
  name: string = "";
  value: any;
}
