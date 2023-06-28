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

export const newBloc = async (uri: Uri) => {
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
  await genSubBloc(changeCase.snakeCase(fileName), fsPath);
};

export const genSubBloc = async (fileName: string, fsPath: string) => {
  let dir = `${fsPath}/bloc`;
  createDirectory(dir);
  createFile(`${fileName}_bloc.dart`, dir, blocStr(fileName));
  createFile(`${fileName}_state.dart`, dir, stateStr(fileName));
  createFile(`${fileName}_event.dart`, dir, eventStr(fileName));
};

export const blocStr = (name: string) => {
  // wel_come
  let fileName = changeCase.snakeCase(name);
  // WelCome
  let className = changeCase.pascalCase(name);

  return `import 'package:copy_with_extension/copy_with_extension.dart';
  import 'package:flutter_bloc/flutter_bloc.dart';
  import 'package:meta/meta.dart';
  
  part '${fileName}_event.dart';
  part '${fileName}_state.dart';
  part '${fileName}_bloc.g.dart';
  
  class ${className}Bloc extends Bloc<${className}Event, ${className}State> {
    ${className}Bloc(this._useCase) : super(${className}Initial()) {
      on<${className}LoadingEvent>(
        (event, emit) => emit(${className}Loading()),
      );
      on<${className}FailureEvent>(
        (event, emit) => emit(${className}Failure(event.error)),
      );
      on<${className}SuccessEvent>(
        (event, emit) => emit(event.state),
      );
      on<${className}InitEvent>((event, emit) async {
        try {
        //   final result = await _useCase.getXXX();
        //   final model = result.fold(
        //     (l) => throw Exception(l),
        //     (r) => r,
        //   );
          emit(${className}Success());
        } catch (e) {
          emit(${className}Failure(e.toString()));
        }
      });
    }
  
    final ${className}UseCase _useCase;
  }`;
};

export const eventStr = (name: string) => {
  // wel_come
  let fileName = changeCase.snakeCase(name);
  // WelCome
  let className = changeCase.pascalCase(name);

  return `part of '${fileName}_bloc.dart';

  @immutable
  abstract class ${className}Event {}
  
  class ${className}InitEvent extends ${className}Event {}
  
  class ${className}LoadingEvent extends ${className}Event {}
  
  class ${className}SuccessEvent extends ${className}Event {
    ${className}SuccessEvent(this.state);
  
    final ${className}Success state;
  }
  
  class ${className}FailureEvent extends ${className}Event {
    ${className}FailureEvent(this.error);
  
    final String error;
  }
  `;
};
export const stateStr = (name: string) => {
  // wel_come
  let fileName = changeCase.snakeCase(name);
  // WelCome
  let className = changeCase.pascalCase(name);

  return `part of '${fileName}_bloc.dart';

  @immutable
  abstract class ${className}State {}
  
  class ${className}Initial extends ${className}State {}
  
  class ${className}Loading extends ${className}State {}
  
  class ${className}Failure extends ${className}State {
    ${className}Failure(this.error);
  
    final String error;
  }
  
  @CopyWith()
  class ${className}Success extends ${className}State {
    ${className}Success();
  }
  `;
};
