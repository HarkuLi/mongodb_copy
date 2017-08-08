const MongoClient = require('mongodb').MongoClient;

/**
 * fill in databases of resource and destination and colleName
 */
const dbUrl_rsc;
const dbUrl_dst;
const colleName;

const getDb_rsc = MongoClient.connect(dbUrl_rsc);
const getDb_dst = MongoClient.connect(dbUrl_dst);

var db_r, db_d;
var colle_rsc, colle_dst;

getDb_rsc
  .then(db_rsc => {
    db_r = db_rsc;
    colle_rsc = db_rsc.collection(colleName);
    return getDb_dst;
  })
  .then(db_dst => {
    var stream;
    var promiseList = [];
    db_d = db_dst;
    colle_dst = db_dst.collection(colleName);
    stream = colle_rsc.find().stream();

    return new Promise((resolve, reject) => {
      stream.on("end", () => {
        Promise.all(promiseList).then(resolve());
      })

      stream.on("data", (data)=> {
        console.log("copy data......pattern: "+data.pattern);
        promiseList.push(colle_dst.insertOne(data));
      })
    })
  })
  .then(() => {
    db_r.close();
    db_d.close();
  });