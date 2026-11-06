"""Collect OSM cable alignments inside each saved DEM model footprint."""
import json, concurrent.futures, requests, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ALLOWED={'cable_car','gondola','chair_lift','mixed_lift','drag_lift','t-bar','j-bar','platter','rope_tow','magic_carpet','funicular'}
HOSTS=['https://overpass.osm.ch/api/interpreter','https://overpass.private.coffee/api/interpreter','https://maps.mail.ru/osm/tools/overpass/api/interpreter']
resorts=json.loads((ROOT/'resorts.json').read_text(encoding='utf-8'))
(ROOT/'lifts').mkdir(exist_ok=True)
def collect(r):
 rid=r['id'];model=json.loads((ROOT/'models'/f'{rid}.json').read_text(encoding='utf-8'));w,s,e,n=model['bounds']
 query=f'[out:json][timeout:25];way["aerialway"]({s},{w},{n},{e});out tags geom;'
 for host in (HOSTS if r['country']=='瑞士' else [HOSTS[2],HOSTS[1]]):
  try:
   response=requests.post(host,data={'data':query},timeout=32,headers={'User-Agent':'SnowboundJourneys/1.0 (https://github.com/cescsm93/snow-atlas)'})
   response.raise_for_status();raw=response.json()
   if 'elements' not in raw or raw.get('remark'):continue
   lifts=[]
   for way in raw['elements']:
    tags=way.get('tags',{})
    if way.get('type')!='way' or tags.get('aerialway') not in ALLOWED:continue
    coords=[[p['lon'],p['lat']] for p in way.get('geometry',[])]
    runs=[];current=[]
    for xy in coords:
     if w<=xy[0]<=e and s<=xy[1]<=n:current.append(xy)
     elif current:runs.append(current);current=[]
    if current:runs.append(current)
    coords=max(runs,key=len,default=[])
    if len(coords)<2 or coords[0]==coords[-1]:continue
    lifts.append({'id':way['id'],'name':tags.get('name') or tags.get('ref') or f"OSM {way['id']}",'type':tags['aerialway'],'coordinates':coords,'source':f"https://www.openstreetmap.org/way/{way['id']}"})
   lifts.sort(key=lambda x:(len(x['coordinates']),x['id']),reverse=True)
   data={'retrievedAt':'2026-11-06','source':'OpenStreetMap / Overpass','query':query,'endpoint':host,'status':'available','lifts':lifts[:8]}
   (ROOT/'lifts'/f'{rid}.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
   return rid,len(data['lifts']),'available'
  except (requests.RequestException,ValueError,AssertionError):pass
 data={'retrievedAt':'2026-11-06','source':'OpenStreetMap / Overpass','query':query,'status':'unavailable','lifts':[]}
 (ROOT/'lifts'/f'{rid}.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
 return rid,0,'unavailable'
if __name__=='__main__':
 selected=resorts
 if '--missing' in sys.argv:selected=[r for r in resorts if not json.loads((ROOT/'lifts'/f"{r['id']}.json").read_text(encoding='utf-8'))['lifts']]
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
  for result in pool.map(collect,selected):print(*result,flush=True)
