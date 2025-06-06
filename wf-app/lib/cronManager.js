var cron = require('node-cron');
var jobs = [];

function clearJobs() {
    jobs.forEach(function(job){ job.stop(); });
    jobs = [];
}

function register(apps, triggerFn) {
    clearJobs();
    if(!apps) return;
    apps.forEach(function(appItem){
        if(appItem.status === 'enabled' && appItem.listeners) {
            appItem.listeners.forEach(function(appLi){
                if(appLi.type === 'cron' && appLi.expression) {
                    var job = cron.schedule(appLi.expression, function(){
                        triggerFn(appItem, appLi);
                    });
                    jobs.push(job);
                }
            });
        }
    });
}

module.exports = {
    register: register,
    clearJobs: clearJobs,
    _getJobs: function(){ return jobs; }
};
