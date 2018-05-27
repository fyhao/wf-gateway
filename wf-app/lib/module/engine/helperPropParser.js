

var propParser = function(ctx, c){
	if(typeof c == 'object') {
		for(var i in c) {
			c[i] = propParser(ctx, c[i]);
		}
	}
	else if(typeof c == 'string' && c.startsWith("%%") && c.endsWith("%%")) {
		var d = c.substring(2, c.length - 2);
		var arr = d.split(':');
		if(arr.length == 2) {
			var prefix = arr[0];
			if(prefix == 'prop') {
				var propKey = arr[1];
				if(typeof ctx.props != 'undefined' && typeof ctx.props[propKey] != 'undefined') {
					var prop = ctx.props[propKey];
					prop = propParser(ctx, prop);
					return prop;
				}
			}
		}
	}
	return c;
}



module.exports = {
	parse : function(ctx,c) {
		return propParser(ctx,c);
	}
};