
from scholarly import scholarly, ProxyGenerator
import json 
from dotenv import load_dotenv
from pathlib import Path 
import os
env_path = Path('../') / '.env'
load_dotenv(dotenv_path=env_path)
SCRAPER= os.getenv("SCRAPER")

#proxy_generator = ProxyGenerator()
#success = proxy_generator.Tor_Internal(tor_cmd = 'tor')
#scholarly.use_proxy(proxy_generator)

#pg = ProxyGenerator()
#success = pg.FreeProxies()
#scholarly.use_proxy(pg)
pg = ProxyGenerator()
success = pg.ScraperAPI(SCRAPER)
scholarly.use_proxy(pg,pg)

search_query = scholarly.search_author('Sabrina Leichnitz')

author = scholarly.fill(next(search_query))

pubs=[pub for pub in author['publications'] if (pub['num_citations']>0)]



pubs2=[ [pub, (list(scholarly.citedby(pub)))] for pub in pubs if 'citedby_url' in pub]


print(json.dumps(pubs2,indent=2, default=lambda o: '<not serializable>'))
