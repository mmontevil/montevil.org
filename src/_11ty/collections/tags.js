
const fs = require('fs');
const tagFilter = require('../../_utils/tagfilter');
const slugify = require('../../_utils/slugify');

function tags(collection) {
  let tagsCollection = new Map();
  let max = 0;

  collection.getAll().forEach(function (item) {
    let itemTags = [];
    if ('tags' in item.data) {
      itemTags = item.data.tags;
    }

    //  if (item.data.layout === 'publication') {
    let tagst = [];
    if (item.data.keyword) {
      tagst = item.data.keyword.split(',');
    }
    itemTags = [...new Set([].concat(...itemTags, ...tagst))];
    itemTags = tagFilter(itemTags);
    // }
    for (const tag of itemTags) {
      let number = (tagsCollection.get(tag) || 0) + 1;
      max = Math.max(max, number);
      tagsCollection.set(tag, number);
    }
  });

  // We assume there is at least one tag with only one content
  const minLog = Math.log(1);
  const maxLog = Math.log(max);

  const tags = [];
  tagsCollection.forEach((number, tag) => {
    let factor = (Math.log(number) - minLog) / (maxLog - minLog);
    let tagSlug = slugify(tag, {
      decamelize: false,
      customReplacements: [['%', ' ']],
    });

    let newTag = {
      tag: tag,
      slug: tagSlug,
      number: number,
      factor: factor,
      step: Math.ceil(factor * 4) + 1,
    };

    let tagLogoPath = `assets/logos/${tagSlug}.png`;
    if (fs.existsSync(`src/${tagLogoPath}`)) {
      newTag.logo = tagLogoPath;
    }

    let tagContentPath = `src/tags/${tagSlug}.md`;
    if (fs.existsSync(tagContentPath)) {
      newTag.description = fs.readFileSync(tagContentPath, {
        encoding: 'utf8',
      });
    }

    tags.push(newTag);
  });

  tags.sort((a, b) => {
    return a.tag.localeCompare(b.tag, 'en', { ignorePunctuation: true });
  });

  return tags;
};


function mainTags(collection) {
  const minContentsNumber = 5;
  let tagsCollection = new Map();
  let max = 0;

  collection.getAll().forEach(function (item) {
    if ('tags' in item.data) {
      let itemTags = item.data.tags;

      for (const tag of itemTags) {
        let number = (tagsCollection.get(tag) || 0) + 1;
        max = Math.max(max, number);
        tagsCollection.set(tag, number);
      }
    }
  });

  const minLog = Math.log(minContentsNumber);
  const maxLog = Math.log(max);

  const tags = [];
  tagsCollection.forEach((number, tag) => {
    if (number >= minContentsNumber) {
      let factor = Math.log(number) / maxLog;
      tags.push({
        tag: tag,
        number: number,
        factor: factor,
        step: Math.ceil(factor * 2) + 1,
      });
    }
  });

  tags.sort((a, b) => {
    return a.tag.localeCompare(b.tag, 'en', { ignorePunctuation: true });
  });

  return tags;
};




module.exports = {
  tags,
  mainTags,
};
