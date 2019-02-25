# clapient
Create your API client in typescript with clapient.
> clapient uses **axios** as its HTTP client

## Why clapient?
While developing frontent for webapps(like Angular), we use normal http client library to send AJAX requests. The structure of the AJAX client is nothing but a class with some methods that corresponds to the API endpoints we use. Most of the time we do not care about these methods but it seriously jeopardize the future development because changing a small chunk of code generates a series of errors that we do not understand.

Here, clapient can provide not only a safer development practice but also leads to less erroneous AJAX calls to your API backend.

## Install
```bash
$ npm install clapient
```

## Concept
### APIClient
The **APIClient** class is used to define api client both by extending or instantiating.

#### Define Routes
Routes are basically object with **key**:**value** pair(in TypeScript's standard library, there is a type called Record) like following:
```typescript
{
    getusers: 'https://reqres.in/api/users',
    getauser: 'https://reqres.in/api/users/{id}'
}
```
> **Use curly braces for parameters in your request url.**

You can define routes via any of the following:
- Via **constructor**
- Via **setRoutes()** method

#### Request types
- `getRequest(name: string, requestParams?: any, queryParams?: any)`
- `postRequest(name: string, payload: any, requestParams?: any, queryParams?: any)`
- `putRequest(name: string, payload: any, requestParams?: any, queryParams?: any)`
- `patchRequest(name: string, payload: any, requestParams?: any, queryParams?: any)`
- `deleteRequest(name: string, payload: any, requestParams?: any, queryParams?: any)`
- `headRequest(name: string, requestParams?: any, queryParams?: any)`

#### Parameters
- name - Key name of a route.
- requestParams - Object with **key : value** pair. Example: ` { id: 2 } `
- queryParams - Similar to **requestParams**
- payload - JSON object to be sent.

> **Note:** when **withFile()** is used, FormData will be sent instead of normal json object.


## Usage
```typescript
import { APIClient } from 'clapient';

interface User{
    id: number;
    first_name: string;
    last_name: string;
}

let api: APIClient = new APIClient({
    getusers: 'https://reqres.in/api/users',
    getauser: 'https://reqres.in/api/users/{id}'
});

api
.getRequest('getusers', null, { page: 2 })//queryParams
.then((response)=>{
    let users: User[] = response.data.data;
    console.log(users[1].first_name);
})
.catch((e)=>{
    console.log(e.responseJSON)
});

api
.getRequest('getauser', { id: 2 })//requestParams
.then((response)=>{
    let user: User = response.data.data;
    console.log( user.first_name );
})
.catch((e)=>{
    console.log(e.responseJSON)
});
```

## File Upload
Use **withFile()** method to indicate that the content type of the following request will be *multipart/form-data*
```typescript
api
.withFile()
.postRequest('endpointX', {
    first_name: "Peter Parker",
    photo: yourfileobject
})
.then((response)=>{
    console.log( response.data );
})
.catch((e)=>{
    console.log(e.responseJSON)
});
```

## Transform data before sending
Use **withTypeTransform()** method to transform some specific value in the input json.
Example:
```typescript
api
.withTypeTransform('personal_details.info.dob', v =>moment(v).format('YYYY-MM-DD') )
.postRequest('save_user', data)
```