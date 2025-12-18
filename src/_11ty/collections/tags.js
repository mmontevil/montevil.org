import fs from 'fs';
import slugify from '../../_utils/slugify.js';
import tagFilter from '../../_utils/tagfilter.js';

export async function tags(collection) {

  const tagsCollection = new Map();
  let max = 0;

  for (const item of collection.getAll()) {
    let itemTags = item.data.tags || [];
    let tagst = item.data.keyword ? item.data.keyword.split(',') : [];
    itemTags = [...new Set([...itemTags, ...tagst])];
    itemTags = tagFilter(itemTags);

    for (const tag of itemTags) {
      const number = (tagsCollection.get(tag) || 0) + 1;
      max = Math.max(max, number);
      tagsCollection.set(tag, number);
    }
  }

  const minLog = Math.log(1);
  const maxLog = Math.log(max);

  const tags = [];

  for (const [tag, number] of tagsCollection.entries()) {
    const factor = (Math.log(number) - minLog) / (maxLog - minLog);

    const tagSlug = await slugify(tag, {
      decamelize: false,
      customReplacements: [['%', ' ']],
    });

    const newTag = {
      tag,
      slug: tagSlug,
      number,
      factor,
      step: Math.ceil(factor * 4) + 1,
    };

    const tagLogoPath = `assets/logos/${tagSlug}.png`;
    if (fs.existsSync(`src/${tagLogoPath}`)) {
      newTag.logo = tagLogoPath;
    }

    const tagContentPath = `src/tags/${tagSlug}.md`;
    if (fs.existsSync(tagContentPath)) {
      newTag.description = fs.readFileSync(tagContentPath, 'utf8');
    }

    tags.push(newTag);
  }

  tags.sort((a, b) =>
    a.tag.localeCompare(b.tag, 'en', { ignorePunctuation: true })
  );

  return tags;
}

export function mainTags(collection) {
  const minContentsNumber = 5;
  const tagsCollection = new Map();
  let max = 0;

  for (const item of collection.getAll()) {
    if ('tags' in item.data) {
      for (const tag of item.data.tags) {
        const number = (tagsCollection.get(tag) || 0) + 1;
        max = Math.max(max, number);
        tagsCollection.set(tag, number);
      }
    }
  }

  const minLog = Math.log(minContentsNumber);
  const maxLog = Math.log(max);

  const tags = [];
  for (const [tag, number] of tagsCollection.entries()) {
    if (number >= minContentsNumber) {
      const factor = Math.log(number) / maxLog;
      tags.push({
        tag,
        number,
        factor,
        step: Math.ceil(factor * 2) + 1,
      });
    }
  }

  tags.sort((a, b) =>
    a.tag.localeCompare(b.tag, 'en', { ignorePunctuation: true })
  );

  return tags;
}
