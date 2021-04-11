from scholarly import scholarly, ProxyGenerator
from scraper_api import ScraperAPIClient
import json 
from dotenv import load_dotenv
from pathlib import Path 
import os
env_path = Path('../') / '.env'
load_dotenv(dotenv_path=env_path)
SCRAPER= os.getenv("SCRAPER")






search_query = scholarly.search_author('Maël Montévil')

author = scholarly.fill(next(search_query))




print(json.dumps(author['publications'],indent=2, default=lambda o: '<not serializable>'))

