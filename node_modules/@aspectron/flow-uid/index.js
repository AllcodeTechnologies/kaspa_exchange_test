const uid = (typeof vertx !== 'undefined' && vertx !== null) ? require("./lib/vertx-uid") : require("./lib/uid");
module.exports = uid;