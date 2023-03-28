import { existsSync, lstatSync, writeFile } from "fs";
import {
  InputBoxOptions,
  Uri,
  window,
  OpenDialogOptions,
  workspace,
} from "vscode";
import * as _ from "lodash";
import * as changeCase from "change-case";
import * as mkdirp from "mkdirp";

export const newPage = async (uri: Uri) => {
  const pageName = await promptForPageName();
  if (_.isNil(pageName) || pageName.trim() === "") {
    window.showErrorMessage("the page name must not be empty");
    return;
  }

  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      window.showErrorMessage("Please select a valid directory");
      return;
    }
  } else {
    targetDirectory = uri.fsPath;
  }

  const pascalCasePageName = changeCase.pascalCase(pageName);
  try {
    await generatePageCode(pageName, targetDirectory);
    window.showInformationMessage(
      `Successfully generated ${pascalCasePageName} page`
    );
  } catch (error) {
    window.showErrorMessage(
      `Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

async function generatePageCode(pageName: string, targetDirectory: string) {
  const shouldCreateDirectory = workspace
    .getConfiguration("bloc-flow")
    .get<boolean>("newPageTemplate.createDirectory");
  const blocDirectoryPath = shouldCreateDirectory
    ? `${targetDirectory}/${pageName}`
    : targetDirectory;

  if (existsSync(blocDirectoryPath)) {
    return;
  }

  createDirectory(blocDirectoryPath);
  createDirectory(`${blocDirectoryPath}/data`);
  createDirectory(`${blocDirectoryPath}/data/local_data_sources`);
  createDirectory(`${blocDirectoryPath}/data/remote_data_sources`);
  createDirectory(`${blocDirectoryPath}/data/models`);

  await Promise.all([
    createFile(
      `models.dart`,
      `${blocDirectoryPath}/data/models`,
      `//TODO: models`
    ),
    createFile(
      `${changeCase.snakeCase(pageName)}_local_data_source.dart`,
      `${blocDirectoryPath}/data/local_data_sources`,
      `import 'package:dartz/dartz.dart';
  import '../../data/models/models.dart';
  
  class ${changeCase.pascalCase(pageName)}LocalDataSource {
    ${changeCase.pascalCase(pageName)}LocalDataSource();
  
    Future<dynamic> get(String id) async {
      // if (instance == null) throw Exception('db null');
      // return instance!.profileModels.filter().idEqualTo(id).findFirst();
      return null;
    }
  }
  `
    ),
    createFile(
      `${changeCase.snakeCase(pageName)}_remote_data_source.dart`,
      `${blocDirectoryPath}/data/remote_data_sources`,
      `import 'package:dartz/dartz.dart';
import '../../data/models/models.dart';

class ${changeCase.pascalCase(pageName)}RemoteDataSource {
  ${changeCase.pascalCase(pageName)}RemoteDataSource(/*this._apiClient*/);
  // final ApiClient _apiClient;

  Future<Either<String, dynamic>> get(String id) async {
    try {
      // final result = await _apiClient.get(id);
      // if (result.response.statusCode == 200) {
      //   final resultLocal = await _localDataSource.get(id);
      //   final data = resultRemote.data;
      //   return Right(data);
      // }
      // return Left('\${result.response.statusCode}:\${result.response.statusMessage}');
      return Right(null);
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
  createDirectory(`${blocDirectoryPath}/domain/usecases`);

  await Promise.all([
    createFile(
      `${changeCase.snakeCase(pageName)}_repository.dart`,
      `${blocDirectoryPath}/domain/repositories`,
      `import 'package:dartz/dartz.dart';
  import 'package:injectable/injectable.dart';
  import '../../data/local_data_sources/${changeCase.snakeCase(
    pageName
  )}_local_data_source.dart';
  import '../../data/remote_data_sources/${changeCase.snakeCase(
    pageName
  )}_remote_data_source.dart';
  import '../../data/models/models.dart';
  
  @injectable
  abstract class ${changeCase.pascalCase(pageName)}Repository {
    @factoryMethod
    static ${changeCase.pascalCase(pageName)}RepositoryImlp create(
      ${changeCase.pascalCase(pageName)}RemoteDataSource remoteDataSource,
      ${changeCase.pascalCase(pageName)}LocalDataSource localDataSource,
    ) =>
        ${changeCase.pascalCase(
          pageName
        )}RepositoryImlp(remoteDataSource, localDataSource);
  
        Future<Either<String, dynamic>> get(String id);
  }
  
  class ${changeCase.pascalCase(
    pageName
  )}RepositoryImlp extends ${changeCase.pascalCase(pageName)}Repository {
    ${changeCase.pascalCase(pageName)}RepositoryImlp(
      this._remoteDataSource,
      this._localDataSource,
    );
  
    final ${changeCase.pascalCase(pageName)}LocalDataSource _localDataSource;
    final ${changeCase.pascalCase(pageName)}RemoteDataSource _remoteDataSource;
  
    Future<Either<String, dynamic>>
        get(String id) async {
      try {
        final resultRemote = await _remoteDataSource.get(id);
        final resultLocal = await _localDataSource.get(id);
        final data = resultRemote.data;
        return Right(data);
      } catch (e) {
        return Left(e.toString());
      }
    }
  }
  `
    ),
    createFile(
      `${changeCase.snakeCase(pageName)}_usecase.dart`,
      `${blocDirectoryPath}/domain/usecases`,
      `import 'package:dartz/dartz.dart';
  import 'dart:async';
  import '../repositories/${pageName}_repository.dart';
  class ${changeCase.pascalCase(pageName)}UseCase {
    ${changeCase.pascalCase(pageName)}UseCase(this._repository);
  
    final ${changeCase.pascalCase(pageName)}Repository _repository;
    Future<Either<String, dynamic>> get(String id) =>
    _repository.get(id);
  }
  `
    ),
  ]);

  createDirectory(`${blocDirectoryPath}/presentaion`);
  createDirectory(`${blocDirectoryPath}/presentaion/bloc`);

  await Promise.all([
    createBlocEventTemplate(pageName, `${blocDirectoryPath}/presentaion/bloc`),
    createBlocStateTemplate(pageName, `${blocDirectoryPath}/presentaion/bloc`),
    createBlocTemplate(pageName, `${blocDirectoryPath}/presentaion/bloc`),
  ]);

  createDirectory(`${blocDirectoryPath}/presentaion/widgets`);

  await Promise.all([
    createFile(
      `widgets.dart`,
      `${blocDirectoryPath}/presentaion/widgets`,
      "// TODO: widgets"
    ),
    createFile(
      `${changeCase.snakeCase(pageName)}_screen.dart`,
      `${blocDirectoryPath}/presentaion`,
      `//TODO: import
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fluro/fluro.dart';
import 'package:flutter/material.dart';
import 'bloc/${changeCase.snakeCase(pageName)}_bloc.dart';
const String t${changeCase.pascalCase(
        pageName
      )}ScreenPath = '/profile_request_view';
Handler ${changeCase.pascalCase(pageName)}ScreenHandler = Handler(
  handlerFunc: (BuildContext? context, Map<String, List<String>> params) =>
      const ${changeCase.pascalCase(pageName)}Screen(),
);

class ${changeCase.pascalCase(pageName)}Screen extends StatefulWidget {
  const ${changeCase.pascalCase(pageName)}Screen({super.key});

  @override
  State<${changeCase.pascalCase(pageName)}Screen> createState() =>
      _${changeCase.pascalCase(pageName)}ScreenState();
}

class _${changeCase.pascalCase(pageName)}ScreenState extends State<${changeCase.pascalCase(pageName)}Screen> {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ${changeCase.pascalCase(pageName)}Bloc(getIt<${changeCase.pascalCase(pageName)}UseCase>()),
      child: BlocListener<${changeCase.pascalCase(pageName)}Bloc, ${changeCase.pascalCase(pageName)}State>(
        listenWhen: (p, c) => p.status != c.status,
        listener: (context, state) {
          if (state.status.isLoading) {
            LoadingDialog.instance.show();
          } else if (state.status.isSuccess) {
            LoadingDialog.instance.hide();
          } else if (state.status.isFailure) {
            LoadingDialog.instance.hide();
            ToastWidget.instance.showToast(
              state.error ?? 'unknownFailure'.hardcode,
              backgroundColor: AppColors.red,
              messageColor: AppColors.white,
            );
          }
        },
        child: BlocBuilder<${changeCase.pascalCase(pageName)}Bloc, ${changeCase.pascalCase(pageName)}State>(
          buildWhen: (p, c) => false,
          builder: (context, state) {
            return Scaffold(
              backgroundColor: AppColors.white,
              appBar: AppBar(
                title: Text(
                  '${changeCase.pascalCase(pageName)}',
                  textScaleFactor: context.defaultScale,
                  style: AppTextStyle.normalStyle.cp(
                    color: AppColors.neutralGreen911Color,
                    height: 0,
                    fontSize: 16.sf,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                leadingWidth: 40,
                centerTitle: false,
                titleSpacing: 5,
                leading: GestureDetector(
                  onTap: () => Routes.router.pop<void>(context),
                  child: const Icon(
                    Icons.arrow_back,
                    size: 24,
                    color: AppColors.black,
                  ),
                ),
                backgroundColor: AppColors.white,
                elevation: 0,
              ),
              body: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      BlocBuilder<${changeCase.pascalCase(pageName)}Bloc,
                          ${changeCase.pascalCase(pageName)}State>(
                            //TODO: buildWhen
                        buildWhen: (p, c) => true,
                        builder: (context, state) {
                          return Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'hihi'.hardcode,
                                textScaleFactor: context.defaultScale,
                                style: AppTextStyle.normalStyle.cp(
                                  fontSize: 14.sf,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.neutralGreen911Color,
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
`
    ),
  ]);
}

function createBlocTemplate(blocName: string, targetDirectory: string) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/${snakeCaseBlocName}_bloc.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_bloc.dart already exists`);
  }
  return new Promise<void>(async (resolve, reject) => {
    writeFile(targetPath, getDefaultBlocTemplate(blocName), "utf8", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function getDefaultBlocTemplate(blocName: string) {
  const pascalCaseBlocName = changeCase.pascalCase(blocName);
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const blocState = `${pascalCaseBlocName}State`;
  const blocEvent = `${pascalCaseBlocName}Event`;
  return `import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:meta/meta.dart';
import 'package:copy_with_extension/copy_with_extension.dart';

part '${snakeCaseBlocName}_event.dart';
part '${snakeCaseBlocName}_state.dart';

class ${pascalCaseBlocName}Bloc extends Bloc<${blocEvent}, ${blocState}> {
  ${pascalCaseBlocName}Bloc() : super(${pascalCaseBlocName}State.init()) {
    on<${blocEvent}>((event, emit) {
      // TODO: implement event handler
    });
  }
}
  `;
}

function createBlocStateTemplate(blocName: string, targetDirectory: string) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/${snakeCaseBlocName}_state.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_state.dart already exists`);
  }
  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getDefaultBlocStateTemplate(blocName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}

function getDefaultBlocStateTemplate(blocName: string): string {
  const pascalCaseBlocName = changeCase.pascalCase(blocName);
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  return `part of '${snakeCaseBlocName}_bloc.dart';
  
@immutable
@CopyWith()
class ${pascalCaseBlocName}State {
  const ${pascalCaseBlocName}State({
    required this.status,
    this.error,
  });
  
  factory ${pascalCaseBlocName}State.init() =>
        const ${pascalCaseBlocName}State(status: Status.initial);
  
  final Status status;
  final String? error;
}
  `;
}

function createBlocEventTemplate(blocName: string, targetDirectory: string) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/${snakeCaseBlocName}_event.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_event.dart already exists`);
  }
  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getDefaultBlocEventTemplate(blocName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}

function getDefaultBlocEventTemplate(blocName: string): string {
  const pascalCaseBlocName = changeCase.pascalCase(blocName);
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  return `part of '${snakeCaseBlocName}_bloc.dart';
  
@immutable
abstract class ${pascalCaseBlocName}Event {}
  `;
}

function createDirectory(targetDirectory: string) {
  mkdirp.mkdirpSync(targetDirectory);
}
function createFile(
  blocName: string,
  targetDirectory: string,
  content: string
) {
  return new Promise<void>(async (resolve, reject) => {
    writeFile(`${targetDirectory}/${blocName}`, content, "utf8", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function promptForPageName(): Thenable<string | undefined> {
  const pageName: InputBoxOptions = {
    prompt: "Page Name",
    placeHolder: "counter",
  };
  return window.showInputBox(pageName);
}

async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create the page in",
    canSelectFolders: true,
  };

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined;
    }
    return uri[0].fsPath;
  });
}
