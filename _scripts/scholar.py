from scholarly import scholarly, ProxyGenerator
from scraper_api import ScraperAPIClient
import json 

class ScraperAPI(ProxyGenerator):
    def __init__(self, api_key):
        self._api_key = api_key
        self._client = ScraperAPIClient(api_key)
        
        assert api_key is not None
        
        super(ScraperAPI, self).__init__()
        
        self._TIMEOUT = 120
        self._session = self._client
        self._session.proxies = {}
        
    def _new_session(self):
        self.got_403 = False
        return self._session
    
    def _close_session(self):
        pass  # no need to close the ScraperAPI client

pg = ScraperAPI('a1f4e912c58edcfd1c25c568a39b898a')
scholarly.use_proxy(pg)
scholarly.set_timeout(120)





search_query = scholarly.search_author('Maël Montévil')
author = scholarly.fill(next(search_query))

pubs=[scholarly.fill(pub) for pub in author['publications']]

pubs2=[ [pub, (list(scholarly.citedby(pub)))] for pub in pubs if 'citedby_url' in pub]


print(json.dumps(pubs2,indent=2, default=lambda o: '<not serializable>'))

