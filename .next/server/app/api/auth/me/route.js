"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/me/route";
exports.ids = ["app/api/auth/me/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.js&appDir=%2Fworkspaces%2Fvscode%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2Fvscode&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.js&appDir=%2Fworkspaces%2Fvscode%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2Fvscode&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _workspaces_vscode_app_api_auth_me_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/me/route.js */ \"(rsc)/./app/api/auth/me/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/me/route\",\n        pathname: \"/api/auth/me\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/me/route\"\n    },\n    resolvedPagePath: \"/workspaces/vscode/app/api/auth/me/route.js\",\n    nextConfigOutput,\n    userland: _workspaces_vscode_app_api_auth_me_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/me/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGbWUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkZtZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkZtZSUyRnJvdXRlLmpzJmFwcERpcj0lMkZ3b3Jrc3BhY2VzJTJGdnNjb2RlJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZ3b3Jrc3BhY2VzJTJGdnNjb2RlJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNMO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmFsY29uLXBvcy8/ZTU1ZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvd29ya3NwYWNlcy92c2NvZGUvYXBwL2FwaS9hdXRoL21lL3JvdXRlLmpzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL21lL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9tZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9tZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi93b3Jrc3BhY2VzL3ZzY29kZS9hcHAvYXBpL2F1dGgvbWUvcm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvbWUvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.js&appDir=%2Fworkspaces%2Fvscode%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2Fvscode&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/me/route.js":
/*!**********************************!*\
  !*** ./app/api/auth/me/route.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var _lib_session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/session */ \"(rsc)/./lib/session.js\");\n\nasync function GET() {\n    const u = await (0,_lib_session__WEBPACK_IMPORTED_MODULE_0__.currentUser)();\n    return Response.json(u ? {\n        name: u.name,\n        role: u.role\n    } : {}, {\n        status: u ? 200 : 401\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvbWUvcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBNEM7QUFDckMsZUFBZUM7SUFDcEIsTUFBTUMsSUFBSSxNQUFNRix5REFBV0E7SUFDM0IsT0FBT0csU0FBU0MsSUFBSSxDQUFDRixJQUFJO1FBQUVHLE1BQU1ILEVBQUVHLElBQUk7UUFBRUMsTUFBTUosRUFBRUksSUFBSTtJQUFDLElBQUksQ0FBQyxHQUFHO1FBQUVDLFFBQVFMLElBQUksTUFBTTtJQUFJO0FBQ3hGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmFsY29uLXBvcy8uL2FwcC9hcGkvYXV0aC9tZS9yb3V0ZS5qcz83ZTY5Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGN1cnJlbnRVc2VyIH0gZnJvbSAnQC9saWIvc2Vzc2lvbic7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICBjb25zdCB1ID0gYXdhaXQgY3VycmVudFVzZXIoKTtcbiAgcmV0dXJuIFJlc3BvbnNlLmpzb24odSA/IHsgbmFtZTogdS5uYW1lLCByb2xlOiB1LnJvbGUgfSA6IHt9LCB7IHN0YXR1czogdSA/IDIwMCA6IDQwMSB9KTtcbn1cbiJdLCJuYW1lcyI6WyJjdXJyZW50VXNlciIsIkdFVCIsInUiLCJSZXNwb25zZSIsImpzb24iLCJuYW1lIiwicm9sZSIsInN0YXR1cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/me/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/session.js":
/*!************************!*\
  !*** ./lib/session.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   checkPw: () => (/* binding */ checkPw),\n/* harmony export */   currentUser: () => (/* binding */ currentUser),\n/* harmony export */   hashPw: () => (/* binding */ hashPw),\n/* harmony export */   makeToken: () => (/* binding */ makeToken),\n/* harmony export */   readToken: () => (/* binding */ readToken)\n/* harmony export */ });\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ \"crypto\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\nconst secret = ()=>process.env.AUTH_SECRET || \"change-this-secret\";\nconst hashPw = (pw)=>{\n    const salt = (0,crypto__WEBPACK_IMPORTED_MODULE_0__.randomBytes)(16).toString(\"hex\");\n    return salt + \":\" + (0,crypto__WEBPACK_IMPORTED_MODULE_0__.scryptSync)(pw, salt, 64).toString(\"hex\");\n};\nconst checkPw = (pw, stored)=>{\n    if (!stored) return false;\n    const [salt, h] = stored.split(\":\"), a = Buffer.from(h, \"hex\"), b = (0,crypto__WEBPACK_IMPORTED_MODULE_0__.scryptSync)(pw, salt, 64);\n    return a.length === b.length && (0,crypto__WEBPACK_IMPORTED_MODULE_0__.timingSafeEqual)(a, b);\n};\nconst sig = (p)=>(0,crypto__WEBPACK_IMPORTED_MODULE_0__.createHmac)(\"sha256\", secret()).update(p).digest(\"hex\");\nconst makeToken = (u)=>{\n    const p = Buffer.from(JSON.stringify({\n        uid: u.id,\n        name: u.name,\n        role: u.role,\n        exp: Date.now() + 12 * 3600e3\n    })).toString(\"base64url\");\n    return p + \".\" + sig(p);\n};\nconst readToken = (t)=>{\n    try {\n        const [p, s] = (t || \"\").split(\".\");\n        if (!p || s !== sig(p)) return null;\n        const d = JSON.parse(Buffer.from(p, \"base64url\").toString());\n        return d.exp > Date.now() ? d : null;\n    } catch  {\n        return null;\n    }\n};\nconst currentUser = async ()=>readToken((await (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)()).get(\"session\")?.value);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc2Vzc2lvbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUE4RTtBQUN2QztBQUN2QyxNQUFNSyxTQUFTLElBQU1DLFFBQVFDLEdBQUcsQ0FBQ0MsV0FBVyxJQUFJO0FBQ3pDLE1BQU1DLFNBQVMsQ0FBQ0M7SUFBUyxNQUFNQyxPQUFPVCxtREFBV0EsQ0FBQyxJQUFJVSxRQUFRLENBQUM7SUFBUSxPQUFPRCxPQUFPLE1BQU1WLGtEQUFVQSxDQUFDUyxJQUFJQyxNQUFNLElBQUlDLFFBQVEsQ0FBQztBQUFRLEVBQUU7QUFDdkksTUFBTUMsVUFBVSxDQUFDSCxJQUFJSTtJQUMxQixJQUFJLENBQUNBLFFBQVEsT0FBTztJQUNwQixNQUFNLENBQUNILE1BQU1JLEVBQUUsR0FBR0QsT0FBT0UsS0FBSyxDQUFDLE1BQU1DLElBQUlDLE9BQU9DLElBQUksQ0FBQ0osR0FBRyxRQUFRSyxJQUFJbkIsa0RBQVVBLENBQUNTLElBQUlDLE1BQU07SUFDekYsT0FBT00sRUFBRUksTUFBTSxLQUFLRCxFQUFFQyxNQUFNLElBQUlsQix1REFBZUEsQ0FBQ2MsR0FBR0c7QUFDckQsRUFBRTtBQUNGLE1BQU1FLE1BQU0sQ0FBQ0MsSUFBTXZCLGtEQUFVQSxDQUFDLFVBQVVLLFVBQVVtQixNQUFNLENBQUNELEdBQUdFLE1BQU0sQ0FBQztBQUM1RCxNQUFNQyxZQUFZLENBQUNDO0lBQ3hCLE1BQU1KLElBQUlMLE9BQU9DLElBQUksQ0FBQ1MsS0FBS0MsU0FBUyxDQUFDO1FBQUVDLEtBQUtILEVBQUVJLEVBQUU7UUFBRUMsTUFBTUwsRUFBRUssSUFBSTtRQUFFQyxNQUFNTixFQUFFTSxJQUFJO1FBQUVDLEtBQUtDLEtBQUtDLEdBQUcsS0FBSyxLQUFLO0lBQU8sSUFBSXhCLFFBQVEsQ0FBQztJQUN6SCxPQUFPVyxJQUFJLE1BQU1ELElBQUlDO0FBQ3ZCLEVBQUU7QUFDSyxNQUFNYyxZQUFZLENBQUNDO0lBQ3hCLElBQUk7UUFBRSxNQUFNLENBQUNmLEdBQUdnQixFQUFFLEdBQUcsQ0FBQ0QsS0FBSyxFQUFDLEVBQUd0QixLQUFLLENBQUM7UUFBTSxJQUFJLENBQUNPLEtBQUtnQixNQUFNakIsSUFBSUMsSUFBSSxPQUFPO1FBQ3hFLE1BQU1pQixJQUFJWixLQUFLYSxLQUFLLENBQUN2QixPQUFPQyxJQUFJLENBQUNJLEdBQUcsYUFBYVgsUUFBUTtRQUFLLE9BQU80QixFQUFFTixHQUFHLEdBQUdDLEtBQUtDLEdBQUcsS0FBS0ksSUFBSTtJQUFNLEVBQUUsT0FBTTtRQUFFLE9BQU87SUFBTTtBQUMvSCxFQUFFO0FBQ0ssTUFBTUUsY0FBYyxVQUFZTCxVQUFVLENBQUMsTUFBTWpDLHFEQUFPQSxFQUFDLEVBQUd1QyxHQUFHLENBQUMsWUFBWUMsT0FBTyIsInNvdXJjZXMiOlsid2VicGFjazovL2ZhbGNvbi1wb3MvLi9saWIvc2Vzc2lvbi5qcz9mZjljIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUhtYWMsIHNjcnlwdFN5bmMsIHJhbmRvbUJ5dGVzLCB0aW1pbmdTYWZlRXF1YWwgfSBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgY29va2llcyB9IGZyb20gJ25leHQvaGVhZGVycyc7XG5jb25zdCBzZWNyZXQgPSAoKSA9PiBwcm9jZXNzLmVudi5BVVRIX1NFQ1JFVCB8fCAnY2hhbmdlLXRoaXMtc2VjcmV0JztcbmV4cG9ydCBjb25zdCBoYXNoUHcgPSAocHcpID0+IHsgY29uc3Qgc2FsdCA9IHJhbmRvbUJ5dGVzKDE2KS50b1N0cmluZygnaGV4Jyk7IHJldHVybiBzYWx0ICsgJzonICsgc2NyeXB0U3luYyhwdywgc2FsdCwgNjQpLnRvU3RyaW5nKCdoZXgnKTsgfTtcbmV4cG9ydCBjb25zdCBjaGVja1B3ID0gKHB3LCBzdG9yZWQpID0+IHtcbiAgaWYgKCFzdG9yZWQpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgW3NhbHQsIGhdID0gc3RvcmVkLnNwbGl0KCc6JyksIGEgPSBCdWZmZXIuZnJvbShoLCAnaGV4JyksIGIgPSBzY3J5cHRTeW5jKHB3LCBzYWx0LCA2NCk7XG4gIHJldHVybiBhLmxlbmd0aCA9PT0gYi5sZW5ndGggJiYgdGltaW5nU2FmZUVxdWFsKGEsIGIpO1xufTtcbmNvbnN0IHNpZyA9IChwKSA9PiBjcmVhdGVIbWFjKCdzaGEyNTYnLCBzZWNyZXQoKSkudXBkYXRlKHApLmRpZ2VzdCgnaGV4Jyk7XG5leHBvcnQgY29uc3QgbWFrZVRva2VuID0gKHUpID0+IHtcbiAgY29uc3QgcCA9IEJ1ZmZlci5mcm9tKEpTT04uc3RyaW5naWZ5KHsgdWlkOiB1LmlkLCBuYW1lOiB1Lm5hbWUsIHJvbGU6IHUucm9sZSwgZXhwOiBEYXRlLm5vdygpICsgMTIgKiAzNjAwZTMgfSkpLnRvU3RyaW5nKCdiYXNlNjR1cmwnKTtcbiAgcmV0dXJuIHAgKyAnLicgKyBzaWcocCk7XG59O1xuZXhwb3J0IGNvbnN0IHJlYWRUb2tlbiA9ICh0KSA9PiB7XG4gIHRyeSB7IGNvbnN0IFtwLCBzXSA9ICh0IHx8ICcnKS5zcGxpdCgnLicpOyBpZiAoIXAgfHwgcyAhPT0gc2lnKHApKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBkID0gSlNPTi5wYXJzZShCdWZmZXIuZnJvbShwLCAnYmFzZTY0dXJsJykudG9TdHJpbmcoKSk7IHJldHVybiBkLmV4cCA+IERhdGUubm93KCkgPyBkIDogbnVsbDsgfSBjYXRjaCB7IHJldHVybiBudWxsOyB9XG59O1xuZXhwb3J0IGNvbnN0IGN1cnJlbnRVc2VyID0gYXN5bmMgKCkgPT4gcmVhZFRva2VuKChhd2FpdCBjb29raWVzKCkpLmdldCgnc2Vzc2lvbicpPy52YWx1ZSk7XG4iXSwibmFtZXMiOlsiY3JlYXRlSG1hYyIsInNjcnlwdFN5bmMiLCJyYW5kb21CeXRlcyIsInRpbWluZ1NhZmVFcXVhbCIsImNvb2tpZXMiLCJzZWNyZXQiLCJwcm9jZXNzIiwiZW52IiwiQVVUSF9TRUNSRVQiLCJoYXNoUHciLCJwdyIsInNhbHQiLCJ0b1N0cmluZyIsImNoZWNrUHciLCJzdG9yZWQiLCJoIiwic3BsaXQiLCJhIiwiQnVmZmVyIiwiZnJvbSIsImIiLCJsZW5ndGgiLCJzaWciLCJwIiwidXBkYXRlIiwiZGlnZXN0IiwibWFrZVRva2VuIiwidSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ1aWQiLCJpZCIsIm5hbWUiLCJyb2xlIiwiZXhwIiwiRGF0ZSIsIm5vdyIsInJlYWRUb2tlbiIsInQiLCJzIiwiZCIsInBhcnNlIiwiY3VycmVudFVzZXIiLCJnZXQiLCJ2YWx1ZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/session.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.js&appDir=%2Fworkspaces%2Fvscode%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2Fvscode&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();