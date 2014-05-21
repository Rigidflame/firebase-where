/*global exports: true */

/*! Firebase-where - v0.1.0 - 2014-05-20
* https://github.com/rigidflame/firebase-where
* Copyright (c) 2014 Abe Haskins
* MIT LICENSE */

var Firebase = require('firebase');
var FirebaseUtil = require('./firebase-util.js');
var FirebaseIndex = require('./firebase-index.js').FirebaseIndex;

var FirebaseWhere = function (ref, baseLocation) {
    if (typeof ref !== 'object') throw new Error("ref must be a Firebase reference!");
    this.ref = ref.root();
    this.baseLocation = baseLocation || ref.path.m.join('/');
};

FirebaseWhere.prototype.child = function (location) {
    if (!location)
        throw new Error("child(location) required!");
    return new FirebaseWhere(this.ref, this.baseLocation + '/' + location.toString());
};

FirebaseWhere.prototype.setWithIndex = function (value, callback) {
    if (!value) 
        throw new Error("setWithIndex(location, value) required!");

    var locationRef = this.ref.child(this.baseLocation);

    if (typeof value == "object") {
        for (var key in value) {
            this.ref.child('_index')
                .child(key)
                .child(value[key])
                .child(locationRef.path.m.join('-'))
                .set(true);
        }
    }
    
    locationRef.set(value, callback);
};

FirebaseWhere.prototype.onWithQuery = function (event, query, callback) {
    var self = this;
    if (!event || !query || !callback) 
        throw new Error("onWithQuery(event, query, callback) required!");
    if (typeof event !== "string")
        throw new Error("evnet must be a string!");
    if (typeof query !== "object")
        throw new Error("query must be an object!");
    if (typeof callback !== "function")
        throw new Error("Callback must be function!");
    if (["child_added", "child_changed", "child_removed", "child_moved", "value"].indexOf(event) == -1)
        throw new Error("Event must be child_added, child_changed, child_removed, or value");
    
    var paths = [];
    
    for (var key in query) {
        var value = query[key];
        var keyRef = this.ref.child(['_index', key, value].join('/'));
        paths.push(keyRef);
    }

    if (paths.length > 1) {
        queryRef = FirebaseUtil.intersection(paths);
    }else{
        queryRef = paths[0];   
    }

    var index = new FirebaseIndex( queryRef, function (key) {
        var entryRef = self.ref.root().child(key.replace(/-/g, '/'));
        return entryRef
    });
    
    index.on(event, callback);
};

module.exports = FirebaseWhere;