'use strict';
// Kept identical in the two independently packaged backend services.
function request(method, address) {
  const headers = {};
  let payload, query = {}, timeout = 10000;
  const api = {
    headers(value) { Object.assign(headers,value); return api; },
    header(name,value) { headers[name]=value; return api; },
    query(value) { Object.assign(query,value); return api; },
    timeout(value) { timeout=value; return api; },
    send(value) { payload=value; return api; },
    end(callback) {
      let settled=false, timer;
      function finish(result) { if(settled)return;settled=true;clearTimeout(timer);callback(result); }
      function fail(error) { finish({status:0,statusCode:0,error,body:null,headers:{}}); }
      try {
        const url=new URL(address);
        if(!['http:','https:'].includes(url.protocol)) throw new Error('Only HTTP(S) is supported');
        Object.keys(query).forEach(key=>url.searchParams.set(key,query[key]));
        let body=payload;
        const contentType=()=>Object.keys(headers).some(key=>key.toLowerCase()==='content-type');
        if(body!==undefined && !Buffer.isBuffer(body)) {
          if(typeof body==='object') {body=JSON.stringify(body);if(!contentType())headers['Content-Type']='application/json';}
          else {body=String(body);if(!contentType())headers['Content-Type']='application/x-www-form-urlencoded';}
        }
        if(body!==undefined)headers['Content-Length']=Buffer.byteLength(body);
        // node:http preserves legacy GET form bodies; redirects are not followed.
        const transport=require(url.protocol==='https:'?'https':'http');
        const call=transport.request(url,{method,headers},response=>{
          const chunks=[];let size=0;
          response.on('error',fail);
          response.on('data',chunk=>{
            size+=chunk.length;
            if(size>2*1024*1024){response.destroy();call.destroy();fail(new Error('HTTP response exceeds 2 MiB'));return;}
            chunks.push(chunk);
          });
          response.on('end',()=>{
            try {
              const text=Buffer.concat(chunks).toString('utf8');
              const result=(response.headers['content-type']||'').includes('json')&&text?JSON.parse(text):text;
              finish({status:response.statusCode,statusCode:response.statusCode,headers:response.headers,body:result,error:response.statusCode>=200&&response.statusCode<300?null:new Error('HTTP '+response.statusCode)});
            }catch(error){fail(error);}
          });
        });
        call.on('error',fail);
        timer=setTimeout(()=>{call.destroy();fail(new Error('HTTP deadline exceeded'));},timeout);
        call.end(body);
      }catch(error){fail(error);}
      return api;
    }
  };
  return api;
}
module.exports={get:url=>request('GET',url),post:url=>request('POST',url),put:url=>request('PUT',url),delete:url=>request('DELETE',url)};
