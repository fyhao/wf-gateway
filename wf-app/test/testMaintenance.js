const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
const LogStore=require('../lib/log-store').LogStore;
const balance=require('../lib/module/engine/steps/loadBalance');
describe('log collection and load balancing',function(){
  it('bounds, filters and restores persistent log rows',function(){
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wf-logs-'));
    try{
      const file=path.join(dir,'log.ndjson'),logs=new LogStore({file,limit:2});
      logs.append({app:'one',message:'first'});logs.append({app:'two',message:'second'});logs.append({app:'one',message:'third'});
      assert.deepEqual(logs.tail(100).map(r=>r.message),['second','third']);
      assert.deepEqual(logs.tail(100,'one').map(r=>r.message),['third']);
      assert.equal(logs.tail(-10).length,1);
      assert.equal(new LogStore({file,limit:2}).tail(10)[1].message,'third');
    }finally{fs.rmSync(dir,{recursive:true,force:true});}
  });
  it('alternates round-robin backends',function(done){
    const ctx={app:'balance-unit',vars:{}},step={backends:['http://one','http://two']};
    balance.process(ctx,step,()=>{assert.equal(ctx.vars.backend,'http://one');balance.process(ctx,step,()=>{assert.equal(ctx.vars.backend,'http://two');done();});});
  });
  it('rejects an empty backend pool',function(){assert.throws(()=>balance.process({vars:{}},{backends:[]},()=>{}));});
});

describe('workflow interpolation bounds',function(){
  it('does not recursively expand replacement data or replacement metacharacters',function(){
    const util=require('../lib/MyUtil');
    assert.equal(util.replaceAll('##value##','##value##','##value##$&'),'##value##$&');
  });
});

describe('bounded HTTP client',function(){
  let server;
  before(function(){server=require('http').createServer((req,res)=>{
    if(req.url==='/slow')return;
    if(req.url==='/large'){res.end(Buffer.alloc(2*1024*1024+1));return;}
    res.setHeader('Content-Type','application/json');res.end('{"ok":true}');
  }).listen(0);});
  after(done=>server.close(done));
  const call=route=>require('../lib/http-client').get('http://127.0.0.1:'+server.address().port+route);
  it('parses JSON responses',function(done){call('/json').end(r=>{assert.deepEqual(r.body,{ok:true});assert.equal(r.status,200);done();});});
  it('enforces response size bounds',function(done){call('/large').end(r=>{assert.ok(r.error);done();});});
  it('enforces a total request deadline',function(done){call('/slow').timeout(20).end(r=>{assert.ok(r.error);done();});});
});
