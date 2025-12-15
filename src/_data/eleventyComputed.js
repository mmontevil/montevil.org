// filters.mjs  (ESM, Eleventy-compatible)

import tagFilter from '../_utils/tagfilter.js';
import stringComparison from 'string-similarity';
import slugify from '../_utils/slugify.js';
import { readFromCache } from '../_utils/cache.js';

const compare = stringComparison.compareTwoStrings;
const WEBMENTION_CACHE = '_cache/webmentions.json';

/* ------------------ Webmentions ------------------ */

export function getExtWebmentions() {
  return readFromCache(WEBMENTION_CACHE);
}

/* ------------------ Dates ------------------ */

const dtf = {
  en: new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }),
  fr: new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
};

const dtfDigits = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function attributeDateRaw(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  return dtfDigits.format(date).split('/').reverse().join('-');
}

function formattedDateRaw(lang, date) {
  return dtf[lang === 'fr' || lang === 'en' ? lang : 'en'].format(date);
}

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a, b) {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export function age(date) {
  return Math.abs(dateDiffInDays(new Date(), new Date(date)));
}

export function chooseDate(datepub, date) {
  if (!datepub) return date;
  if (datepub === ' Submitted') return date;
  return datepub;
}

/* ------------------ Authors ------------------ */

export function textAuthors(data) {
  let text = '';
  if (data.layout === 'link' && Array.isArray(data.authors)) {
    data.authors.forEach((author, i) => {
      text += author.name;
      if (i < data.authors.length - 2) text += ', ';
      if (i === data.authors.length - 2) text += ' and ';
    });
  }
  return text;
}

export function htmlAuthors(data) {
  let html = '';
  if (data.layout === 'link' && Array.isArray(data.authors)) {
    data.authors.forEach((author, i) => {
      if (author.twitter) {
        html += `<img class="u-photo avatar" src="https://res.cloudinary.com/mmontevil/image/twitter_name/${author.twitter}" alt="${author.name} avatar" loading="lazy" width="48" height="48" /> `;
      }
      html += `<b class="p-name">${author.name}</b>`;
      if (author.twitter) {
        html += ` <a class="author__twitter" href="https://twitter.com/${author.twitter}" aria-label="@${author.twitter} on Twitter"><svg><use xlink:href="#symbol-twitter" /></svg></a>`;
      }
      if (i < data.authors.length - 2) html += ', ';
      if (i === data.authors.length - 2) html += ' and ';
    });
  }
  return html;
}

/* ------------------ Metadata ------------------ */

function titleRaw(data) {
  if (data.layout === 'link') {
    return `${textAuthors(data)}:\n“${data.title}”`;
  }
  return data.title || '???';
}

export function headTitle(data) {
  if (data.page.url === '/') {
    return `<title itemprop="name">${data.pkg.title}</title>`;
  }
  return `<title>${titleRaw(data)} - ${data.pkg.author.name}</title>`;
}

/* ------------------ OpenGraph ------------------ */

export function ogType(data) {
  if (['publication', 'post', 'link', 'note', 'talk'].includes(data.layout)) {
    return 'article';
  }
  return 'website';
}

export function ogTitle(data) {
  if (data.page.url === '/') return data.pkg.title;
  return removeEmojis(titleRaw(data));
}

export function ogImageTitle(data) {
  if (data.page.url === '/') return data.pkg.title;
  if (['publication', 'post', 'link', 'note', 'talk'].includes(data.layout)) {
    return removeEmojis(titleRaw(data));
  }
  return '';
}

function ogTags(data) {
  return tags(data).map(t => `#${tagToHashtag(t)}`).join('%20%20');
}

export function ogImageTagline(data) {
  if (data.page.url === '/') return '';
  if (['publication', 'post', 'link', 'note', 'talk'].includes(data.layout)) {
    return ogTags(data);
  }
  return '';
}

/* ------------------ Bibliography ------------------ */

export function bibentry(data) {
  let res = {};
  for (const entry in data.bibM) {
    if (data.bibM[entry].id === data.page.fileSlug) {
      res = data.bibM[entry];
    }
  }
  return res;
}

export async function gsentry(data) {
  // Guard: missing or invalid title
  if (!data || typeof data.title !== 'string') {
    return {};
  }

  if (data.layout !== 'publication') {
    return {};
  }

  const baseTitle = data.title.trim();
  if (!baseTitle) {
    return {};
  }

  const titleStr = slugify(baseTitle.toLowerCase());

  let res = {};
  let similarity = 0;

  const entries = Array.isArray(data.scholar2)
    ? data.scholar2
    : Object.values(data.scholar2 || {});

  for (const entry of entries) {
    if (!entry?.title) continue;

    const test = compare(
      slugify(entry.title.toLowerCase()),
      titleStr
    );

    if (test > similarity && test > 0.7) {
      similarity = test;
      res = entry;
    }
  }

  return res;
}

/* ------------------ Mentions ------------------ */

export function webmentionsByType(mentions, type) {
  if (!Array.isArray(mentions)) return [];
  return mentions.filter(m => m['wm-property'] === type);
}

export function uniqByKeepLast(arr, key) {
  if (!Array.isArray(arr)) return [];

  return [...new Map(
    arr.map(x => [key(x), x])
  ).values()];
}


export function citationSize(data) {
  return data.gsentry?.citing?.length || 0;
}

export function allMentionsSize(data) {
  return data.mentionsSize + data.citationSize;
}

export function mentionsScore(data) {
  return (
    (data.mentionsSize / 3 / (data.age + 175) + data.citationSize) /
    (data.age + 175)
  );
}

export function likes(data) {
  return uniqByKeepLast(webmentionsByType(data.allMentions, 'like-of'), x => x.author.url);
}

export const likesSize = d => d.likes.length;
export const reposts = d => webmentionsByType(d.allMentions, 'repost-of');
export const repostsSize = d => d.reposts.length;
export const replies = d => webmentionsByType(d.allMentions, 'in-reply-to');
export const repliesSize = d => d.replies.length;
export const mentions = d => webmentionsByType(d.allMentions, 'mention-of');
export const mentionsSize = d => d.mentions.length;

/* ------------------ Tags & Category ------------------ */

export function tagToHashtag(tag = '') {
  const words = String(tag).replace(/[-\.]/g, ' ').split(' ').filter(Boolean);
  if (words.length === 0) return '';
  return words[0] + words.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join('');
}

export function tags(data) {
  let t = [];
  if (data.layout === 'publication' && data.keyword) {
    t = data.keyword.split(',');
  }
  if (data.tags !== undefined) {
    t = [...new Set([].concat(...t, ...data.tags))];
  }
  return tagFilter(t).sort((a, b) => a.localeCompare(b, 'en', { ignorePunctuation: true }));
}
export function video(data) {
  return data?.bibentryconf?.fields?.video
}
export function category(data) {
  let res = data.category ? [...data.category] : [];
  if (data.video && !res.includes('video')) res.push('video');
  if (res.includes('talks')) {
    if (data.entry?.type === 'book' && !res.includes('events')) res.push('events');
    if (data.bibentryconf?.fields?.eventtype === 'media' && !res.includes('media')) {
      res.push('media');
    }
  }
  return res;
}

/* ------------------ Utils ------------------ */

export function removeEmojis(content = '') {
  return String(content).replace(
    /(?:[\u2700-\u27bf]|[\ud800-\udfff][\udc00-\udfff]|[\u2600-\u26FF])/g,
    ''
  );
}

/* ------------------ Eleventy Export (CRITICAL) ------------------ */


// Language
export const lang = (data) => {
  let language = data.lang;
  if (data.bibentryconf?.fields?.language) {
    language = data.bibentryconf.fields.language;
  }
  return language === 'fr' || language === 'en' ? language : 'en';
};

// Formatted date
export const formattedDate = (data) => formattedDateRaw(data.lang, data.page.date);

// Attribute date
export const attributeDate = (data) => attributeDateRaw(data.page.date);




// Bibentry configuration
export const bibentryconf = (data) => {
  let res = {};
  if (data.entry) {
    for (const e in data.bibconf2) {
      if (data.bibconf2[e].entrykey === data.entry.id) {
        res = data.bibconf2[e];
      }
    }
  }
  return res;
};

// Title
export const title = (data) =>
  data.titlePrefix
    ? data.titlePrefix + (data.bibentry.title || data.title)
    : data.bibentry.title || data.title;


