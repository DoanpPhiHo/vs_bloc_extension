import { existsSync, lstatSync, writeFile } from "fs";
import * as vscode from "vscode";
import * as _ from "lodash";
import * as changeCase from "change-case";
import {
  createDirectory,
  createFile,
  promptForName,
  promptForTargetDirectory,
} from "../utils/utils";

export const newPage = async (uri: vscode.Uri) => {
  console.log(uri.path);

  const pageName = await promptForName(uri.path.split("/").slice(-1)[0]);
  if (_.isNil(pageName) || pageName.trim() === "") {
    vscode.window.showErrorMessage("the page name must not be empty");
    return;
  }

  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      vscode.window.showErrorMessage("Please select a valid directory");
      return;
    }
  } else {
    targetDirectory = uri.fsPath;
  }

  const pascalCasePageName = changeCase.pascalCase(pageName);
  try {
    await generateFeature(pageName, targetDirectory);
    vscode.window.showInformationMessage(
      `Successfully generated ${pascalCasePageName} page`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

async function generateFeature(featureName: string, targetDirectory: string) {
  const shouldCreateDirectory = vscode.workspace
    .getConfiguration("bloc-flow")
    .get<boolean>("newPageTemplate.createDirectory");
  const blocDirectoryPath = shouldCreateDirectory
    ? `${targetDirectory}/${featureName}`
    : targetDirectory;

  if (existsSync(blocDirectoryPath)) {
    return;
  }

  createDirectory(blocDirectoryPath);
  createDirectory(`${blocDirectoryPath}/data`);
  createDirectory(`${blocDirectoryPath}/data/local_data_sources`);
  createDirectory(`${blocDirectoryPath}/data/remote_data_sources`);
  createDirectory(`${blocDirectoryPath}/data/models`);

  let className = changeCase.pascalCase(featureName);
  let fileName = changeCase.snakeCase(featureName);

  await Promise.all([
    createFile(
      `${fileName}_model.dart`,
      `${blocDirectoryPath}/data/models`,
      `part of 'models.dart';
      class ${className}Model{}`
    ),
    createFile(
      `models.dart`,
      `${blocDirectoryPath}/data/models`,
      `part '${fileName}_model.dart';`
    ),
    createFile(
      `${fileName}_local_data_source.dart`,
      `${blocDirectoryPath}/data/local_data_sources`,
      `import 'package:dartz/dartz.dart';
  import '../models/models.dart';
  
  class ${className}LocalDataSource extends BaseLocalDatabase<${className}Model>
  with LocalDatabase {
    ${className}LocalDataSource();
  
    Future<dynamic> get(String id) async {
      // if (instance == null) throw Exception('db null');
      // return instance!.profileModels.filter().idEqualTo(id).findFirst();
      return null;
    }
  }
  `
    ),
    createFile(
      `${fileName}_remote_data_source.dart`,
      `${blocDirectoryPath}/data/remote_data_sources`,
      `import 'package:dartz/dartz.dart';
import '../models/models.dart';

class ${className}RemoteDataSource {
  ${className}RemoteDataSource(/*this._apiClient*/);
  // final ApiClient _apiClient;

  Future<Either<String, ${className}Model>> get(String id) async {
    try {
      // final result = await _apiClient.get(id);
      // if (result.response.statusCode == 200) {
      //   final resultLocal = await _localDataSource.get(id);
      //   final data = resultRemote.data;
      //   return Right(data);
      // }
      // return Left('\${result.response.statusCode}:\${result.response.statusMessage}');
      return Right(${className}Model());
    } catch (e) {
      return Left(e.toString());
    }
  }
}
  `
    ),
  ]);

  createDirectory(`${blocDirectoryPath}/domain`);
  createDirectory(`${blocDirectoryPath}/domain/repositories`);
  createDirectory(`${blocDirectoryPath}/domain/use_case`);

  await Promise.all([
    createFile(
      `${fileName}_repository.dart`,
      `${blocDirectoryPath}/domain/repositories`,
      `import 'package:dartz/dartz.dart';
  import 'package:injectable/injectable.dart';
  import '../../data/local_data_sources/${fileName}_local_data_source.dart';
  import '../../data/remote_data_sources/${fileName}_remote_data_source.dart';
  import '../../data/models/models.dart';
  
  @injectable
  abstract class ${className}Repository {
    @factoryMethod
    static ${className}RepositoryImlp create(
      ${className}RemoteDataSource remoteDataSource,
      ${className}LocalDataSource localDataSource,
    ) =>
        ${className}RepositoryImlp(remoteDataSource, localDataSource);
  
        Future<Either<String, ${className}Model>> get(String id);
  }
  
  class ${className}RepositoryImlp extends ${className}Repository {
    ${className}RepositoryImlp(
      this._remoteDataSource,
      this._localDataSource,
    );
  
    final ${className}LocalDataSource _localDataSource;
    final ${className}RemoteDataSource _remoteDataSource;
  
    Future<Either<String, ${className}Model>>
        get(String id) async {
      try {
        // final resultRemote = await _remoteDataSource.get(id);
        // final resultLocal = await _localDataSource.get(id);
        // final data = resultRemote.data;
        return Right(${className}Model());
      } catch (e) {
        return Left(e.toString());
      }
    }
  }
  `
    ),
    createFile(
      `${fileName}_use_case.dart`,
      `${blocDirectoryPath}/domain/use_case`,
      `import 'package:dartz/dartz.dart';
  import 'dart:async';
  import '../repositories/${fileName}_repository.dart';
  class ${className}UseCase {
    ${className}UseCase(this._repository);
  
    final ${className}Repository _repository;
    Future<Either<String, dynamic>> get(String id) =>
    _repository.get(id);
  }
  `
    ),
  ]);

  createDirectory(`${blocDirectoryPath}/presentation`);
  createDirectory(`${blocDirectoryPath}/widgets`);

  await Promise.all([
    createFile(
      `widgets.dart`,
      `${blocDirectoryPath}/widgets`,
      "// TODO: widgets"
    ),
  ]);
}
