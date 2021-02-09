 
var fs = require('fs')
var slug = require('rehype-slug')

var rehype = require('rehype')
 var vfile = require('to-vfile')
var report = require('vfile-reporter')
var format = require('rehype-format')
const sanitizeHtml = require('sanitize-html');
var link = require('rehype-autolink-headings')
var options={
  behavior:"append" ,
  properties: {class : "deeplink"},
  content : {type: 'text', value: ' <svg class="icon" role="img" focusable="false"><use xlink:href="#symbol-anchor" /></svg> '}
}
/*
<svg class="icon" role="img" focusable="false"><use xlink:href="#symbol-anchor"></use></svg>
*/

var file000="";

rehype()
  .data('settings', {fragment: true})
  .use(slug).use(link,options).process('aaa bbb<h2>hop </h2>', function(err, file0) {
/*var res=sanitizeHtml(String( file), {
  allowedTags: false,
  allowedAttributes: false,
});*/
var res=String( file0);
res=res.replace('mfenced close=")" open separators','mfenced close=")" open="(" separators');
res=res.replace('mfenced close="∥" open separators','mfenced close="∥" open="∥" separators');
res=res.replace('mfenced close="]" open separators','mfenced close="]" open="[" separators');
  //console.error( res);
file000=res;
  })
  
 console.error( file000);

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

