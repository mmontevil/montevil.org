 
var fs = require('fs')
var slug = require('rehype-slug')

var rehype = require('rehype')
 var vfile = require('to-vfile')
var report = require('vfile-reporter')
var format = require('rehype-format')
const sanitizeHtml = require('sanitize-html');



      rehype().data('settings', {fragment: true})
  .use(slug)
  .process(fs.readFileSync('index.njk'), function (err, file) {
    console.error(report(err || file))
var res=String( file); /*sanitizeHtml(String( file), {
  allowedTags: false,
  allowedAttributes: false,
});*/
    fs.writeFile('index.njk',res.substring(res.indexOf("\n") + 1), (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
  })
    



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

