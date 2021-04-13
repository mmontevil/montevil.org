
from scholarly import scholarly, ProxyGenerator
import json 
from dotenv import load_dotenv
from pathlib import Path 


proxy_generator = ProxyGenerator()
proxy_generator.Tor_Internal(tor_cmd = 'tor')
scholarly.use_proxy(proxy_generator)

search_query = scholarly.search_author('Maël Montévil')

author = scholarly.fill(next(search_query))

pubs=[scholarly.fill(pub) for pub in author['publications'] if (pub['num_citations']>0)]



pubs2=[ [pub, (list(scholarly.citedby(pub)))] for pub in pubs if 'citedby_url' in pub]


print(json.dumps(pubs2,indent=2, default=lambda o: '<not serializable>'))
