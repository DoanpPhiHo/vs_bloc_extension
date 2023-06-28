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
    //#region common
    createFile(
      `loading.dart`,
      `${blocDirectoryPath}/common/widgets/dialog`,
      `import 'dart:math';

      import 'package:flutter/material.dart';
      
      import '../../../../app.dart';
      import '../../../generator/colors.gen.dart';

      class LoadingDialog {
        LoadingDialog._();
        static LoadingDialog instance = LoadingDialog._();
        OverlayEntry? _overlay;
      
        void show() {
          WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
            if (_overlay == null) {
              _overlay = OverlayEntry(
                builder: (context) => ColoredBox(
                  color: Colors.black.withOpacity(.3),
                  child: const Center(
                    child: LoadingAnimated(),
                  ),
                ),
              );
              Overlay.of(navigatorKey.currentState!.context).insert(_overlay!);
            }
          });
        }
      
        void hide() {
          WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
            _overlay?.remove();
            _overlay = null;
          });
        }
      }
      
      class GradientCircularProgressIndicator extends StatelessWidget {
        const GradientCircularProgressIndicator({
          super.key,
          required this.radius,
          required this.gradientColorsStart,
          required this.gradientColorsEnd,
          this.strokeWidth = 10.0,
          this.endPoint,
        });
        final double radius;
        final Color gradientColorsStart;
        final Color gradientColorsEnd;
        final double strokeWidth;
        final double? endPoint;
      
        @override
        Widget build(BuildContext context) {
          return CustomPaint(
            size: Size.fromRadius(radius),
            painter: GradientCircularProgressPainter(
              gradientColors: [
                gradientColorsEnd,
                gradientColorsStart,
              ],
              strokeWidth: strokeWidth,
              endPoint: endPoint,
            ),
          );
        }
      }
      
      class LoadingAnimated extends StatefulWidget {
        const LoadingAnimated({
          super.key,
          this.strokeWidth,
          this.radius,
          this.begin,
          this.end,
          this.gradientColorsStart,
          this.gradientColorsEnd,
          this.endPoint,
          this.size,
        });
        final Size? size;
        final double? strokeWidth;
        final double? radius;
        final double? begin;
        final double? end;
        final Color? gradientColorsStart;
        final Color? gradientColorsEnd;
        final double? endPoint;
      
        @override
        State<LoadingAnimated> createState() => _LoadingAnimatedState();
      }
      
      class _LoadingAnimatedState extends State<LoadingAnimated>
          with SingleTickerProviderStateMixin {
        late AnimationController _controller;
      
        @override
        void initState() {
          _controller = AnimationController(
            duration: const Duration(seconds: 2),
            vsync: this,
          )..repeat();
          super.initState();
        }
      
        @override
        void dispose() {
          _controller.dispose();
          super.dispose();
        }
      
        @override
        Widget build(BuildContext context) {
          return RotationTransition(
            turns: Tween(
              begin: widget.begin ?? 0.0,
              end: widget.end ?? 1.0,
            ).animate(_controller),
            child: SizedBox(
              width: widget.size?.width,
              height: widget.size?.height,
              child: GradientCircularProgressIndicator(
                radius: widget.radius ?? 20,
                strokeWidth: widget.strokeWidth ?? 5,
                gradientColorsEnd:
                    widget.gradientColorsEnd ?? AppColors.primary300.withOpacity(0),
                gradientColorsStart:
                    widget.gradientColorsStart ?? AppColors.primary300,
                endPoint: widget.endPoint,
              ),
            ),
          );
        }
      }
      
      class GradientCircularProgressPainter extends CustomPainter {
        GradientCircularProgressPainter({
          required this.gradientColors,
          required this.strokeWidth,
          this.endPoint,
        });
        final List<Color> gradientColors;
        final double strokeWidth;
        final double? endPoint;
      
        @override
        void paint(Canvas canvas, Size size) {
          final radius = size.height / 2;
          size = Size.fromRadius(radius);
          final offset = strokeWidth / 2;
          final scapToDegree = offset / radius;
          final startAngle = _degreeToRad(270) + scapToDegree;
          final sweepAngle = _degreeToRad(endPoint ?? 360) - (2 * scapToDegree);
          final rect =
              Rect.fromCircle(center: Offset(radius, radius), radius: radius);
          final paint = Paint()
            ..style = PaintingStyle.stroke
            ..strokeCap = StrokeCap.round
            ..strokeWidth = strokeWidth;
          paint.shader = SweepGradient(
                  colors: gradientColors,
                  tileMode: TileMode.repeated,
                  startAngle: _degreeToRad(270),
                  endAngle: _degreeToRad(270 + 360.0))
              .createShader(
                  Rect.fromCircle(center: Offset(radius, radius), radius: 0));
      
          canvas.drawArc(rect, startAngle, sweepAngle, false, paint);
        }
      
        double _degreeToRad(double degree) => degree * pi / 180;
      
        @override
        bool shouldRepaint(CustomPainter oldDelegate) {
          return true;
        }
      }      
      `
    ),
    createFile(
      `toast.dart`,
      `${blocDirectoryPath}/common/widgets/toast`,
      `import 'dart:async';
      import 'package:flutter/material.dart';
      
      import '../../../../app.dart';
      import '../../../generator/colors.gen.dart';
      import '../../../utils/extensions.dart';
      import '../../../utils/styles.dart';
      import '../dialog/loading.dart';
      
      class ToastWidget {
        ToastWidget._();
        static ToastWidget instance = ToastWidget._();
        OverlayEntry? _overlay;
        Timer? lifeTime;
        void showToast(
          String message, {
          Color? messageColor,
          Color? backgroundColor,
          int? seconds,
          String? icon,
          TextStyle? style,
          Widget? child,
          bool hideLoading = false,
        }) {
          if (hideLoading) {
            LoadingDialog.instance.hide();
          }
          if (_overlay == null) {
            startTimer(seconds: seconds);
            _overlay = OverlayEntry(
              builder: (context) => GestureDetector(
                onTap: () {
                  hideToastV2();
                },
                child: Material(
                  type: MaterialType.transparency,
                  child: BuildBodyWidget(
                    message: message,
                    backgroundColor: backgroundColor,
                    messageColor: messageColor,
                    seconds: seconds,
                    icon: icon,
                    style: style,
                    child: child,
                  ),
                ),
              ),
            );
            Overlay.of(navigatorKey.currentState!.context).insert(_overlay!);
          } else {
            // hideToastV2();
            // showToastV2(message,
            //     messageColor: messageColor, backgroundColor: backgroundColor);
          }
        }
      
        void hideToastV2() {
          _overlay?.remove();
          _overlay = null;
        }
      
        void startTimer({int? seconds}) {
          lifeTime?.cancel();
          lifeTime = Timer(Duration(seconds: seconds ?? 4), () {
            hideToastV2();
          });
        }
      }
      
      class BuildBodyWidget extends StatefulWidget {
        const BuildBodyWidget(
            {super.key,
            required this.message,
            this.backgroundColor,
            this.messageColor,
            this.child,
            this.icon,
            this.style,
            this.seconds});
        final Color? messageColor;
        final Color? backgroundColor;
        final int? seconds;
        final String message;
        final String? icon;
        final Widget? child;
        final TextStyle? style;
        @override
        State<BuildBodyWidget> createState() => _BuildBodyWidgetState();
      }
      
      class _BuildBodyWidgetState extends State<BuildBodyWidget>
          with SingleTickerProviderStateMixin {
        late AnimationController controller;
        late Animation<Offset> position;
      
        @override
        void initState() {
          super.initState();
          controller = AnimationController(
              vsync: this, duration: const Duration(milliseconds: 1000));
          position = Tween<Offset>(begin: const Offset(0.0, -1.0), end: Offset.zero)
              .animate(CurvedAnimation(parent: controller, curve: Curves.easeIn));
          controller.forward();
        }
      
        @override
        Widget build(BuildContext context) {
          return SafeArea(
            child: SlideTransition(
              position: position,
              child: Column(
                children: [
                  Container(
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: widget.backgroundColor ?? AppColors.primaryColor,
                    ),
                    margin: EdgeInsets.symmetric(horizontal: 10.sf),
                    padding: EdgeInsets.symmetric(
                      vertical: 12.sf,
                      horizontal: 10.sf,
                    ),
                    child: Row(
                      children: [
                        if (widget.icon != null)
                          Padding(
                            padding: EdgeInsets.only(right: 10.sf),
                            child: const Icon(
                              Icons.info,
                              color: Colors.white,
                            ),
                          ),
                        Expanded(
                          child: Text(
                            widget.message,
                            textAlign: widget.icon == null ? TextAlign.center : null,
                            style: (widget.style ?? AppTextStyle.normal).copyWith(
                              color: widget.messageColor ?? AppColors.white,
                              height: 1,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }
      }             
      `
    ),
    //#endregion
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

      Future<void> init() async {
        _pref = await SharedPreferences.getInstance();
      }
      
      static String getApiTokenKey() {
        try {
          return _pref.getString(AppLocalKey.authKey) ?? '';
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
      Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
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
      `firebase_option.dart`,
      `${blocDirectoryPath}/services/firebase`,
      `import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
      import 'package:flutter/foundation.dart'
          show defaultTargetPlatform, TargetPlatform;
      import 'package:flutter_dotenv/flutter_dotenv.dart';
      
      class DefaultFirebaseOptions {
        DefaultFirebaseOptions();
        static String get name {
          return dotenv.env['NAME'] ?? '';
        }
      
        static FirebaseOptions get currentPlatform {
          switch (defaultTargetPlatform) {
            case TargetPlatform.android:
              return android;
            case TargetPlatform.iOS:
              return ios;
      
            // ignore: no_default_cases
            default:
              throw UnsupportedError(
                'DefaultFirebaseOptions are not supported for this platform.',
              );
          }
        }
      
        static FirebaseOptions android = FirebaseOptions(
          apiKey: dotenv.env['ANDROID_API_KEY'] ?? '',
          appId: dotenv.env['ANDROID_APP_ID'] ?? '',
          messagingSenderId: dotenv.env['ANDROID_MESSAGING_SENDER_ID'] ?? '',
          projectId: dotenv.env['ANDROID_PROJECT_ID'] ?? '',
        );
      
        static FirebaseOptions ios = FirebaseOptions(
          apiKey: dotenv.env['IOS_API_KEY'] ?? '',
          appId: dotenv.env['IOS_APP_ID'] ?? '',
          messagingSenderId: dotenv.env['IOS_MESSAGING_SENDER_ID'] ?? '',
          projectId: dotenv.env['IOS_PROJECT_ID'] ?? '',
        );
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
    export 'package:flutter_gen/gen_l10n/s.dart';

    class SizeUntil {
      SizeUntil._();
      static SizeUntil instance = SizeUntil._();
      static final view = WidgetsBinding.instance.platformDispatcher.implicitView;
      static final Size pS = view?.physicalSize ?? sizeDefault;
      static final dR = view?.devicePixelRatio ?? 1;
      static final Size _size = pS / dR;
      static Size get size => _size;
    }
    
    Size sizeDefault = const Size(375, 812);
    
    final double heightFlex = sizeDefault.height.sf;
    final double widthFlex = sizeDefault.width.sf;
    
    extension NumEx on num {
      double get hf => SizeUntil.size.h(sizeDefault) * this;
    
      double get wf => SizeUntil.size.w(sizeDefault) * this;
    
      double get sf => SizeUntil.size.f(sizeDefault) * this;
    
      double get rf => SizeUntil.size.f(sizeDefault) * this;
    
      double height(num size) => sf / size.sf;
    }
    
    /// without size default [sizeDefault]
    extension NumSize on Size {
      double h(Size size) => height / size.height;
    
      double w(Size size) => width / size.width;
    
      double f(Size size) =>
          width < height ? width / size.width : height / size.height;
    }
    
    class NumContext {
      NumContext(this.numBer, this.numHeight, this.context);
      final double numBer;
      final double numHeight;
      final BuildContext context;
    }
    
    extension SizeLayoutContext on BuildContext {
      Size get appSize => MediaQuery.of(this).size;
    
      EdgeInsets get padding => MediaQuery.of(this).padding;
    }

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
        if (runtimeType == DioException) {
          final dioException = this as DioException;
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
      `styles.dart`,
      `${blocDirectoryPath}/utils`,
      `import 'package:flutter/material.dart';

      import '../generator/colors.gen.dart';
      import 'extensions.dart';
      class AppTextStyle {
        AppTextStyle._internal();
        static TextStyle get _baseTextStyle => TextStyle(
              // fontFamily: FontFamily.beVietNamPro,
              color: AppColors.primaryColor,
              fontStyle: FontStyle.normal,
              fontSize: 16.sf,
              fontWeight: FontWeight.w400,
              height: 28.sf.textHeight(16.sf),
            );
      
        static TextStyle get normal => _baseTextStyle.copyWith(
              color: AppColors.neutralGreenColor,
              fontSize: 14.sf,
              height: 24.sf.textHeight(14.sf),
            );
      }
      
      extension VTextStyle on TextStyle {
        TextStyle cp({
          bool? inherit,
          Color? color,
          Color? backgroundColor,
          double? fontSize,
          FontWeight? fontWeight,
          FontStyle? fontStyle,
          double? letterSpacing,
          double? wordSpacing,
          TextBaseline? textBaseline,
          double? height,
          // ui.TextLeadingDistribution? leadingDistribution,
          Locale? locale,
          Paint? foreground,
          Paint? background,
          // List<ui.Shadow>? shadows,
          // List<ui.FontFeature>? fontFeatures,
          // List<ui.FontVariation>? fontVariations,
          TextDecoration? decoration,
          Color? decorationColor,
          TextDecorationStyle? decorationStyle,
          double? decorationThickness,
          String? debugLabel,
          String? fontFamily,
          List<String>? fontFamilyFallback,
          String? package,
          TextOverflow? overflow,
        }) =>
            copyWith(
              inherit: inherit,
              color: color,
              backgroundColor: backgroundColor,
              fontSize: fontSize,
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              letterSpacing: letterSpacing,
              wordSpacing: wordSpacing,
              textBaseline: textBaseline,
              height:
                  height != null ? height.sf.textHeight(fontSize ?? 14.sf) : height,
              leadingDistribution: leadingDistribution,
              locale: locale,
              foreground: foreground,
              background: background,
              shadows: shadows,
              fontFeatures: fontFeatures,
              fontVariations: fontVariations,
              decoration: decoration,
              decorationColor: decorationColor,
              decorationStyle: decorationStyle,
              decorationThickness: decorationThickness,
              debugLabel: debugLabel,
              // fontFamily: fontFamily ??
              //     (fontWeight == FontWeight.w700
              //         ? FontFamily.beVietNamProBold
              //         : FontFamily.beVietNamPro),
              fontFamilyFallback: fontFamilyFallback,
              package: package,
              overflow: overflow,
            );
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
      //Material app
      GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

      navigatorKey: navigatorKey,
      debugShowCheckedModeBanner: false,
      color: Colors.white,
      supportedLocales: S.supportedLocales,
      localizationsDelegates: const [
        S.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: EasyLoading.init(builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(textScaleFactor: 1.0),
          child: child!,
        );
      }),
      home: const Container(),
      onGenerateRoute: Routes.router.generator,
      theme: ThemeData(
        primarySwatch: Colors.red,
        appBarTheme: const AppBarTheme(
          systemOverlayStyle: SystemUiOverlayStyle.dark,
        ),
        // fontFamily: FontFamily.beVietNamPro,
      ),
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
#   colors:
#     enabled: true
#     outputs:
#       class_name: AppColors
#     inputs:
#       - assets/color/colors.xml
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

flutter pub add flutter_secure_storage
flutter pub add shared_preferences
flutter pub add retrofit
flutter pub add dio
flutter pub add internet_connection_checker
flutter pub add pretty_dio_logger
flutter pub add fluro
flutter pub add injectable
flutter pub add get_it
flutter pub add copy_with_extension
flutter pub add meta
flutter pub add dartz
flutter pub add firebase_analytics
flutter pub add firebase_crashlytics
flutter pub add firebase_core
flutter pub add firebase_remote_config
flutter pub add launch_review
flutter pub add flutter_easyloading
flutter pub add package_info_plus
flutter pub add version
flutter pub add flutter_dotenv
      `
    ),
    //#endregion
  ]);
}
