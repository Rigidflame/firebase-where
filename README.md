firebase-where (Experimental!)
==============

Ever wanted to search users, posts, or anything in a firebase with a "where" filter? So did we! That's why we made firebase-where. The easiest way to index and find your Firebase data. Oh, and it's pretty darn efficient at it too (only loads data which matches query and some indexing data)!

Example
-------

    // Create a normal ref
    var ref = new Firebase(URL);
    // Set up our where (which will write to /_index in your Firebase
    var firebaseWhere = new FirebaseWhere(ref);
    
    // Add some children
    firebaseWhere.child('users/abe').setWithIndex({username: 'abe', color: 'red', town: 'sf'});
    firebaseWhere.child('users/joe').setWithIndex({username: 'joe', color: 'pink', town: 'bl'});
    firebaseWhere.child('users/jacki').setWithIndex({username: 'jacki', color: 'pink', town: 'bl'});
    
    // Watch for users who are in BL and whose color is pink.
    firebaseWhere.onWithQuery("child_added", {town: 'bl', color: 'pink'}, function (snapshot) {
      console.log(snapshot.val()); // Will trigger for Joe and Jacki
    });
    
    // Adding more children
    firebaseWhere.child('users/nate').setWithIndex({username: 'nate', color: 'red', town: 'el'});    // Wont trigger event :(
    firebaseWhere.child('users/becki').setWithIndex({username: 'becki', color: 'pink', town: 'bl'}); // Will trigger event :)

Credits
-------

Although he did not directly work on firebase-where, all high-fives for this should go to [Michael Wulf](https://github.com/katowulf). Without his [FirebaseIndex](https://github.com/Zenovations/FirebaseIndex) and his/Firebase's [firebase-util](https://github.com/firebase/firebase-util) libraries, this would have been an exponentially larger project.

Development of this library is sponsored by [Rigidflame Consultants](http://www.rigidflame.com).
