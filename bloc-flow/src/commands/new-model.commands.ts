import * as changeCase from "change-case";
import {
  createFile,
  promptForName,
  promptForTargetDirectory,
} from "../utils/utils";
import { Uri, window } from "vscode";
import * as _ from "lodash";
import { lstatSync } from "fs";

export const newModel = async (uri: Uri) => {
  let file = uri.path.split("/").slice(-1)[0];
  let fileName = await promptForName(changeCase.snakeCase(file));
  if (_.isNil(fileName) || fileName.trim() === "") {
    window.showErrorMessage("the page name must not be empty");
    return;
  }
  let fsPath;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    fsPath = await promptForTargetDirectory();
    if (_.isNil(fsPath)) {
      window.showErrorMessage("Please select a valid directory");
      return;
    }
  } else {
    fsPath = uri.fsPath;
  }
  await genSubModel(changeCase.snakeCase(fileName), fsPath);
};

export const genSubModel = async (fileName: string, fsPath: string) => {
  createFile(`${fileName}_model.dart`, fsPath, modelStr(fileName));
};

export const modelStr = (name: string) => {
  // wel_come
  let fileName = changeCase.snakeCase(name);
  // WelCome
  let className = changeCase.pascalCase(name);

  return `// TODO: part '${fileName}_model.dart';
  part of 'models.dart';
  
  @JsonSerializable(explicitToJson: true)
  class ${className}Model {
    ${className}Model({
      required this.id,
    });
    factory ${className}Model.fromJson(Map<String, dynamic> json) =>
        _$${className}ModelFromJson(json);
    @JsonKey(name: 'id')
    final String id;
    Map<String, dynamic> toJson() => _$${className}ModelToJson(this);
  }
  `;
};
