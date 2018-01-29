### Transfer requests from public url to your localhost!

![Transfer](https://api.travis-ci.org/Javascipt/transfer.svg)

It's as simple as you may think:

```javascript

var transfer = require('transfer');

transfer.to('http://localhost:8080')
  .then(result => {
    console.log(result); 
    /* { token      : '2KFQNpM', 
         url        : '2KFQNpM.transfer.pub', 
         pathUrl    : 'path.transfer.pub/2KFQNpM',
         protocols  : ['http', 'https'] } */
  });

```
Now all requests going to `https://2KFQNpM.transfer.pub` or `https://path.transfer.pub/2KFQNpM` are transferred to your localhost.

In order to stop listening for upcoming requests you can use `transfer.disconnect`:

```javascript
  transfer.to(8080) // Will transfer all requests to your port 8080
    .then(console.log);
  
  transfer.disconnect();
```