// utils/refs.mjs (or any .js file if "type": "module" is in package.json)

import { readFileSync } from 'fs';
import Cite from 'citation-js';


// Function to generate references
async function refs() {// Load and parse JSON data
const databibM = readFileSync('./src/_data/bibM.json', 'utf-8');
const bibM = JSON.parse(databibM);

// Citation template configuration
const config = Cite.plugins.config.get('@csl');
const templateName = 'chicago';

  const res = {};
  for (const entry in bibM) {
    const bibfi = bibM[entry];
    const cite = new Cite(JSON.stringify(bibfi));
    const txt = cite.format('bibliography', {
      format: 'text',
      template: templateName,
      lang: 'en-US',
    });

    res[bibfi.id] = {
      bib: bibfi,
      txt,
    };
  }
  return res;
}

// Export references
export const references = await refs();

