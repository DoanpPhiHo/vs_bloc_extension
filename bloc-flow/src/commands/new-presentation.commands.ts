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

export const newPresentation = async (uri: Uri) => {
  let file = uri.path.split("/").slice(-1)[0];
  let fileName = await promptForName(changeCase.snakeCase(file));
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
  let fullPath = `${uri.path}/${fileName}`.split("/");
  let i = fullPath.lastIndexOf("lib");
  await genSubPresentation(fullPath.slice(i - 1).join("/"), fsPath);
};

export const genSubPresentation = async (fullPath: string, fsPath: string) => {
  let file = fullPath.replace("\\", "/").split("/").slice(-1)[0];
  let fileName = changeCase.snakeCase(file);
  let str = presentationStr(fileName, fullPath.replace("/", " "));
  let dir = `${fsPath}/${fileName}`;
  createDirectory(dir);
  createFile(`${fileName}_page.dart`, dir, str);
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

  return `import 'package:fluro/fluro.dart';
  import 'package:flutter/material.dart';
  import 'package:flutter_bloc/flutter_bloc.dart';
  
  import '../../../../core/common/widgets/dialog/loading.dart';
  import '../../../../core/common/widgets/toast/toast.dart';
  import '../../../../core/generator/colors.gen.dart';
  import '../../../../core/services/di/service_locator.dart';
  import '../../../../core/utils/extensions.dart';
  import '../../../../core/utils/styles.dart';
  import '../../domain/use_case/${fileName}_use_case.dart';
  import 'bloc/${fileName}_bloc.dart';

//TODO: router
// _setRouter(
//   RoutePath.${handleName},
//   handler: ${handleName}Handler,
// );
//TODO: router path
// /// {@macro ${templateStr}}
// static const String ${handleName} = ${className}Page.name;

Handler ${handleName}Handler = Handler(
    handlerFunc: (BuildContext? context, Map<String, List<String>> params) {
  return BlocProvider(
    create: (context) => ${className}Bloc(
      getIt<${className}UseCase>(),
    )..add(${className}InitEvent()),
    child: const ${className}Page(),
  );
});

class ${className}Page extends StatefulWidget {
  const ${className}Page({super.key});

  /// {@template ${templateStr}}
  /// \`\`\`dart
  /// Routes.router.navigateTo(
  ///   context,
  ///   RoutePath.${handleName},
  /// )
  /// \`\`\`
  /// {@endtemplate}
  static const String name = '${fileName}';

  @override
  State<${className}Page> createState() =>
      _${className}PageState();
}

class _${className}PageState extends State<${className}Page> {
  @override
  Widget build(BuildContext context) {
    return BlocListener<${className}Bloc, ${className}State>(
      listener: (context, state) {
        switch (state) {
          case ${className}Loading():
            LoadingDialog.instance.show();
            break;
          case ${className}Failure():
            LoadingDialog.instance.hide();
            ToastWidget.instance.showToast(
              state.error,
              backgroundColor: AppColors.red,
              messageColor: AppColors.white,
            );
            break;
          case ${className}Success():
            LoadingDialog.instance.hide();
            break;
        }
      },
      child: BlocBuilder<${className}Bloc, ${className}State>(
        builder: (context, state) {
          switch (state) {
            case ${className}Initial():
              return Container();
            case ${className}Failure():
              return Center(
                child: Text(
                  state.error,
                  style: AppTextStyle.normal.cp(color: AppColors.red),
                ),
              );
            case ${className}Success():
                return Scaffold(
                    appBar: AppBar(
                      leading: Center(
                        child: GestureDetector(
                          onTap: () => Navigator.of(context).pop(),
                          child: Icon(
                            Icons.keyboard_backspace_outlined,
                            size: 24.sf,
                          ),
                        ),
                      ),
                      backgroundColor: AppColors.white,
                      centerTitle: true,
                      title: Text(
                        '${className}'.hardcode,
                        style: AppTextStyle.normal.cp(
                          height: 0,
                          fontSize: 16.sf,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      elevation: 8,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.sf),
                      ),
                      shadowColor: AppColors.black.withOpacity(.2),
                    ),
                    backgroundColor: Colors.white,
                    body: Padding(
                      padding: EdgeInsets.all(19.sf).copyWith(top: 16.sf),
                      child: Column(
                        children: [
                            Text(
                                '${templateStr}'.hardcode,
                                style: AppTextStyle.normal.cp(
                                    color: AppColors.primary300,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14.sf,
                                ),
                            ),
                        ],
                      ),
                    ),
                  );
          }
          return Container();
        },
      ),
    );
  }
}`;
};
