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

export const newPageMVC = async (uri: vscode.Uri) => {
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
    await generateFeature(pageName, targetDirectory, uri);
    vscode.window.showInformationMessage(
      `Successfully generated ${pascalCasePageName} page`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

async function generateFeature(
  featureName: string,
  targetDirectory: string,
  uri: vscode.Uri
) {
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
  let param = changeCase.camelCase(featureName);

  await Promise.all([
    createFile(
      `${fileName}_model.dart`,
      `${blocDirectoryPath}/data/models`,
      `import 'package:json_annotation/json_annotation.dart';
      
      part '${fileName}_model.g.dart';
      
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
      }`
    ),
    createFile(
      `${fileName}_request.dart`,
      `${blocDirectoryPath}/data/models`,
      `import 'package:json_annotation/json_annotation.dart';
      
      part '${fileName}_request.g.dart';
      
      @JsonSerializable(explicitToJson: true)
      class ${className}Request {
        ${className}Request({
          required this.id,
        });
        factory ${className}Request.fromJson(Map<String, dynamic> json) =>
            _$${className}RequestFromJson(json);
        @JsonKey(name: 'id')
        final String id;
        Map<String, dynamic> toJson() => _$${className}RequestToJson(this);
      }`
    ),
    createFile(
      `${fileName}_local_data_source.dart`,
      `${blocDirectoryPath}/data/local_data_sources`,
      `import '../models/change_code_model.dart';
      abstract class ${className}LocalDataSource {
        Future<${className}Model?> get();
      }
      class ${className}LocalDataSourceImplement implements ${className}LocalDataSource {
        ${className}LocalDataSourceImplement(
          // this.xyz,
        );
      
        //final XYZ xyz;

        @override
        Future<${className}Model?> get() async {
          // return xyz.xyz(abc);
          return null;
        }   
      }   
  `
    ),
    createFile(
      `${fileName}_remote_data_source.dart`,
      `${blocDirectoryPath}/data/remote_data_sources`,
      `import 'package:injectable/injectable.dart';
      import '../models/${fileName}_request.dart';
      abstract class ${className}RemoteDataSource {
        Future<dynamic> get({required ${className}Request param});
      }
      
      @Injectable(as: ${className}RemoteDataSource)
      class ${className}RemoteDataSourceImpl implements ${className}RemoteDataSource {
        ${className}RemoteDataSourceImpl(this._appRestClient);
      
        final AppRestClient _appRestClient;
      
        @override
        Future<dynamic> get({required ${className}Request param}) =>
            _appRestClient.get(param);
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
  import '../../data/models/${className}_model.dart';
import '../../data/models/${className}_request.dart';
  @injectable
  abstract class ${className}Repository {
    @factoryMethod
    static ${className}RepositoryImlp create(
      ${className}RemoteDataSource remoteDataSource,
      ${className}LocalDataSource localDataSource,
    ) =>
        ${className}RepositoryImlp(remoteDataSource, localDataSource);
  
        Future<Either<String, ${className}Model>> get({required ${className}Request param});
  }
  
  class ${className}RepositoryImlp extends ${className}Repository {
    ${className}RepositoryImlp(
      this._remoteDataSource,
      this._localDataSource,
    );
  
    // ignore: unused_field
    final ${className}LocalDataSource _localDataSource;
    // ignore: unused_field
    final ${className}RemoteDataSource _remoteDataSource;
    @override
    Future<Either<String, ${className}Model>>
        get({required ${className}Request param}) async {
      try {
        // final resultRemote = await _remoteDataSource.get(id);
        // final resultLocal = await _localDataSource.get(id);
        // final data = resultRemote.data;
        return Right(${className}Model(id: ''));
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
      import '../repositories/${className}_repository.dart';
      import '../../data/models/${className}_request.dart';
      import 'package:injectable/injectable.dart';
      //TODO: import method BaseException handle${className}Message(any); file exception.dart
      @injectable
      class ${className}UseCase extends UseCase<dynamic, ${className}UseCaseParam> {
        ${className}UseCase(this._repository);
        final ${className}Repository _repository;
        @override
        Future<Either<BaseException, dynamic>> call(${className}UseCaseParam param) async {
          try {
            final result = await _repository.get(
                param: ${className}Request(
                    id: param.id,
                ));
            return Right(result);
          } catch (e, trace) {
            AppLog.error('${className}UseCase ERROR', e, trace);
            return Left(exceptionHandler.handle${className}Message(e));
          }
        }
      }
      
      class ${className}UseCaseParam {
        final String id;
      
        const ${className}UseCaseParam({required this.id});
      }
      
  `
    ),
  ]);

  createDirectory(`${blocDirectoryPath}/presentation`);
  var dir = `${blocDirectoryPath}/presentation/bloc`;
  createDirectory(dir);
  createFile(`${fileName}_cubit.dart`, dir, blocStr(fileName));
  createFile(`${fileName}_state.dart`, dir, stateStr(fileName));

  let _fullPath = `${uri.path}/${fileName}`.split("/");
  let i = _fullPath.lastIndexOf("lib");
  let fullPath = _fullPath.slice(i - 1).join("/");

  let str = presentationStr(fileName, fullPath.replace("/", " "));
  createFile(`${fileName}_page.dart`, `${blocDirectoryPath}/presentation`, str);
}

export const blocStr = (name: string) => {
  // wel_come
  let fileName = changeCase.snakeCase(name);
  // WelCome
  let className = changeCase.pascalCase(name);

  return `import 'package:flutter_bloc/flutter_bloc.dart';
  import 'package:meta/meta.dart';
  import '../../domain/use_case/${className}_use_case.dart';
  
  part '${fileName}_state.dart';
  
  class ${className}Cubit extends Cubit<${className}State> {
    ${className}Cubit(this._useCase) : super(${className}Initial()) {
      onInit();
    }

    void onLoading() => emit(${className}Loading());
      void onFailure(String l)=> emit(${className}Failure(l));
      void onSuccess() => emit(${className}Success());
      void onInit() async {
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
      }
  
    // ignore: unused_field
    final ${className}UseCase _useCase;
  }`;
};

export const stateStr = (name: string) => {
  // wel_come
  let fileName = changeCase.snakeCase(name);
  // WelCome
  let className = changeCase.pascalCase(name);

  return `part of '${fileName}_cubit.dart';

  @immutable
  abstract class ${className}State {}
  
  class ${className}Initial extends ${className}State {}
  
  class ${className}Loading extends ${className}State {}
  
  class ${className}Failure extends ${className}State {
    ${className}Failure(this.error);
  
    final String error;
  }
  
  class ${className}Success extends ${className}State {
    ${className}Success({
      this.counter = 0,
    });
    final int counter;
  }
  `;
};

export const presentationStr = (
  name: string,
  fullPath: string = "flutter none"
) => {
  // wel_come
  let fileName = changeCase.snakeCase(name);
  // WelCome
  let className = changeCase.pascalCase(name);
  // welCome
  let handleName = changeCase.camelCase(name);
  // welCome
  let templateStr = changeCase.dotCase(fullPath);

  return `import 'package:flutter/material.dart';
  import 'package:flutter_bloc/flutter_bloc.dart';
  import 'bloc/${fileName}_cubit.dart';
  import '../../../util/extensions.dart';

//TODO: generateRoute file route.dart
// case ScreenName.${handleName}:
//         return _materialPage(const ${className}Page(), settings);
//TODO: router path file strings.dart
// /// {@macro ${templateStr}}
// static const String ${handleName} = ${className}Page.name;

class ${className}Page extends StatefulWidget {
  const ${className}Page({super.key});

  /// {@template ${templateStr}}
  /// \`\`\`dart
  /// navigatorState.pushNamed(
  ///   ScreenName.${handleName},
  /// )
  /// \`\`\`
  /// {@endtemplate}
  static const String name = '${fileName}';

  @override
  State<${className}Page> createState() =>
      _${className}PageState();
}

class _${className}PageState extends BaseState<${className}Page> {
  final ${className}Cubit _cubit = di();
  @override
  Widget build(BuildContext context) {
    return BlocConsumer<${className}Cubit, ${className}State>(
      bloc: _cubit,
      listener: (context, state) {
        switch (state.runtimeType) {
          case ${className}Loading:
            widgetUtil.showGlobalLoadingOverlay();
            break;
          case ${className}Failure:
            state as ${className}Failure;
            widgetUtil.dismissGlobalLoadingOverlay();
            //TODO: handle error
            log(state.error);
            break;
          case ${className}Success:
            widgetUtil.dismissGlobalLoadingOverlay();
            break;
        }
      },
      builder: (context, state) {
          switch (state.runtimeType) {
            case ${className}Initial:
              return Container();
            case ${className}Failure:
              state as ${className}Failure;
              return Center(
                child: Text(
                  state.error,
                  style: DSTheme.of(context).style.tsInterT14M.copyWith(color: Colors.red),
                ),
              );
            case ${className}Success:
              state as ${className}Success;
                return Scaffold(
                    appBar: AppBar(
                      leading: Center(
                        child: GestureDetector(
                          onTap: () => Navigator.of(context).pop(),
                          child: Icon(
                            Icons.keyboard_backspace_outlined,
                            size: 24,
                          ),
                        ),
                      ),
                      backgroundColor: Colors.white,
                      centerTitle: true,
                      title: Text(
                        '${className}'.hardcode,
                        style: DSTheme.of(context).style.tsInterT14M.copyWith(
                          height: 0,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      elevation: 8,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      shadowColor: Colors.black.withOpacity(.2),
                    ),
                    backgroundColor: Colors.white,
                    body: Padding(
                      padding: EdgeInsets.all(19).copyWith(top: 16),
                      child: Column(
                        children: [
                            Text(
                                '${templateStr}'.hardcode,
                                style: DSTheme.of(context).style.tsInterT14M.copyWith(
                                    color: Colors.red[100],
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14,
                                ),
                            ),
                        ],
                      ),
                    ),
                  );
          }
          return Container();
        },
    );
  }
}`;
};
