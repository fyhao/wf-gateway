var mod = {
	list : function(req, res) {
		res.json(data)
	},
	create : function(req, res) {
		var item = {
			name : req.query.name
		};
		data.push(item);
		res.json({status:0});
	}
}
var data = [];
module.exports = mod;