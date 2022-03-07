
from scholarly import scholarly, ProxyGenerator
import json 
from dotenv import load_dotenv
from pathlib import Path 
import os
env_path = Path('../') / '.env'
load_dotenv(dotenv_path=env_path)
SCRAPER= os.getenv("SCRAPER")

pg = ProxyGenerator()
success = pg.ScraperAPI(SCRAPER)
scholarly.use_proxy(pg,pg)

with open('../src/_data/scholar.json','r') as f:
    contents =  json.load(f)
    
search_query = scholarly.search_author('Maël Montévil')

author = scholarly.fill(next(search_query))
pubs=[pub for pub in author['publications'] if (pub['num_citations']>0)]

res1 = []

for x in pubs:
    temp = next((y for y in contents if y[0]['bib']['title'] == x['bib']['title']  ), None)
    
    if temp != None :
        if x['num_citations'] == temp[0]['num_citations'] :
            res1.append(temp)
        else:
            res1.append([x, (list(scholarly.citedby(x)))])
    else:
          res1.append([x, (list(scholarly.citedby(x)))])



print(json.dumps(res1,indent=2, default=lambda o: '<not serializable>'))
