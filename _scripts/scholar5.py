
from scholarly import scholarly, ProxyGenerator
import json 
from dotenv import load_dotenv
from pathlib import Path 
from os.path import exists
import os
import warnings
warnings.filterwarnings("error")

env_path = Path('../') / '.env'
load_dotenv(dotenv_path=env_path)
SCRAPER= os.getenv("SCRAPER")
proxynumb=0

pg = ProxyGenerator()
success = pg.FreeProxies()
scholarly.use_proxy(pg)

with open('../src/_data/scholar.json','r') as f:
    contents =  json.load(f)

if   exists('./scholar.json') :
    with open('./scholar.json','r') as ff:
        contents2 =  json.load(ff)
else:
        contents2= []
        
search_query = scholarly.search_author('Maël Montévil')

author = scholarly.fill(next(search_query))
pubs=[pub for pub in author['publications'] if (pub['num_citations']>0)]


pg = ProxyGenerator()
success = pg.ScraperAPI(SCRAPER)
scholarly.use_proxy(pg,pg)

res1 = []
for x in pubs:
    temp = next((y for y in contents if y[0]['bib']['title'] == x['bib']['title']  ), None)
    temp2 = next((y for y in contents2 if y[0]['bib']['title'] == x['bib']['title']  ), None)
    fetching=0
    if temp != None :
        if x['num_citations'] == temp[0]['num_citations'] :
            fetching=0
        else:
            fetching=1
    else:
        fetching=1
    if temp2 != None :
        fetching=0
    if proxynumb == 3 :
        fetching=0
     if fetching==0:    
          res1.append(temp)
    if fetching==1:
        while proxynumb <3 :
            try: 
                res1.append([x, (list(scholarly.citedby(x)))])
                with open("./scholar.json", "w") as text_file:
                      text_file.write(json.dumps(res1,indent=2, default=lambda o: '<not serializable>'))
            except:
                if proxynumb == 0 :
                    SCRAPER= os.getenv("SCRAPER2")
                    proxynumb=1
                    pg = ProxyGenerator()
                    success = pg.ScraperAPI(SCRAPER)
                    scholarly.use_proxy(pg,pg)
                if proxynumb == 1 :
                    SCRAPER= os.getenv("SCRAPER3")
                    proxynumb=2
                    pg = ProxyGenerator()
                    success = pg.ScraperAPI(SCRAPER)
                    scholarly.use_proxy(pg,pg)
                if proxynumb == 2 :
                    proxynumb=3
                    print("scrapper api problems")
                    if temp != None :
                        res1.append(temp)
                        
with open("./scholar.json", "w") as text_file:
      text_file.write(json.dumps(res1,indent=2, default=lambda o: '<not serializable>'))


print("finished")
