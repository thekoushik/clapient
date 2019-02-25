import {APIClient,APIRoutes} from '../src';

interface User{
    id:number;
    first_name:string;
    last_name:string;
}

class ExampleAPIClient extends APIClient{
    constructor(){
        super(new APIRoutes({
            getusers:'https://reqres.in/api/users',
            getauser:'https://reqres.in/api/users/{id}'
        }));
    }
    public static main(){
        let api=new ExampleAPIClient();
        api.getRequest('getusers',null,{page:2})
        .then((response)=>{
            let users:User[]=response.data.data;
            console.log(users[1].first_name);
        })
        .catch((e)=>{
            console.log(e.responseJSON)
        });
        api.getRequest('getauser',{id:2})
        .then((response)=>{
            let user:User=response.data.data;
            console.log(user.first_name);
        })
        .catch((e)=>{
            console.log(e.responseJSON)
        });
    }
}
ExampleAPIClient.main();