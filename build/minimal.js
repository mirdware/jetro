/**
 * A short simple selector engine
 * Never use descendants and only use id, tag, tag.class, or .class
 */

(function( window ) {
var document = window.document;

var rclass = /[\n\t\r]/g,
    rcomma = /[\s*]?,[\s*]?/,
    rnocomma = /[^,]/,
    rid = /#([\w\-]+)/,
    rtag = /^([\w\-]+)$/,
    rtagclass = /^([\w]+)?\.([\w\-]+)$/;

var r, i, len;
var toArray = function( list ) {
    r = [];
    // IE can't slice a nodelist
    for ( i = 0, len = list.length; i < len; i++ ) {
        r[ i ] = list[ i ];
    }
    return r;
};

var hasClass = function( node, classStr ) {
    return node && classStr &&
        !!~(' ' + node.className + ' ').replace(rclass, ' ').indexOf( ' ' + classStr + ' ' );
};

/**
 * @param {String} selector The selector string in which to match elements against
 * @param {Element|String|null} root Either the owner document for the selection, an id, or null
 * @return {Array} Returns the matched elements in array form (not nodelist)
 */
var queryAll = function( selector, root ) {
	root = typeof root === 'string' ? queryAll(root)[0] : (root || document);

	if ( !selector || !root ) {
		return [];
	}

	if ( typeof selector !== 'string') {
		return toArray( selector );
	}

	var match, elem, ret;

	// ID
	if ( match = rid.exec(selector) ) {
		return ( elem = root.getElementById(match[ 1 ]) ) ? [ elem ] : [];

	// Tag
	} else if ( match = rtag.exec(selector) ) {
		return toArray( root.getElementsByTagName(match[ 1 ]) );

	// Class
	} else if ( match = rtagclass.exec(selector) ) {
		if ( !match[ 1 ] && 'getElementsByClassName' in root ) {
			return toArray( root.getElementsByClassName(match[ 2 ]) );

		} else if ( 'querySelectorAll' in root ) {
			return toArray( root.querySelectorAll( selector ) );

		} else {
			var tags = root.getElementsByTagName(match[ 1 ] || '*');
			ret = [];
			for ( var node, j = 0, cls = match[ 2 ]; node = tags[j]; j++ ) {
				if ( hasClass( node, cls ) ) {
					ret.push( node );
				}
			}
			return ret;
		}
	} else {
		ret = [];
		selector = selector.split( rcomma );
		for ( var i = 0; sel = selector[ i ]; i++ ) {
			ret = ret.concat( queryAll( sel, root ) );
		}
		return ret;
	}
};

/**
 * Retrieves the first of the matched set in a query
 */
var query = function( selector, root ) {
	return queryAll( selector, root )[0];
};



window.queryAll = queryAll;
window.query = query;

})( this );