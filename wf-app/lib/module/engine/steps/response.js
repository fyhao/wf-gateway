module.exports = {
	
	process : function(ctx, step, next) {
		var action = step.action;
                if(action != null && action != '') {
                        if(action == 'setHeader') {
                                ctx.res.set(step.key, step.value);
                                process.nextTick(next);
                        }
                        else if(action == 'getHeader') {
                                ctx.vars[step.var] = ctx.res.get(step.key);
                                process.nextTick(next);
                        }
                        else if(action == 'streamAudioFile') {
                                var fs = require('fs');
                                var filePath = step.path;
                                var contentType = step.contentType || 'audio/mpeg';
                                ctx.res.set('Content-Type', contentType);
                                fs.readFile(filePath, function(err, data) {
                                        if(!err) {
                                                ctx.res.end(data, 'binary');
                                        } else {
                                                ctx.res.statusCode = 500;
                                                ctx.res.end();
                                        }
                                        process.nextTick(next);
                                });
                        }
                        else {
                                process.nextTick(next);
                        }
                } else {
                        ctx.res.end(step.body);
                        process.nextTick(next);
                }
        }
}