var assert = require("assert");
var Firebase = require("firebase");
var FirebaseWhere = require('../firebase-where');

const URL = 'https://rigidflame-demo.firebaseio.com/tests';

describe('firebaseWhere', function () {
    describe('#()', function () {
        it('should error when providing a non-ref', function (done) {
            assert.throws(FirebaseWhere.bind({}, "fail"), Error);
            done();
        });
    });
    
    describe('#child()', function () {
        it('should error with no location', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            assert.throws(firebaseWhere.child.bind(firebaseWhere), Error);
            done();
        });
        
        it('should succeed with a string location', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            var usersfirebaseWhere = firebaseWhere.child('users');
            assert.equal(usersfirebaseWhere.baseLocation, 'tests/users');
            done();
        });
        
        it('should succeed with a non-string location', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            var usersfirebaseWhere = firebaseWhere.child(1.43);
            assert.equal(usersfirebaseWhere.baseLocation, 'tests/1.43');
            done();
        });
    });
    
    describe('#setWithIndex()', function () {
        beforeEach(function(done){
            var ref = new Firebase(URL);
            ref.remove(done);
            ref.root().child('_index').remove();
        });
        afterEach(function(done){
            var ref = new Firebase(URL);
            ref.remove(done);
            ref.root().child('_index').remove();
        });
        
        it('should error with no location or value', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            assert.throws(firebaseWhere.setWithIndex.bind(firebaseWhere), Error);
            done();
        });

        it('should set without error', function (done) {
            var ref = new Firebase(URL);
            var firebaseWhere = new FirebaseWhere(ref);
            var location = 'user';
            var value = {username: 'abe', color: 'red'};
            firebaseWhere.child(location).setWithIndex(value);
            
            ref.child(location).once("value", function (snapshot) {
                assert.deepEqual(snapshot.val(), value);
                done();
            });
        });
        
        it('should not create indexes if value is an object', function (done) {
            var ref = new Firebase(URL);
            var firebaseWhere = new FirebaseWhere(ref);
            var location = 'users/abe';
            var value = "{username: 'abe', color: 'red'}";
            firebaseWhere.child(location).setWithIndex(value);
            ref.child('_index/').once("value", function (snapshot) {
                assert.equal(snapshot.val(), null);
                done();
            });
        });
        
        it('should create indexes if value is an object', function (done) {
            var ref = new Firebase(URL);
            var firebaseWhere = new FirebaseWhere(ref);
            var location = 'users/abe';
            var value = {username: 'abe', color: 'red'};
            firebaseWhere.child(location).setWithIndex(value);
            
            ref.root().child('_index/username/').child(value.username).once("child_added", function (snapshot) {
                assert.equal(snapshot.name(), 'tests-users-abe');
                ref.root().child('_index/color/').child(value.color).once("child_added", function (snapshot) {
                    assert.equal(snapshot.name(), 'tests-users-abe');
                    done();
                });
            });
        });
    });
    
    describe('#onWithQuery()', function () {
        beforeEach(function(done){
            var ref = new Firebase(URL);
            var firebaseWhere = new FirebaseWhere(ref);
            var count = 0;
            var finish = function () {
                count ++;
                if (count == 3) {
                    done();   
                }
            }
            ref.root().child('_index').remove();
            firebaseWhere.child('users/abe').setWithIndex({username: 'abe', color: 'red', town: 'sf'}, finish);
            firebaseWhere.child('users/joe').setWithIndex({username: 'joe', color: 'pink', town: 'bl'}, finish);
            firebaseWhere.child('users/jacki').setWithIndex({username: 'jacki', color: 'blue', town: 'bl'}, finish);
        });
        
        afterEach(function(done){
            var ref = new Firebase(URL);
            ref.root().child('_index').remove();
            ref.remove(done);
        });
        
        it('should error with less than four arguments', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            assert.throws(firebaseWhere.onWithQuery.bind(firebaseWhere), Error);
            done();
        });
        
        it('should error if callback is not a function', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            assert.throws(firebaseWhere.onWithQuery.bind(firebaseWhere, 'value', {}, 'fail'), Error);
            done();
        });

        it('should error if query is not an object', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            assert.throws(firebaseWhere.onWithQuery.bind(firebaseWhere, 'value', "", function () {}), Error);
            done();
        });
        
        it('should error if event is not string or not a valid event', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            assert.throws(firebaseWhere.onWithQuery.bind(firebaseWhere, 'fail', {}, function () {}), Error);
            done();
        });
        
        it('should return results for a valid query', function (done) {
            var firebaseWhere = new FirebaseWhere(new Firebase(URL));
            firebaseWhere.child('users').onWithQuery('child_added', {color: 'red', town: 'sf'}, function (snapshot) {
                assert.deepEqual(snapshot.val(), {username: 'abe', color: 'red', town: 'sf'});
                done();
            });
        });
    });
});