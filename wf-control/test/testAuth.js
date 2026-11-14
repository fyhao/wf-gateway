const assert = require('assert');
const request = require('supertest');
const auth = require('../lib/auth');
describe('authentication and roles', function() {
  let server;
  const cfg={enabled:true,users:[{username:'reader',passwordHash:auth.hashPassword('long reader password'),groups:['readers']},{username:'admin',passwordHash:auth.hashPassword('long admin password'),superadmin:true},{username:'mfa',passwordHash:auth.hashPassword('long mfa password'),mfaRequired:true}],groups:{readers:['viewer']},roles:{viewer:['app:read']}};
  beforeEach(()=>{server=require('../server')({port:0,auth:cfg});});
  afterEach(done=>server.close(done));
  const login=(name,password)=>request(server).post('/auth/login').send({username:name,password});
  it('requires authentication, enforces group role permissions and revokes sessions',async function(){
    await request(server).get('/app').expect(401);
    assert.equal((await login('reader','wrong')).status,401);
    const r=await login('reader','long reader password');
    assert.equal(r.headers['cache-control'],'no-store');
    const token='Bearer '+r.body.accessToken;
    await request(server).get('/app').set('Authorization',token).expect(200);
    await request(server).post('/app').set('Authorization',token).send({name:'forbidden'}).expect(403);
    await request(server).get('/backup/export').set('Authorization',token).expect(403);
    await request(server).post('/auth/logout').set('Authorization',token).expect(200);
    await request(server).get('/app').set('Authorization',token).expect(401);
  });
  it('uses normal authentication for superadmin recovery',async function(){
    const r=await login('admin','long admin password');
    await request(server).get('/instance').set('Authorization','Bearer '+r.body.accessToken).expect(200);
  });
  it('fails closed on missing MFA and accepts only verified second factors',async function(){
    assert.equal((await login('mfa','long mfa password')).status,401);
    cfg.verifySecondFactor=async(user,proof)=>proof==='test-proof';
    try {
      await request(server).post('/auth/login').send({username:'mfa',password:'long mfa password',secondFactor:'wrong'}).expect(401);
      await request(server).post('/auth/login').send({username:'mfa',password:'long mfa password',secondFactor:'test-proof'}).expect(200);
    }finally{delete cfg.verifySecondFactor;}
  });
  it('expires sessions',async function(){
    await new Promise(resolve=>server.close(resolve));
    server=require('../server')({port:0,auth:Object.assign({},cfg,{sessionTTL:1})});
    const r=await login('reader','long reader password');
    await new Promise(resolve=>setTimeout(resolve,10));
    await request(server).get('/app').set('Authorization','Bearer '+r.body.accessToken).expect(401);
  });
  it('limits failed logins and permits CORS preflight',async function(){
    for(let i=0;i<10;i++)await login('reader','wrong');
    await request(server).post('/auth/login').send({username:'reader',password:'wrong'}).expect(429);
    await request(server).options('/app').expect(204);
  });
});
