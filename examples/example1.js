"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var src_1 = require("../src");
var ExampleAPIClient = /** @class */ (function (_super) {
    __extends(ExampleAPIClient, _super);
    function ExampleAPIClient() {
        return _super.call(this, new src_1.APIRoutes({
            getusers: 'https://reqres.in/api/users',
            getauser: 'https://reqres.in/api/users/{id}'
        })) || this;
    }
    ExampleAPIClient.main = function () {
        var api = new ExampleAPIClient();
        api.getRequest('getusers', null, { page: 2 })
            .then(function (response) {
            var users = response.data.data; //.map((u:any)=>u);
            console.log(users[1].first_name);
        })["catch"](function (e) {
            console.log(e.responseJSON);
        });
        api.getRequest('getauser', { id: 2 })
            .then(function (response) {
            var user = response.data.data;
            console.log(user.first_name);
        })["catch"](function (e) {
            console.log(e.responseJSON);
        });
    };
    return ExampleAPIClient;
}(src_1.APIClient));
ExampleAPIClient.main();
