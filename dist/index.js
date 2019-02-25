"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var APIRoutes = (function () {
    function APIRoutes(data) {
        if (data === void 0) { data = {}; }
        this.routes = data;
    }
    APIRoutes.prototype.get = function (key, params) {
        if (params)
            return this.routes[key].replace(/\{([a-zA-Z0-9_]*)\}/g, function (match) {
                return params[match.substr(1, match.length - 2)];
            });
        else
            return this.routes[key];
    };
    APIRoutes.prototype.set = function (key, val) {
        this.routes[key] = val;
    };
    return APIRoutes;
}());
var APIToken = (function () {
    function APIToken(data) {
        this.access_token = '';
        this.token_type = '';
        this.refresh_token = '';
        if (data)
            this.setToken(data);
    }
    APIToken.prototype.setToken = function (data) {
        if (typeof data == 'string')
            this.access_token = data;
        else if (data.token)
            this.access_token = data.token;
        else {
            this.access_token = data.access_token;
            this.token_type = data.token_type;
            this.refresh_token = data.refresh_token;
        }
    };
    APIToken.prototype.hasToken = function () {
        return this.access_token != '';
    };
    APIToken.prototype.getHeader = function () {
        if (this.access_token) {
            if (this.token_type == 'jwt')
                return { Authorization: 'JWT ' + this.access_token };
            else
                return { Authorization: 'Bearer ' + this.access_token };
        }
        else
            return {};
    };
    return APIToken;
}());
exports.APIToken = APIToken;
var APIClient = (function () {
    function APIClient(routes) {
        this.hasFile = false;
        this.routes = new APIRoutes(routes ? routes : {});
        this.token = new APIToken();
        this.commonHeaders = {};
        this.commonConfigs = {};
        this.transformFns = [];
        this.typeTransformFns = {};
    }
    APIClient.prototype.setRoutes = function (routes) {
        this.routes = new APIRoutes(routes);
    };
    APIClient.prototype.getHeaders = function (multipart) {
        if (multipart === void 0) { multipart = false; }
        var headers = __assign({}, this.commonHeaders, this.token.getHeader());
        if (multipart)
            headers['Content-Type'] = 'multipart/form-data';
        return headers;
    };
    APIClient.prototype.setToken = function (token) {
        this.token.setToken(token);
    };
    APIClient.prototype.setConfig = function (key, val) {
        this.commonConfigs[key] = val;
    };
    APIClient.prototype.flatten = function (obj) {
        var f_obj = {};
        for (var key in obj) {
            var item = obj[key];
            if (item instanceof Date || item instanceof File) {
                f_obj[key] = item;
            }
            else if (item instanceof Array) {
                for (var i = 0; i < item.length; i++) {
                    var result = this.flatten(item);
                    for (var k in result)
                        f_obj[key + "[" + i + "][" + k + "]"] = result[k];
                }
            }
            else if (typeof item == "object") {
                var result = this.flatten(item);
                for (var k in result)
                    f_obj[key + "[" + k + "]"] = result[k];
            }
            else
                f_obj[key] = item;
        }
        return f_obj;
    };
    APIClient.prototype.transformPayload = function (payload) {
        if (this.hasFile) {
            var fd = new FormData();
            var flatJson = this.flatten(payload);
            for (var key in flatJson)
                fd.append(key, flatJson[key]);
            return fd;
        }
        else
            return payload;
    };
    APIClient.prototype.ajax = function (reqObj) {
        if (Object.keys(this.typeTransformFns).length > 0) {
            if (this.hasFile) {
                for (var key in this.typeTransformFns) {
                    if (key.indexOf(".") >= 0) {
                        var k = key.replace(/\./, function (m) { return '['; }).replace(/\./g, function (m) { return ']['; }) + ']';
                        if (reqObj.data.has(k))
                            reqObj.data.set(k, this.typeTransformFns[key](reqObj.data.get(k)));
                    }
                    else {
                        reqObj.data.set(key, this.typeTransformFns[key](reqObj.data.get(key)));
                    }
                }
            }
            else {
            }
        }
        if (this.transformFns.length > 0)
            reqObj = __assign({}, reqObj, { transformRequest: this.transformFns });
        this.hasFile = false;
        this.transformFns = [];
        this.typeTransformFns = {};
        return axios_1.default(reqObj);
    };
    APIClient.prototype.withTransform = function (transformFn) {
        this.transformFns.push(transformFn);
        return this;
    };
    APIClient.prototype.withTypeTransform = function (path, fn) {
        this.typeTransformFns[path] = fn;
        return this;
    };
    APIClient.prototype.getRequest = function (name, requestParams, queryParams) {
        if (requestParams === void 0) { requestParams = {}; }
        var requestObj = __assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'GET', headers: this.getHeaders() });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    };
    APIClient.prototype.withFile = function () {
        this.hasFile = true;
        return this;
    };
    APIClient.prototype.postRequest = function (name, payload, requestParams, queryParams) {
        if (requestParams === void 0) { requestParams = {}; }
        var _payload = this.transformPayload(payload);
        var requestObj = __assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'POST', data: _payload, headers: this.getHeaders(_payload instanceof FormData) });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    };
    APIClient.prototype.putRequest = function (name, payload, requestParams, queryParams) {
        if (requestParams === void 0) { requestParams = {}; }
        var _payload = this.transformPayload(payload);
        var requestObj = __assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'PUT', data: _payload, headers: this.getHeaders(_payload instanceof FormData) });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    };
    APIClient.prototype.patchRequest = function (name, payload, requestParams, queryParams) {
        if (requestParams === void 0) { requestParams = {}; }
        var _payload = this.transformPayload(payload);
        var requestObj = __assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'PATCH', data: _payload, headers: this.getHeaders(_payload instanceof FormData) });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    };
    APIClient.prototype.deleteRequest = function (name, payload, requestParams, queryParams) {
        if (requestParams === void 0) { requestParams = {}; }
        var _payload = this.transformPayload(payload);
        var requestObj = __assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'DELETE', data: _payload, headers: this.getHeaders(_payload instanceof FormData) });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    };
    APIClient.prototype.headRequest = function (name, requestParams, queryParams) {
        if (requestParams === void 0) { requestParams = {}; }
        var requestObj = __assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'HEAD', headers: this.getHeaders() });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    };
    return APIClient;
}());
exports.APIClient = APIClient;
exports.default = APIClient;
