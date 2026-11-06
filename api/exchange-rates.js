module.exports=async(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method!=='GET'){res.statusCode=405;return res.end(JSON.stringify({error:'GET only'}))}
 try{const upstream=await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,JPY,CNY',{signal:AbortSignal.timeout(10000)});if(!upstream.ok)throw Error();const d=await upstream.json();if(d.base!=='EUR'||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!['USD','JPY','CNY'].every(c=>Number.isFinite(d.rates?.[c])&&d.rates[c]>0))throw Error();res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');return res.end(JSON.stringify({base:'EUR',date:d.date,rates:{EUR:1,USD:d.rates.USD,JPY:d.rates.JPY,CNY:d.rates.CNY},source:'https://frankfurter.dev/v1/'}))}catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');return res.end(JSON.stringify({error:'汇率暂不可用，保留原币报价'}))}
};
