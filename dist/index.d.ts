export declare class APIToken {
    access_token: string;
    token_type: string;
    refresh_token: string;
    constructor(data?: any);
    setToken(data: any): void;
    hasToken(): boolean;
    getHeader(): any;
}
export declare class APIClient {
    private routes;
    private token;
    private commonHeaders;
    private commonConfigs;
    private hasFile;
    private transformFns;
    private typeTransformFns;
    constructor(routes?: Record<string, string>);
    setRoutes(routes: Record<string, string>): void;
    private getHeaders;
    setToken(token: any): void;
    setConfig(key: string, val: any): void;
    private flatten;
    private transformPayload;
    private ajax;
    withTransform(transformFn: Function): APIClient;
    withTypeTransform(path: string, fn: Function): APIClient;
    getRequest(name: string, requestParams?: any, queryParams?: any): Promise<any>;
    withFile(): APIClient;
    postRequest(name: string, payload: any, requestParams?: any, queryParams?: any): Promise<any>;
    putRequest(name: string, payload: any, requestParams?: any, queryParams?: any): Promise<any>;
    patchRequest(name: string, payload: any, requestParams?: any, queryParams?: any): Promise<any>;
    deleteRequest(name: string, payload: any, requestParams?: any, queryParams?: any): Promise<any>;
    headRequest(name: string, requestParams?: any, queryParams?: any): Promise<any>;
}
export default APIClient;
