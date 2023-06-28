import { existsSync, lstatSync } from "fs";
import * as vscode from "vscode";
import * as _ from "lodash";
import {
  createDirectory,
  createFile,
  promptForTargetDirectory,
} from "../utils/utils";

export const newCore = async (uri: vscode.Uri) => {
  console.log(uri.path);

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

  try {
    await generateCore(targetDirectory);
    vscode.window.showInformationMessage(`Successfully generated core`);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

async function generateCore(targetDirectory: string) {
  const blocDirectoryPath = `${targetDirectory}/core`;

  console.log(blocDirectoryPath);

  if (existsSync(blocDirectoryPath)) {
    return;
  }

  createDirectory(blocDirectoryPath);
  createDirectory(`${blocDirectoryPath}/common`);
  createDirectory(`${blocDirectoryPath}/common/widgets`);
  createDirectory(`${blocDirectoryPath}/common/widgets/dialog`);
  createDirectory(`${blocDirectoryPath}/common/widgets/table`);
  createDirectory(`${blocDirectoryPath}/common/widgets/radio`);
  createDirectory(`${blocDirectoryPath}/common/widgets/slider`);
  createDirectory(`${blocDirectoryPath}/common/widgets/bar`);
  createDirectory(`${blocDirectoryPath}/common/widgets/toast`);
  createDirectory(`${blocDirectoryPath}/common/widgets/error`);
  createDirectory(`${blocDirectoryPath}/generator`);
  createDirectory(`${blocDirectoryPath}/language`);
  createDirectory(`${blocDirectoryPath}/local_database`);
  createDirectory(`${blocDirectoryPath}/network`);
  createDirectory(`${blocDirectoryPath}/router`);
  createDirectory(`${blocDirectoryPath}/services`);
  createDirectory(`${blocDirectoryPath}/services/di`);
  createDirectory(`${blocDirectoryPath}/services/firebase`);
  createDirectory(`${blocDirectoryPath}/services/firebase/analytics`);
  createDirectory(`${blocDirectoryPath}/services/firebase/crashlytics`);
  createDirectory(`${blocDirectoryPath}/services/firebase/remote_config`);
  createDirectory(`${blocDirectoryPath}/utils`);
  createDirectory(`${blocDirectoryPath}/utils/app_upgrade`);
  createDirectory(`${blocDirectoryPath}/utils/extension`);
  createDirectory(`${blocDirectoryPath}/utils/firebase`);
  createDirectory(`${blocDirectoryPath}/utils/notification`);
  createDirectory(`${blocDirectoryPath}/utils/validator`);

  //TODO: miss firebase, notification

  await Promise.all([
    //#region language
    createFile(
      `app_vi.arb`,
      `${blocDirectoryPath}/language`,
      `{
      "app":"Counter App"
      }`
    ),
    createFile(
      `l10n.dart`,
      `${blocDirectoryPath}/language`,
      `import 'package:flutter/material.dart';

      class L10n {
      const L10n();
      static final all = [
        const Locale('vi'),
        const Locale('en'),
      ];
    }
      `
    ),
    //#endregion
    //#region local_database
    createFile(
      `share_preferences_hepper.dart`,
      `${blocDirectoryPath}/local_database`,
      `import 'package:shared_preferences/shared_preferences.dart';

    import 'app_local_key.dart';

      class SharedPreferencesRequest<T> {
      SharedPreferencesRequest({required this.key, required this.value});
      final String key;
      final T value;
    }
      
      class SharedPreferencesHelper {
      // const SharedPreferencesHelper();
      // static const instance = SharedPreferencesHelper();
      SharedPreferencesHelper._();
      static SharedPreferencesHelper get instance => SharedPreferencesHelper._();
      
      static late SharedPreferences _pref;
      
      static String getApiTokenKey() {
        try {
          return _pref.setString(AppLocalKey.authKey) ?? '';
        } catch (e) {
          return '';
        }
      }
      
      static Future<void> setApiTokenKey(String value) {
        return _pref.setString(AppLocalKey.authKey, value);
      }
      }`
    ),
    createFile(
      `app_local_key.dart`,
      `${blocDirectoryPath}/local_database`,
      `class AppLocalKey {
      AppLocalKey._internal();
      static const String authKey = 'authKey';
      }`
    ),
    createFile(
      `secure_storage_hepper.dart`,
      `${blocDirectoryPath}/local_database`,
      `import 'dart:convert';

    import 'package:flutter_secure_storage/flutter_secure_storage.dart';
      
      class SecureStorageHelper {
      factory SecureStorageHelper() {
        return singleton;
      }
      
      factory SecureStorageHelper.getInstance() {
        return singleton;
      }
      
      SecureStorageHelper._internal(this._storage);
      static const _apiTokenKey = '_apiTokenKey';
      
      final FlutterSecureStorage _storage;
      
      static final SecureStorageHelper singleton =
          SecureStorageHelper._internal(const FlutterSecureStorage());
      
      Future<void> saveToken(String accessToken, String refreshToken) async {
        await _storage.write(
          key: _apiTokenKey,
          value: jsonEncode(
            {
              'accessToken': accessToken,
              'refreshToken': refreshToken,
            },
          ),
        );
      }
      
      Future<String?> getString({
        required String key,
      }) async {
        final data = await _storage.read(
          key: key,
        );
        return data;
      }
      
      Future<void> deleteAllData() async {
        await _storage.deleteAll();
      }
      
      Future<void> removeToken() async {
        await _storage.delete(key: _apiTokenKey);
      }
      
      Future<Map<String, dynamic>?> getToken() async {
        try {
          final tokenEncoded = await _storage.read(key: _apiTokenKey);
          if (tokenEncoded == null) {
            return null;
          } else {
            return jsonDecode(tokenEncoded) as Map<String, dynamic>;
          }
        } catch (e) {
          return null;
        }
      }
    }
      `
    ),
    createFile(
      `local_database.dart`,
      `${blocDirectoryPath}/local_database`,
      `mixin LocalDatabase {
      static Future<void> init() async {
        // try {
        //   if (Isar.instanceNames.isNotEmpty) return;
      
        //   isar = await openDb();
        // } catch (e, _) {
        //   log(e.toString());
        // }
      }
      
      static Future<bool> openDb() async {
        // return isar;
        return true;
      }
      
      static Future clearDatabase() async {}
      
      static Future<bool> dispose() async {
        // return isar?.close();
        return true;
      }
    }
      
      abstract class BaseLocalDatabase<T> {
      Stream<List<T>> listenDb() {
        throw UnimplementedError('listenDb $T');
      }
      
      Future<List<T>> getAll() {
        throw UnimplementedError('getAll $T');
      }
      
      Future<List<T>> gets({required int limit, required int offset}) {
        throw UnimplementedError('gets $T');
      }
      
      Future<T?> get(String id) {
        throw UnimplementedError('get $T');
      }
      
      Future<T?> getByKey(int id) {
        throw UnimplementedError('getByKey $T');
      }
      
      Future<List<T>> filter() {
        throw UnimplementedError('filter $T');
      }
      
      Future<int> insert(T model) {
        throw UnimplementedError('insert $T');
      }
      
      Future<bool> insertAll(List<T> models) {
        throw UnimplementedError('insert $T');
      }
      
      Future<int> update(T model) {
        throw UnimplementedError('update $T');
      }
      
      Future<bool> delete(int id) {
        throw UnimplementedError('delete $T');
      }
    }
      `
    ),
    //#endregion
    //#region network
    createFile(
      `api_client.dart`,
      `${blocDirectoryPath}/network`,
      `import 'package:dio/dio.dart';
    import 'package:retrofit/retrofit.dart';
      
    part 'api_client.g.dart';
      
    @RestApi()
      abstract class ApiClient {
      factory ApiClient(
        Dio dio, {
        String baseUrl,
      }) = _ApiClient;
        
      //TODO: hard
      @GET('/signIn')
      Future<void> signIn();
    }
      `
    ),
    createFile(
      `api_util.dart`,
      `${blocDirectoryPath}/network`,
      `import 'package:dio/dio.dart';
    import 'package:pretty_dio_logger/pretty_dio_logger.dart';
      
    import 'api_client.dart';
    import 'api_interceptors.dart';
      
      class ApiUtil {
      ApiUtil();
      static Dio initApiService({String? apiEndpoint}) {
        final dio = Dio();
        if (apiEndpoint != null) {
          dio.options.baseUrl = apiEndpoint;
        }
        dio.interceptors.add(ApiInterceptors(dio: dio));
        dio.options.connectTimeout = const Duration(seconds: 30);
        dio.options.headers['Content-Type'] = 'application/json';
      
        dio.options.headers['Accept'] = 'text/json';
        dio.interceptors.add(PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
        ));
      
        return dio;
      }
      
      static ApiClient getApiClient() {
        final apiClient = ApiClient(initApiService());
        return apiClient;
      }
    }         
      `
    ),
    createFile(
      `api_interceptors.dart`,
      `${blocDirectoryPath}/network`,
      `//import 'dart:async';
    import 'package:dio/dio.dart';
    import 'package:flutter/material.dart';
    import 'package:internet_connection_checker/internet_connection_checker.dart';
      
    // import '../../app.dart';
    import '../local_database/share_preferences_hepper.dart';
      
      class ApiInterceptors extends InterceptorsWrapper {
      ApiInterceptors({required this.dio});
      
      final Dio dio;
      @override
      Future<void> onRequest(
          RequestOptions options, RequestInterceptorHandler handler) async {
        final token = SharedPreferencesHelper.getApiTokenKey();
      
        if (token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
          // options.headers['Content-Type'] = 'application/json';
      
          debugPrint('Bearer $token');
        }
        super.onRequest(options, handler);
      }
      
      @override
      Future<void> onError(DioError err, ErrorInterceptorHandler handler) async {
        //TODO: GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
        // MaterialApp(
        //             debugShowCheckedModeBanner: false,
        //             navigatorKey: navigatorKey,
        // )
        // final context = navigatorKey.currentState!.context;
        if (!await InternetConnectionChecker().hasConnection) {
          super.onError(err, handler);
          // LoadingDialog.instance.hide();
          //TODO: show toast
        } else {
          if (err.response?.statusCode == 401) {
            //TODO: clear data local
            // navigator login
            // // Routes.router.navigateTo(context, '/', clearStack: true)
          } else {
            super.onError(err, handler);
            try {
              handler.resolve(err.response!);
            } catch (error) {
              handler.next(err);
            }
          }
      
          // _showNotification(
          //     title: S.of(navigatorKey.currentState!.context)?.server_interrupted ??
          //         '');
        }
      }
    }      
      `
    ),
    //#endregion
    //#region router
    createFile(
      `router_key.dart`,
      `${blocDirectoryPath}/router`,
      `class RouteKeys {
      RouteKeys();
      static const String profile = 'profile';
      }`
    ),
    createFile(
      `router_path.dart`,
      `${blocDirectoryPath}/router`,
      `class RoutePath {
      RoutePath();
      //TODO: hard
      static const String home = '/';
      }`
    ),
    createFile(
      `route.dart`,
      `${blocDirectoryPath}/router`,
      `import 'package:fluro/fluro.dart';
    import 'package:flutter/cupertino.dart';
      
    import 'router_path.dart';
      
      class Routes {
      Routes();
      static final router = FluroRouter();
      static RouteObserver<PageRoute> routeObserver = RouteObserver<PageRoute>();
      
      static void configureRoutes() {
        //TODO: hard
        _setRouter(RoutePath.home, handler: Handler(
            handlerFunc: (BuildContext? context, Map<String, List<String>> params) {
          return Container();
        }), transitionType: TransitionType.cupertino);
      }
      
      static void _setRouter(String path,
          {required Handler handler, TransitionType? transitionType}) {
        transitionType ??= TransitionType.cupertino;
        router.define(path, handler: handler, transitionType: transitionType);
      }
    }
      `
    ),
    //#endregion
    //#region services
    createFile(
      `service_locator.dart`,
      `${blocDirectoryPath}/services/di`,
      `import 'package:dio/dio.dart';
    import 'package:get_it/get_it.dart';
    import 'package:injectable/injectable.dart';
      
    import '../../network/api_client.dart';
    import 'service_locator.config.dart';
      
    final getIt = GetIt.instance;
      
      @InjectableInit(
      initializerName: r'$initGetIt', // default
      preferRelativeImports: true, // default
      asExtension: false,
    )
      void configureDependencies({
      required Dio dio,
      }) {
      getIt.registerLazySingleton<ApiClient>(() => ApiClient(
            dio,
          ));
      
      $initGetIt(getIt);
    }
      `
    ),
    createFile(
      `analytics_app.dart`,
      `${blocDirectoryPath}/services/firebase/analytics`,
      `import 'package:firebase_analytics/firebase_analytics.dart';
    import 'package:firebase_core/firebase_core.dart';
      
      class AnalyticsApp {
      AnalyticsApp._internal();
      static late FirebaseAnalytics analytics;
      
      static Future<void> init({required FirebaseApp firebaseApp}) async {
        analytics = FirebaseAnalytics.instance;
        analytics.setAnalyticsCollectionEnabled(true);
      }
    }      
      `
    ),
    createFile(
      `constants.dart`,
      `${blocDirectoryPath}/services/firebase/crashlytics`,
      `import 'package:firebase_crashlytics/firebase_crashlytics.dart';

      class CrashlyticsApp {
      CrashlyticsApp._internal();
      
      static Future<void> logError(
        dynamic exception, {
        StackTrace? stackTrace,
        dynamic reason,
        Iterable<Object> information = const [],
        bool? printDetails,
        bool fatal = false,
      }) async {
        await FirebaseCrashlytics.instance.recordError(
          exception,
          stackTrace ?? StackTrace.fromString('No StackTrace'),
          reason: reason,
          information: information,
          printDetails: printDetails,
          fatal: fatal,
        );
      }
    }            
      `
    ),
    createFile(
      `remote_config_app.dart`,
      `${blocDirectoryPath}/services/firebase/remote_config`,
      `import 'package:firebase_remote_config/firebase_remote_config.dart';

    import 'remote_config_constants.dart';
      
      class RemoteConfigApp {
      RemoteConfigApp._internal();
      static late FirebaseRemoteConfig _remoteConfig;
      static Future<void> init() async {
        _remoteConfig = FirebaseRemoteConfig.instance;
        await _remoteConfig.setConfigSettings(RemoteConfigSettings(
          fetchTimeout: const Duration(minutes: 1),
          minimumFetchInterval: const Duration(hours: 1),
        ));
        await _remoteConfig.fetchAndActivate();
      }
      
      static String getNewVersionApp() {
        return _remoteConfig.getString(RemoteConfigConstants.newVersionApp);
      }
    }        
      `
    ),
    createFile(
      `remote_config_constants.dart`,
      `${blocDirectoryPath}/services/firebase/remote_config`,
      `class RemoteConfigConstants {
      RemoteConfigConstants._internal();
      static const String newVersionApp = 'new_version_app';
    }             
      `
    ),
    //#endregion
    //#region utils
    createFile(
      `app_upgrade.dart`,
      `${blocDirectoryPath}/utils/app_upgrade`,
      `import 'dart:io';

    import 'package:flutter/cupertino.dart';
    import 'package:flutter/material.dart';
    import 'package:launch_review/launch_review.dart';
    import 'package:package_info_plus/package_info_plus.dart';
    import 'package:version/version.dart';
      
    import '../../services/firebase/remote_config/remote_config_app.dart';
      
    // ignore: avoid_classes_with_only_static_members
      class AppUpgrade {
      static const androidAppId = 'TODO:';
      static const iOSAppId = 'TODO:';
      
      static Future<void> verifyRemoteConfigurations({
        required BuildContext context,
        bool maintenance = false,
        bool appUpdate = false,
        bool newTermsOfService = false,
      }) async {
        final newVersion = await _fetchNewVersion();
        if (newVersion == null || newVersion.isEmpty) {
          return;
        }
        if (maintenance) {
          // await _showMaintenanceDialogIfRequired(
          // );
        }
      
        if (appUpdate) {
          // ignore: use_build_context_synchronously
          await _showUpdateAppDialogIfRequired(
            context,
            newVersion,
          );
        }
        if (newTermsOfService) {
          // await _showNewTermsDialogIfRequired(
          //   context,
          //   envState,
          //   prefs,
          //   config.notifyNewTermsOfService,
          // );
        }
      }
      
      static Future<String?> _fetchNewVersion() async {
        return RemoteConfigApp.getNewVersionApp();
      }
      
      static Future<void> _showUpdateAppDialogIfRequired(
        BuildContext context,
        String newVersion,
      ) async {
        if (await _isShowOptionalUpdateDialog(newVersion: newVersion)) {
          // ignore: use_build_context_synchronously
          await _showOptionalUpdateDialog(context, newVersion);
        }
      }
      
      static Future<bool> _isShowOptionalUpdateDialog(
          {String newVersion = ''}) async {
        final currentVersion = await getAppVersion();
        return currentVersion < Version.parse(newVersion);
      }
      
      static Future<void> _showOptionalUpdateDialog(
        BuildContext context,
        String newVersion,
      ) async {
        //TODO: hard
        final confirm = await _showTwoButtonsDialog(
          context: context,
          title: 'new version',
          message: 'new version app. upgrade now',
          actionOk: 'ok',
          actionCancel: 'cancel',
        );
        if (!confirm) {
          return;
        }
        await _showAppInStore();
      }
      
      static Future<Version> getAppVersion() async {
        final packageInfo = await PackageInfo.fromPlatform();
        return Version.parse(packageInfo.version);
      }
      
      static Future<bool> _showTwoButtonsDialog({
        required BuildContext context,
        String? title,
        String? message,
        String? actionOk,
        String? actionCancel,
        bool barrierDismissible = true,
      }) async {
        final dialogResult = await showDialog<bool>(
          context: context,
          barrierDismissible: barrierDismissible,
          builder: (BuildContext context) {
            if (Platform.isIOS) {
              return CupertinoAlertDialog(
                title: Text(title ?? ''),
                content: Text(message ?? ''),
                actions: buildListAction(context, actionOk, actionCancel),
              );
            }
            return AlertDialog(
              title: Text(title ?? ''),
              content: Text(message ?? ''),
              actions: buildListAction(context, actionOk, actionCancel),
            );
          },
        );
        return dialogResult ?? false;
      }
      
      static List<Widget> buildListAction(
        BuildContext context,
        String? actionOk,
        String? actionCancel,
      ) {
        return <Widget>[
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(actionCancel ?? ''),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(actionOk ?? ''),
          ),
        ];
      }
      
      static Future<void> _showAppInStore() async {
        await LaunchReview.launch(
          androidAppId: androidAppId,
          iOSAppId: iOSAppId,
          writeReview: false,
        );
      }
    }
      `
    ),
    createFile(
      `extensions.dart`,
      `${blocDirectoryPath}/utils`,
      `import 'package:flutter/material.dart';
    import 'package:dio/dio.dart';

      enum Status {
      initial,
      loading,
      success,
      failure,
    }
      
      extension VStatus on Status {
      bool get isInitial => this == Status.initial;
      bool get isLoading => this == Status.loading;
      bool get isSuccess => this == Status.success;
      bool get isFailure => this == Status.failure;
      void when({
        // required VoidCallback initial,
        required VoidCallback onLoading,
        required VoidCallback onSuccess,
        required VoidCallback onFailure,
      }) {
        if (isLoading) onLoading();
        if (isSuccess) onSuccess();
        if (isFailure) onFailure();
      }
    }
      extension StringT on String {
      String get hardcode => this;
    }

      extension ExceptionCustomization on Exception {
      String decodeErrorResponse() {
        String message = '';
        if (runtimeType == DioError) {
          final dioException = this as DioError;
          if (dioException.response?.data != null) {
            message = dioException.response?.statusCode == 401
                ? ''
                : 'Undetected error from server';
            if (dioException.response?.data is Map) {
              final Map responseData = dioException.response?.data as Map;
              message = responseData['message'] ??
                  responseData['Message'] ??
                  'Could not parse the response';
            }
          }
        }
      
        return message;
      }
    }

      extension SB on num {
      Widget get vertical => SizedBox(
            height: toDouble(),
          );
      Widget get horizontal => SizedBox(
            width: toDouble(),
          );
      double textHeight(num size) => this / size;
    }
      `
    ),
    createFile(
      `validator.dart`,
      `${blocDirectoryPath}/utils/validator`,
      `import 'package:flutter/material.dart';
      
      extension Validator on String? {
      String? validatorPhone(
        BuildContext context, {
        required AutovalidateMode? autovalidateMode,
      }) {
        // if (this == null || this!.isEmpty) {
        //   return autovalidateMode == AutovalidateMode.always
        //       ? context.ln.requiredInput
        //       : null;
        // }
        // if (this!.length == 1 && this!.startsWith('0')) return null;
        // if (!this!.startsWith('0')) return context.ln.startWidth0;
        // if (this!.length != 10) return context.ln.phoneHas10Number;
        // if (!this!.isNumber) {
        //   return context.ln.phoneWithCharacter;
        // }
        return null;
      }
      }`
    ),
    //#endregion

    //#region readme, l10n, build
    createFile(
      `README.md`,
      blocDirectoryPath,
      `TODO: remove
      WidgetsFlutterBinding.ensureInitialized();
      runZonedGuarded(() async {
        await initApp();
        configureDependencies(
          dio: ApiUtil.initApiService(apiEndpoint: dotenv.env['API_ENDPOINT']),
        );
        await LocalDatabase.init();
        runApp(const App());
      }, (error, stackTrace) async {
        await CrashlyticsApp.logError(
          'Error when init App : $error',
          stackTrace: stackTrace,
          fatal: true,
        );
      });

      Future<void> initApp() async {
        await dotenv.load();
        final firebaseApp = await Firebase.initializeApp(
          name: DefaultFirebaseOptions.name,
          options: DefaultFirebaseOptions.currentPlatform,
        );
        Routes.configureRoutes();
      
        firebaseApp.setAutomaticDataCollectionEnabled(true);
        EasyLoading.instance
          ..displayDuration = const Duration(milliseconds: 2000)
          ..indicatorType = EasyLoadingIndicatorType.fadingCircle
          ..loadingStyle = EasyLoadingStyle.light
          ..indicatorSize = 45.0
          ..radius = 10.0
          ..userInteractions = true
          ..dismissOnTap = false;
        try {
          await SharedPreferencesHelper.instance.init();
          await RemoteConfigApp.init();
          await AnalyticsApp.init(firebaseApp: firebaseApp);
          await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
        } catch (e) {
          log(e.toString())
        }
      }
      `
    ),
    createFile(
      `l10n.yaml`,
      blocDirectoryPath,
      `TODO: more source app
arb-dir: lib/core/language
template-arb-file: app_vi.arb
output-localization-file: s.dart
output-class: S
output-dir: lib/core/language/l10n
      `
    ),
    createFile(
      `build.yaml`,
      blocDirectoryPath,
      `targets:
      $default:
        builders:
          injectable_generator:injectable_builder:
            options:
              auto_register: true
              # auto registers any class with a name matches the given pattern
              class_name_pattern: "Service$|Repository$|UseCase$|RemoteDataSource$|LocalDataSource$|ApiUtil$|Bloc$|LocalDatabase$|Online$"
              # auto registers any class inside a file with a
              # name matches the given pattern
      `
    ),
    createFile(
      `.env`,
      blocDirectoryPath,
      `API_ENDPOINT = http://20.205.148.103/`
    ),
    createFile(
      `runner.sh`,
      blocDirectoryPath,
      `flutter gen-l10n
flutter pub run build_runner build --delete-conflicting-outputs`
    ),
    createFile(
      `install_init.sh`,
      blocDirectoryPath,
      `# flutter_gen:
#   output: lib/core/generator
#   line_length: 80
#   integrations:
#     flutter_svg: true
# flutter:
#   generate: true
#   uses-material-design: true
#   assets:
#     - assets/icon/

#     - .env
flutter pub add build_runner --dev
flutter pub add injectable_generator --dev
flutter pub add json_serializable --dev
flutter pub add copy_with_extension_gen --dev
flutter pub add flutter_gen_runner --dev
flutter pub add retrofit_generator --dev
      `
    ),
    //#endregion
  ]);
}
