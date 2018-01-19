### Transfer requests from public url to your localhost!

It's as simple as you may think:

```javascript

var transfer = require('transfer');

transfer.to('http://localhost:8080')
  .then(result => {
    console.log(result); 
    /* { id      : '2KFQNpM', 
         url     : 'http://2KFQNpM.transfer.pub', 
         pathUrl : 'http://path.transfer.pub/2KFQNpM' } */
  });

```

In order to stop listening for upcoming requests:

```javascript
  transfer.to('http://localhost:8080')
    .then(console.log);
  
  transfer.disconnect();
```

Note that this is the very first iteration, the communications are done through http protocole and not https. This will change very soon.
