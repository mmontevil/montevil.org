 import fs from 'fs/promises';
import parser from 'bib2json';

// Fonction récursive pour mettre toutes les clés en minuscules
function changeKeysToLower(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k.toLowerCase(), changeKeysToLower(v)])
    );
}

async function main() {
    try {
        // Lire le fichier BibTeX
        const bibContent = await fs.readFile('bibconf.bib', 'utf8');
        
        // Parser le BibTeX en JSON
        const bibJSON = parser(bibContent);

        // Transformer les clés et ajuster la syntaxe
        const result = JSON.stringify(
            changeKeysToLower(bibJSON.entries),
            null,
            4
        ).replaceAll('[*', '{').replaceAll('*]', '}');

        console.log(result);

        // Si tu veux écrire dans un fichier JSON
        // await fs.writeFile('bibconf.json', result, 'utf8');

    } catch (err) {
        console.error('Erreur:', err);
    }
}

// Lancer le script
main();

/*
var addClasses = require('rehype-add-classes')
var vfile = require('vfile')

const processor = rehype()
    .data('settings', { fragment: true })
    .use(addClasses, {
        pre: 'hljs',
        'h1,h2,h3': 'title',
        h1: 'is-1',
        h2: 'is-2',
        p: 'one two'
    });

const html = `
    <pre><code></code></pre>
    <h1 class="title">header</h1>
    <h2>sub 1</h2>
    <h2 class="existing">sub 2</h2>
    <p></p>
`;

const { contents } = processor.processSync(vfile({ contents: html }));

console.log(contents);
*/

