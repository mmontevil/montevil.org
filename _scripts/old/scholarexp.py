from scholarly import scholarly, ProxyGenerator
from scraper_api import ScraperAPIClient
import json 
from dotenv import load_dotenv
from pathlib import Path 
import os
env_path = Path('../') / '.env'
load_dotenv(dotenv_path=env_path)
SCRAPER= os.getenv("SCRAPER")

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

pg = ScraperAPI(SCRAPER)
scholarly.use_proxy(pg)
scholarly.set_timeout(120)





search_query = scholarly.search_author('Maël Montévil')
author = scholarly.fill(next(search_query))
pub=scholarly.fill(author['publications'][16])
print(pub)
print(list(scholarly.citedby(pub)))

