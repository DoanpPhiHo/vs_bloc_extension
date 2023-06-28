import * as changeCase from "change-case";
import {
  createDirectory,
  createFile,
  promptForName,
  promptForTargetDirectory,
} from "../utils/utils";
import { Uri, window } from "vscode";
import * as _ from "lodash";
import { lstatSync } from "fs";

export const newColor = async (uri: Uri) => {
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
  await genSubColor(changeCase.snakeCase(fileName), fsPath);
};

export const genSubColor = async (fileName: string, fsPath: string) => {
  let dir = `${fsPath}/color`;
  createDirectory(dir);
  createFile(`colors.xml`, dir, colorStr());
};

export const colorStr = () => {

  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="white">#FFFFFF</color>
  <color name="black">#000000</color>
  <color name="primary300">#52b6bb</color>
  <color name="red" type="material">#CF2A2A</color>
  <color name="neutralGreenColor">#263238</color>
  <color name="primaryColor">#134D4A</color>
</resources>`;
};