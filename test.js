// INHERITANCE WITH PRIVATE DATA -- proof of concept
// by Christiaan Janssen
// LICENSE: you can use this code however you want, include it in your projects, and put any license you want to
// even without mentioning me, BUT you can't prevent other developers to do the same (that is, use this code as well)

// Problem:
// As I work on my own projects, my code turns into spaghetti
// All my classes' data is public and cross-referenced
// Declarations and definitions are mixed together
// Refactoring becomes hard: I haven't found any tool/editor that lets me browse through it easily
// I end up using text search a lot, which is unefficient
// Therefore I've come up with this pattern

// Each class begins with a list of definitions of its public methods
// the format is:
// this.methodName = function( methodParams ) {}
// one line per method, all put together at the beginning

// then there's the public data (members)

// then the implementations of the public methods, which means redefining them
// this way, I can quickly see all the public methods put together, for easy referencing
// the details come later

// then the private data:
// I define a scoped variable called "priv"
// The pattern requires the definition of a public method "registerInstance", a one liner:
// this.registerInstance = function( instance ) { priv.instance = instance; }

// afterwards, I can append methods and members to the private data
// the private data is only visible from the class where it's defined, not subclasses or external classes

// finally, the constructor
// it can be written as-is, or declared as a public method and then called
// a requirement is that the constructor MUST call the initialization method (which will be automatically defined)
// this.__initialize__();
// you have to call initialize even if you don't have any private data


// RESULT:
// I have written an example using this pattern.  Check the calls made in main(), and compare the output

// USAGE:
// all public methods must be prepended with "this."
// all private methods must be prepended with "priv."
// you can call a public method from another public method by prepending "this."
// you can call a private method from a public method by prepending "priv."
// you can call a public method from a private method by prepending "priv.instance."
// you can call a private method from another private method by prepending "priv."
// you can also refer to public and/or private data using the same pattern
// only global methods can be called "naked"
// this way, you can quickly find errors when browsing the code
// public data accessed by public or private methods will always be relative to the instantiated class
// (that is, the one passed to the "new" operator)

// BUGS:
// in this example, the instance of Father cannot access this.m_2
// which means, public members from superclasses cannot be directly accessed as if they were local public members
// possible workaround: avoid using public members altogether, use accessors (getters/setters) instead
// and put all the data in the private class whenever possible


// helper functions
var SuperClass = function() {
	this.__initialize__ = function() {
		var classInHierarchy = this;
		while (classInHierarchy) {
			if (classInHierarchy.registerInstance != undefined)
				classInHierarchy.registerInstance(this);
			classInHierarchy = classInHierarchy.__proto__;
		}
	}
}

function ROOTCLASS( constructor ) {
	constructor.prototype = new SuperClass;
	return constructor;
}

function SUBCLASS( BASECLASS, constructor ) {
	constructor.prototype = new BASECLASS;
	return constructor;
}


// example
///////////////////////////////////////
var GrandDad = ROOTCLASS( function(constructorParam1, constructorParam2) {
	// public API
	
	// methods
	this.publicMethod1 = function() {}
	this.publicMethod2 = function( param ) {}
	this.publicMethod3 = function() {}
	
	//  members
	this.m_1 = "granddad public data";
	
	//****************************************************************+
	// public implementations
	this.publicMethod1 = function() {
		console.log("public method 1");
		priv.privateMethod1();
	}
	
	this.publicMethod2 = function( param ) {
		console.log("public method 2");
		console.log(param);
	}
	
	this.publicMethod3 = function() {
		console.log("public method 3");
	}
	
	// private data
	var priv = {}
	this.registerInstance = function( instance ) { priv.instance = instance; }
	
	priv.privateMethod1 = function() {
		console.log("private method 1");

		// example: call another private method
		priv.privateMethod2();
		
		// example: call public method with private data
		priv.instance.publicMethod2( priv.data1 );
		
		// example: call public method with public data
		priv.instance.publicMethod2( priv.instance.m_1 );
	}
	
	priv.privateMethod2 = function() {
		console.log("private method 2");
	}
	
	priv.data1 = "private data";
	
	
	// construction
	this.__initialize__();
	// do something with constructionParam1
	this.m_2 = constructorParam1;
	
	// do something with constructionParam2
});

var Father = SUBCLASS(GrandDad, function(constructorParam1, constructorParam2) {
	// API
	
	// redefine methods
	this.publicMethod3 = function() {}
	
	// new public methods
	this.publicMethod4 = function() {}
	
	
	// change values of public data
	this.m_1 = "father public data"
	
	//*****************************************************************
	// implementations
	this.publicMethod3 = function() {
		console.log("public method 3 - reimpl");
		this.publicMethod4();
	}
	
	this.publicMethod4 = function() {
		console.log("public method 4 - new");
	}
	
	//
	// no private data
	//
	
	// construction
	this.__initialize__();
	// do something with constructionParam1
	// do something with constructionParam2
	
});

var Son = SUBCLASS(Father, function(constructorParam1, constructorParam2) {
	// API
	
	// public methods
	this.publicMethod4 = function() {}
	
	
	// change values of public data
	this.m_1 = "son public data"
	
	//*****************************************************************
	// implementations
	this.publicMethod4 = function() {
		console.log("public method 4 - reimpl");
		priv.privateMethod1();
	}
	
	// private data
	var priv = {}
	this.registerInstance = function(instance) { priv.instance = instance; }
	
	priv.privateMethod1 = function() {
		console.log("another private method 1");
	}
	
	priv.data1 = "son private data";
	
	
	// construction
	this.__initialize__();
	// do something with constructionParam1
	// do something with constructionParam2
	this.m_2 = constructorParam2;
	
});


function main() {
	console.log("********** granddad");
	try {
		var newInstance = new GrandDad("one", "two");
		try {
		newInstance.publicMethod1();
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod2("aaa");
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod3();
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod4();
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.m_1);
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.m_2);
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.priv.data1);
		} catch(err) { console.log("error "+err) }
	} catch(err) { console.log("error "+err) }
	
	console.log("********** father");
	try {
		newInstance = new Father("one", "two");
		try {
			newInstance.publicMethod1();
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod2("aaa");
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod3();
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod4();
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.m_1);
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.m_2);
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.priv.data1);
		} catch(err) { console.log("error "+err) }
	} catch(err) { console.log("error "+err) }
	
	console.log("********** son")
	try {
		newInstance = new Son("one", "two");
		try {
			newInstance.publicMethod1();
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod2("aaa");
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod3();
		} catch(err) { console.log("error "+err) }
		try {
			newInstance.publicMethod4();
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.m_1);
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.m_2);
		} catch(err) { console.log("error "+err) }
		try {
			console.log(newInstance.priv.data1);
		} catch(err) { console.log("error "+err) }
	} catch(err) { console.log("error "+err) }
}

/* RESULT:	 
********** granddad
public method 1
private method 1
private method 2
public method 2
private data
public method 2
granddad public data
public method 2
aaa
public method 3
error TypeError: newInstance.publicMethod4 is not a function
granddad public data
one
error TypeError: newInstance.priv is undefined
********** father
public method 1
private method 1
private method 2
public method 2
private data
public method 2
father public data
public method 2
aaa
public method 3 - reimpl
public method 4 - new
public method 4 - new
father public data
undefined
error TypeError: newInstance.priv is undefined
********** son
public method 1
private method 1
private method 2
public method 2
private data
public method 2
son public data
public method 2
aaa
public method 3 - reimpl
public method 4 - reimpl
another private method 1
public method 4 - reimpl
another private method 1
son public data
two
error TypeError: newInstance.priv is undefined

 */
