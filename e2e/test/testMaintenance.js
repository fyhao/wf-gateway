const assert=require('assert'),request=require('supertest'),fs=require('fs'),os=require('os'),path=require('path');
describe('lifecycle, logs and upload integration',function(){
  let runtime,control,dir;
  const token='test-runtime-token';
  const auth=req=>req.set('Authorization','Bearer '+token);
  const deploy=conf=>auth(request(runtime).post('/control/deploy')).send({conf});
  function item(endpoint){return {app:'maintenance-demo',status:'enabled',flows:{
    request:{steps:[{type:'response',body:'ok'}]},
    start:{steps:[{type:'log',log:'deploy-start'}]},init:{steps:[{type:'log',log:'app-start'}]},destroy:{steps:[{type:'log',log:'app-stop'}]},done:{steps:[{type:'log',log:'deploy-complete'}]},
    uploadFile:{steps:[{type:'upload',var:'file'},{type:'response',body:'{{JSON.stringify(file)}}'}]}
  },listeners:[{type:'http',method:'GET',endpoint,flow:'request'},{type:'http',method:'POST',endpoint:'/files',flow:'uploadFile'},... [['deploy.init','start'],['app.init','init'],['app.destroy','destroy'],['deploy.done','done']].map(p=>({type:p[0],flow:p[1]}))]};}
  before(function(){
    dir=fs.mkdtempSync(path.join(os.tmpdir(),'wf-upload-'));
    control=require('../../wf-control/server')({port:0});
    runtime=require('../../wf-app/server')({port:0,controlToken:token,uploadDirectory:dir,uploadMaxBytes:1024});
  });
  after(async function(){for(const s of [runtime,control])await new Promise(r=>s.close(r));fs.rmSync(dir,{recursive:true,force:true});});
  it('protects runtime management endpoints',async function(){
    await request(runtime).post('/control/deploy').send({conf:{action:'check'}}).expect(401);
    await request(runtime).get('/control/logs').expect(401);
  });
  it('awaits lifecycle ordering and removes old routes on redeployment',async function(){
    await deploy({action:'deployAll',apps:[item('/before')]}).expect(200);
    await request(runtime).get('/before').expect(200,'ok');
    await deploy({action:'deployApp',app:'maintenance-demo',flows:item('/after').flows,listeners:item('/after').listeners}).expect(200);
    await request(runtime).get('/before').expect(404);await request(runtime).get('/after').expect(200,'ok');
    const r=await auth(request(runtime).get('/control/logs')).query({app:'maintenance-demo',limit:7}).expect(200);
    assert.deepEqual(r.body.logs.map(r=>r.message),['deploy-start','app-start','deploy-complete','deploy-start','app-stop','app-start','deploy-complete']);
  });
  it('rejects reserved management routes and malformed configurations',async function(){
    const bad=item('/bad');bad.listeners=[{type:'http',method:'GET',endpoint:'/control/hijack',flow:'request'}];
    await deploy({action:'deployAll',apps:[bad]}).expect(400);
    await request(runtime).get('/after').expect(200,'ok');
    await auth(request(runtime).post('/control/deploy')).send({conf:'{broken'}).expect(400);
  });
  it('stores raw uploads safely and rejects oversize and unsupported bodies',async function(){
    const r=await request(runtime).post('/files').set('Content-Type','application/octet-stream').set('X-Filename','../../escape').send(Buffer.from('hello')).expect(200);
    const data=JSON.parse(r.text);assert.match(data.id,/^[a-f0-9]{48}$/);assert.equal(data.size,5);
    assert.equal(fs.readFileSync(path.join(dir,data.id),'utf8'),'hello');
    await request(runtime).post('/files').send({data:'bad'}).expect(415);
    await request(runtime).post('/files').set('Content-Type','application/octet-stream').send(Buffer.alloc(1025)).expect(413);
    assert.equal(fs.readdirSync(dir).length,1);
  });
  it('retrieves remote instance logs and handles missing instances',async function(){
    const r=await request(control).post('/instance').send({name:'test-runtime',host:'http://127.0.0.1:'+runtime.address().port}).expect(200);
    const previous=process.env.WF_RUNTIME_TOKEN;process.env.WF_RUNTIME_TOKEN=token;
    try{
      const response=await request(control).get('/instance/'+r.body.instance.id+'/logs?limit=2').expect(200);assert.equal(response.body.logs.length,2);
      await request(control).get('/instance/999999/logs').expect(404);
    }finally{if(previous===undefined)delete process.env.WF_RUNTIME_TOKEN;else process.env.WF_RUNTIME_TOKEN=previous;}
  });
  it('bounds recursive workflow execution',async function(){
    const app=item('/recursive');app.flows.request={steps:[{type:'request'}]};
    await deploy({action:'deployApp',app:'maintenance-demo',flows:app.flows,listeners:app.listeners}).expect(200);
    await request(runtime).get('/recursive').expect(500);
  });
  it('runs a configured exception recovery flow',async function(){
    const app=item('/recover');
    app.flows.request={steps:[{type:'loadBalance',backends:[]}],onException:'recover'};
    app.flows.recover={steps:[{type:'response',body:'recovered'}]};
    await deploy({action:'deployApp',app:'maintenance-demo',flows:app.flows,listeners:app.listeners}).expect(200);
    await request(runtime).get('/recover').expect(200,'recovered');
  });
  it('destroys disabled apps and accepts an empty deployment',async function(){
    await deploy({action:'deployAppStatus',app:'maintenance-demo',status:'disabled'}).expect(200);
    await request(runtime).get('/after').expect(404);
    const r=await auth(request(runtime).get('/control/logs')).query({app:'maintenance-demo',limit:1});assert.equal(r.body.logs[0].message,'app-stop');
    await deploy({action:'deployAll',apps:[]}).expect(200);
  });
});
describe('load balancer example with real HTTP backends',function(){
  let servers=[],gateway;
  before(function(){
    servers.push(require('../../wf-control/server')({port:0}));
    const express=require('../../wf-app/node_modules/express');
    for(const text of ['one','two']){const app=express();app.get('/home',(req,res)=>res.send(text));servers.push(app.listen(0));}
    gateway=require('../../wf-app/server')({port:0});servers.push(gateway);
  });
  after(async function(){for(const s of servers)await new Promise(r=>s.close(r));});
  it('alternates real backend responses',async function(){
    const example=JSON.parse(fs.readFileSync(path.join(__dirname,'../../examples/load-balancer.json')));
    example.flowData.LB.main.steps[0].backends=servers.slice(1,3).map(s=>'http://127.0.0.1:'+s.address().port);
    await request(gateway).post('/control/deploy').send({conf:{action:'deployAll',apps:[{app:'LB',status:'enabled',flows:example.flowData.LB,listeners:example.listenerData.LB}]}}).expect(200);
    await request(gateway).get('/home').expect(200,'one');await request(gateway).get('/home').expect(200,'two');await request(gateway).get('/home').expect(200,'one');
  });
});
