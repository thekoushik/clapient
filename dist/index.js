"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class APIRoutes {
    constructor(data = {}) {
        this.routes = data;
    }
    get(key, params) {
        if (params)
            return this.routes[key].replace(/\{([a-zA-Z0-9_]*)\}/g, (match) => {
                return params[match.substr(1, match.length - 2)];
            });
        else
            return this.routes[key];
    }
    set(key, val) {
        this.routes[key] = val;
    }
}
exports.APIRoutes = APIRoutes;
class APIToken {
    constructor(data) {
        this.access_token = '';
        this.token_type = '';
        this.refresh_token = '';
        if (data)
            this.setToken(data);
    }
    setToken(data) {
        if (typeof data == 'string')
            this.access_token = data;
        else if (data.token)
            this.access_token = data.token;
        else {
            this.access_token = data.access_token;
            this.token_type = data.token_type;
            this.refresh_token = data.refresh_token;
        }
    }
    hasToken() {
        return this.access_token != '';
    }
    getHeader() {
        if (this.access_token) {
            if (this.token_type == 'jwt')
                return { Authorization: 'JWT ' + this.access_token };
            else
                return { Authorization: 'Bearer ' + this.access_token };
        }
        else
            return {};
    }
}
exports.APIToken = APIToken;
class APIClient {
    constructor(routes) {
        this.hasFile = false;
        this.routes = routes;
        this.token = new APIToken();
        this.commonHeaders = {};
        this.commonConfigs = {};
        this.transformFns = [];
        this.typeTransformFns = {};
    }
    setRoutes(routes) {
        this.routes = routes;
    }
    getHeaders(multipart = false) {
        let headers = Object.assign({}, this.commonHeaders, this.token.getHeader());
        if (multipart)
            headers['Content-Type'] = 'multipart/form-data';
        return headers;
    }
    setToken(token) {
        this.token.setToken(token);
    }
    setConfig(key, val) {
        this.commonConfigs[key] = val;
    }
    flatten(obj) {
        var f_obj = {};
        for (var key in obj) {
            var item = obj[key];
            if (item instanceof Date || item instanceof File) {
                f_obj[key] = item;
            }
            else if (item instanceof Array) {
                for (let i = 0; i < item.length; i++) {
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
    }
    transformPayload(payload) {
        if (this.hasFile) {
            let fd = new FormData();
            let flatJson = this.flatten(payload);
            for (let key in flatJson)
                fd.append(key, flatJson[key]);
            return fd;
        }
        else
            return payload;
    }
    ajax(reqObj) {
        if (Object.keys(this.typeTransformFns).length > 0) {
            if (this.hasFile) {
                for (let key in this.typeTransformFns) {
                    if (key.indexOf(".") >= 0) {
                        let k = key.replace(/\./, function (m) { return '['; }).replace(/\./g, function (m) { return ']['; }) + ']';
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
            reqObj = Object.assign({}, reqObj, { transformRequest: this.transformFns });
        this.hasFile = false;
        this.transformFns = [];
        this.typeTransformFns = {};
        return axios_1.default(reqObj);
    }
    withTransform(transformFn) {
        this.transformFns.push(transformFn);
        return this;
    }
    withTypeTransform(path, fn) {
        this.typeTransformFns[path] = fn;
        return this;
    }
    getRequest(name, requestParams = {}, queryParams) {
        var requestObj = Object.assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'GET', headers: this.getHeaders() });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    }
    withFile() {
        this.hasFile = true;
        return this;
    }
    postRequest(name, payload, requestParams = {}, queryParams) {
        var _payload = this.transformPayload(payload);
        var requestObj = Object.assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'POST', data: _payload, headers: this.getHeaders(_payload instanceof FormData) });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    }
    putRequest(name, payload, requestParams = {}, queryParams) {
        var _payload = this.transformPayload(payload);
        var requestObj = Object.assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'PUT', data: _payload, headers: this.getHeaders(_payload instanceof FormData) });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    }
    patchRequest(name, payload, requestParams = {}, queryParams) {
        var _payload = this.transformPayload(payload);
        var requestObj = Object.assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'PATCH', data: _payload, headers: this.getHeaders(_payload instanceof FormData) });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    }
    deleteRequest(name, payload, requestParams = {}, queryParams) {
        var _payload = this.transformPayload(payload);
        var requestObj = Object.assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'DELETE', data: _payload, headers: this.getHeaders(_payload instanceof FormData) });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    }
    headRequest(name, requestParams = {}, queryParams) {
        var requestObj = Object.assign({}, this.commonConfigs, { url: this.routes.get(name, requestParams), method: 'HEAD', headers: this.getHeaders() });
        if (queryParams)
            requestObj.params = queryParams;
        return this.ajax(requestObj);
    }
}
exports.APIClient = APIClient;
exports.default = APIClient;
