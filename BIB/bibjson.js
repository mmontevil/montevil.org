 
var fs = require('fs')
const parser = require('bib2json')



function changeKeysToLower(obj) {
    var key, upKey;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            upKey = key.toLowerCase();
            if (upKey !== key) {
                obj[upKey] = obj[key];
                delete(obj[key]);
            }
            // recurse
            if (typeof obj[upKey] === "object") {
                changeKeysToLower(obj[upKey]);
            }
        }
    }
    return obj;
}
/*
fs.writeFile('bibconf2.json', 
JSON.stringify(changeKeysToLower(parser(String(fs.readFileSync('bibconf.bib'))).entries), null, 4).replaceAll('[*','{').replaceAll('*]','}'));
**/


console.log(JSON.stringify(changeKeysToLower(parser(String(fs.readFileSync('bibconf.bib'))).entries), null, 4).replaceAll('[*','{').replaceAll('*]','}'));

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

