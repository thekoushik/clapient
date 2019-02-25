import axios from 'axios';

export class APIRoutes{
    private routes:any;
    constructor(data:any={}){
        this.routes=data;
    }
    get(key:string,params?:any):string{
        if(params)
            return this.routes[key].replace(/\{([a-zA-Z0-9_]*)\}/g,(match:string)=>{
                return params[match.substr(1,match.length-2)];
            });
        else
            return this.routes[key];
    }
    set(key:string,val:string){
        this.routes[key]=val;
    }
}
export class APIToken{
    access_token:string='';
    token_type:string='';
    refresh_token:string='';
    constructor(data?:any){
        if(data)
            this.setToken(data);
    }
    setToken(data:any):void{
        if(typeof data=='string')
            this.access_token=data;
        else if(data.token)
            this.access_token=data.token;
        else{
            this.access_token=data.access_token;
            this.token_type=data.token_type;
            this.refresh_token=data.refresh_token;
        }
    }
    hasToken():boolean{
        return this.access_token!='';
    }
    getHeader():any{
        if(this.access_token){
            if(this.token_type=='jwt')
                return {Authorization:'JWT '+this.access_token};
            else
                return {Authorization: 'Bearer '+this.access_token};
        }else
            return {};
    }
}
export class APIClient{
    private routes:APIRoutes;
    private token:APIToken;
    private commonHeaders:any;
    private commonConfigs:any;
    private hasFile:boolean=false;
    private transformFns:Array<Function>;
    private typeTransformFns:any;
    constructor(routes:APIRoutes){
        this.routes=routes;
        this.token=new APIToken();
        this.commonHeaders={};
        this.commonConfigs={};
        this.transformFns=[];
        this.typeTransformFns={};
    }
    setRoutes(routes:APIRoutes):void{
        this.routes=routes;
    }
    private getHeaders(multipart:boolean=false):any{
        let headers:any={
            ...this.commonHeaders,
            ...this.token.getHeader()
        };
        if(multipart)
            headers['Content-Type']='multipart/form-data';
        return headers;
    }
    setToken(token:any):void{
        this.token.setToken(token);
    }
    setConfig(key:string,val:any):void{
        this.commonConfigs[key]=val;
    }
    private flatten(obj:any):any{
        var f_obj:any = {};
        for (var key in obj) {
            var item = obj[key]
            if(item instanceof Date || item instanceof File){
                f_obj[key] = item;
            }else if(item instanceof Array){
                for(let i=0;i<item.length;i++){
                    var result = this.flatten(item)
                    for (var k in result)
                        f_obj[key + "[" + i + "][" + k + "]"] = result[k]
                }
            }else if (typeof item == "object") {
                var result = this.flatten(item)
                for (var k in result)
                    f_obj[key + "[" + k + "]"] = result[k]
            }else
                f_obj[key] = item
        }
        return f_obj;
    }
    private transformPayload(payload:any):any{
        if(this.hasFile){
            let fd=new FormData();
            let flatJson=this.flatten(payload);
            for(let key in flatJson)
                fd.append(key,flatJson[key]);
            return fd;
        }else
            return payload;
    }
    private ajax(reqObj:any):Promise<any>{
        if(Object.keys(this.typeTransformFns).length>0){
            if(this.hasFile){
                for(let key in this.typeTransformFns){
                    if(key.indexOf(".")>=0){
                        let k:string=key.replace(/\./,function(m){return '['}).replace(/\./g,function(m){return ']['})+']';
                        if(reqObj.data.has(k))
                            reqObj.data.set(k,this.typeTransformFns[key](reqObj.data.get(k)))
                    }else{
                        reqObj.data.set(key,this.typeTransformFns[key](reqObj.data.get(key)));
                    }
                }
            }else{
                //change nested json keys
            }
        }
        if(this.transformFns.length>0)
            reqObj={...reqObj,transformRequest:this.transformFns};
        //common reset
        this.hasFile=false;
        this.transformFns=[];
        this.typeTransformFns={};
        //call ajax
        return axios(reqObj);
    }
    withTransform(transformFn:Function):APIClient{
        this.transformFns.push(transformFn);
        return this;
    }
    withTypeTransform(path:string,fn:Function):APIClient{
        this.typeTransformFns[path]=fn;
        return this;
    }
    getRequest(name:string,requestParams:any={},queryParams?:any):Promise<any>{
        var requestObj={
            ...this.commonConfigs,
            url:this.routes.get(name,requestParams),
            method:'GET',
            headers:this.getHeaders()
        };
        if(queryParams) requestObj.params=queryParams;
        return this.ajax(requestObj);
    }
    withFile():APIClient{
        this.hasFile=true;
        return this;
    }
    postRequest(name:string,payload:any,requestParams:any={},queryParams?:any):Promise<any>{
        var _payload=this.transformPayload(payload);
        var requestObj={
            ...this.commonConfigs,
            url:this.routes.get(name,requestParams),
            method:'POST',
            data:_payload,
            headers:this.getHeaders(_payload instanceof FormData),
        };
        if(queryParams) requestObj.params=queryParams;
        return this.ajax(requestObj);
    }
    putRequest(name:string,payload:any,requestParams:any={},queryParams?:any):Promise<any>{
        var _payload=this.transformPayload(payload);
        var requestObj={
            ...this.commonConfigs,
            url:this.routes.get(name,requestParams),
            method:'PUT',
            data:_payload,
            headers:this.getHeaders(_payload instanceof FormData),
        };
        if(queryParams) requestObj.params=queryParams;
        return this.ajax(requestObj);
    }
    patchRequest(name:string,payload:any,requestParams:any={},queryParams?:any):Promise<any>{
        var _payload=this.transformPayload(payload);
        var requestObj={
            ...this.commonConfigs,
            url:this.routes.get(name,requestParams),
            method:'PATCH',
            data:_payload,
            headers:this.getHeaders(_payload instanceof FormData),
        };
        if(queryParams) requestObj.params=queryParams;
        return this.ajax(requestObj);
    }
    deleteRequest(name:string,payload:any,requestParams:any={},queryParams?:any):Promise<any>{
        var _payload=this.transformPayload(payload);
        var requestObj={
            ...this.commonConfigs,
            url:this.routes.get(name,requestParams),
            method:'DELETE',
            data:_payload,
            headers:this.getHeaders(_payload instanceof FormData),
        };
        if(queryParams) requestObj.params=queryParams;
        return this.ajax(requestObj);
    }
    headRequest(name:string,requestParams:any={},queryParams?:any):Promise<any>{
        var requestObj={
            ...this.commonConfigs,
            url:this.routes.get(name,requestParams),
            method:'HEAD',
            headers:this.getHeaders(),
        };
        if(queryParams) requestObj.params=queryParams;
        return this.ajax(requestObj);
    }
}
export default APIClient;