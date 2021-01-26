const twitter = require('twitter-text');

const dtf = {
  en: new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  fr: new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
};

const dtfDigits = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function attributeDate(date) {
  return dtfDigits.format(date).split('/').reverse().join('-');
}

function permalinkDate(date) {
  return dtfDigits.format(date).split('/').reverse().join('/');
}

function formattedDate(lang, date) {
  return dtf[lang || 'en'].format(date);
}

function removeEmojis(content) {
  // https://thekevinscott.com/emojis-in-javascript/
  return content.replace(
    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,
    ''
  );
}

function textAuthors(data) {
  let text = '';
  if (data.layout === 'link' && data.authors && data.authors.length > 0) {
    let i = 0;
    const nb = data.authors.length;
    data.authors.forEach((author) => {
      text += author.name;
      i++;
      if (i < nb - 1) {
        text += ', ';
      }
      if (i === nb - 1) {
        text += ' and ';
      }
    });
  }
  return text;
}

function htmlAuthors(data) {
  let html = '';
  if (data.layout === 'link' && data.authors && data.authors.length > 0) {
    let i = 0;
    const nb = data.authors.length;
    data.authors.forEach((author) => {
      if (author.twitter) {
        html += `<img class="u-photo avatar" src="https://res.cloudinary.com/mmontevil/image/twitter_name/${author.twitter}" alt="${author.name} avatar" loading="lazy" width="48" height="48" /> `;
      }
      html += `<b class="p-name">${author.name}</b>`;
      if (author.twitter) {
        html += ` <a class="author__twitter" href="https://twitter.com/${author.twitter}" aria-label="@${author.twitter} on Twitter"><svg><use xlink:href="#symbol-twitter" /></svg></a>`;
      }
      i++;
      if (i < nb - 1) {
        html += ', ';
      }
      if (i === nb - 1) {
        html += ' and ';
      }
    });
  }
  return html;
}

function title(data) {
  switch (data.layout) {
    case 'link':
      return `${textAuthors(data)}:\n“${data.title}”`;
    case 'note':
      return `Note from ${formattedDate(data.lang, data.page.date)}`;
  }
  if (data.title && data.title !== '') {
    return data.title;
  } else {
    // TODO: console.log(`No title for ${data.page.inputPath}`);
    return '???';
  }
}

// TODO: remove 'excerpt' filter when this works
function lead(data) {
  // if (data.layout === 'note') {
  //   console.dir(data);
  // }
  if (data.content === undefined) {
    return '';
  }
  const regex = /(<p( [^>]*)?>((?!(<\/p>)).|\n)+<\/p>)/m;
  let lead = '';

  // Remove paragraphs containing only an image
  let cleanContent = data.content.replace(/<p><img [^>]+><\/p>/, '');

  // Get first paragraph, if there's at least one, and remove the paragraph tag
  if ((matches = regex.exec(cleanContent)) !== null) {
    lead = matches[0].replace(/<p( [^>]*)?>(((?!(<\/p>)).|\n)+)<\/p>/, '$2');
  }

  return lead;
}

// TODO: refactor with the one in filters
function tagToHashtag(tag) {
  let words = tag.replace(/[-\.]/, ' ').split(' ');
  return (
    words[0] +
    words
      .slice(1)
      .map((word) => word.charAt(0).toUpperCase() + word.substr(1))
      .join('')
  );
}

function tags(data) {
  let tags = [];
  if (data.layout === 'note') {
    tags = twitter.extractHashtags(twitter.htmlEscape(data.content));
  }
  if (data.tags !== undefined) {
    // merge and deduplicate
    tags = [...new Set([].concat(...tags, ...data.tags))];
  }
  tags.sort((a, b) => {
    return a.localeCompare(b, 'en', { ignorePunctuation: true });
  });
  return tags;
}

function ogTags(data) {
  return tags(data)
    .map((tag) => '#' + tagToHashtag(tag))
    .join('%20%20');
}

function headTitle(data) {
  if (data.page.url === '/') {
    return `<title itemprop="name">${data.pkg.title}</title>`;
  }
  // if (data.layout === 'note') {
  //   return `<title>${lead(data).slice(0, 50)} - ${
  //     data.pkg.author.name
  //   }</title>`;
  // }
  return `<title>${title(data)} - ${data.pkg.author.name}</title>`;
}

function ogType(data) {
  switch (data.layout) {
    case 'article':
    case 'link':
    case 'note':
    case 'talk':
      return 'article';
  }
  return 'website';
}

function ogTitle(data) {
  if (data.page.url === '/') {
    return data.pkg.title;
  }
  return removeEmojis(title(data));
}

function ogDescription(data) {
  return lead(data).slice(0, 50);
}

function ogImageTitle(data) {
  if (data.page.url === '/') {
    return data.pkg.title;
  }
  switch (data.layout) {
    case 'article':
    case 'link':
    case 'talk':
    case 'note':
      return removeEmojis(title(data));
    // case 'note':
    //   return lead(data);
  }
  return '';
}

function ogImageTagline(data) {
  if (data.page.url === '/') {
    return '';
  }
  switch (data.layout) {
    case 'article':
    case 'link':
    case 'note':
    case 'talk':
      return ogTags(data);
  }
  return '';
}

module.exports = {
  lang: (data) => data.lang || 'en',

  formattedDate: (data) => formattedDate(data.lang, data.page.date),
  attributeDate: (data) => attributeDate(data.page.date),
  permalinkDate: (data) => permalinkDate(data.page.date),
  authors: {
    text: (data) => textAuthors(data),
    html: (data) => htmlAuthors(data),
  },
  head: {
    title: (data) => headTitle(data),
  },
  opengraph: {
    type: (data) => ogType(data),
    title: (data) => ogTitle(data),
    description: (data) => ogDescription(data),
    image: {
      title: (data) => ogImageTitle(data),
      tagline: (data) => ogImageTagline(data),
    },
  },
  lead: (data) => lead(data),
  // tags: (data) => tags(data),
};
