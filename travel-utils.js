(function(root){
function convert(amount,from,to,fx){if(!Number.isFinite(amount)||amount<0)return null;if(from===to)return amount;if(!fx||!Number.isFinite(fx.rates?.[from])||!Number.isFinite(fx.rates?.[to])||fx.rates[from]<=0||fx.rates[to]<=0)return null;return amount/fx.rates[from]*fx.rates[to]}
function mapsURL(p,resort){const [lon,lat]=p.coordinates;const query=[p.name,resort.name,`${lat},${lon}`].filter(Boolean).join(' ');return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query)}
const api={convert,mapsURL};if(typeof module==='object')module.exports=api;else root.SnowTravel=api;
})(typeof window==='object'?window:globalThis);
