import fs from 'fs';

import {read} from 'to-vfile'
import report from 'vfile-reporter';
import {rehype} from 'rehype'
import slug from 'rehype-slug'
import format from 'rehype-format'
import sanitizeHtml from 'sanitize-html';

const file = await rehype()
  .data('settings', { fragment: true })
  .use(slug)
  .process(await read('index.njk'), function (err, file0) {
    rehype()
      .data('settings', { fragment: true })
      .use(format)
      .process(file0, function (err, file) {
        console.error(report(err || file));
        var res = sanitizeHtml(String(file), {
          allowedTags: false,
          allowedAttributes: false,
        });
        res = res.replaceAll(
          'mfenced close=")" open separators',
          'mfenced close=")" open="(" separators'
        );
        res = res.replaceAll(
          'mfenced close="∥" open separators',
          'mfenced close="∥" open="∥" separators'
        );
        res = res.replaceAll(
          'mfenced close="]" open separators',
          'mfenced close="]" open="[" separators'
        );
        fs.writeFile(
          'index.njk',
          res.substring(res.indexOf('\n') + 1),
          (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          }
        );
      });
  });
console.log(String(file))
console.log(String(await read('index.njk')))

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
