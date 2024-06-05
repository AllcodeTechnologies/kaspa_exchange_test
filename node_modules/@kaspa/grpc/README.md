Kaspa gRPC interface
===

Kaspa gRPC module is a basic request/response wrapper for interfacing with [Kaspad](https://github.com/kaspanet/kaspad)

Usage
---
Clone the following repository:

    $ git clone https://github.com/aspectron/kaspa-grpc

Example
---
```js
const { Client } = require('@kaspa/grpc');

const client = new Client({
    host:"127.0.0.1:16210"
});
client.connect();
client.verbose = true;

try {
    let response = await client.call('getMempoolEntriesRequest', { });
    console.log(response);
} catch(ex) {
    ...
}

client.call('getVirtualSelectedParentBlueScoreRequest', { }).then((response)=>{
    console.log(response);
}).catch((err)=>{
    console.log('error:',err);
})
```