// utils/authors.mjs
import fs from 'fs';
import axios from 'axios';
import memoize from 'memoize';
import slugify from '@sindresorhus/slugify';
import {anchorSvg ,findOrigin } from './addAutoref.js';

if (!globalThis.__cachedPeople__) {
  globalThis.__cachedPeople__ = {};
}
let cachedPeople = globalThis.__cachedPeople__ ;



async function download(url, filename) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return fs.promises.writeFile(filename, response.data);
}

const downloadAuthor0 = async (id) => {
  const path = `src/assets/avatars/gs/${id}.jpg`;
  if (!fs.existsSync(path)) {
    await download(
      `https://scholar.googleusercontent.com/citations?view_op=view_photo&user=${id}`,
      path
    );
    console.log('downloaded ' + id);
  }
};

export const downloadAuthor = memoize(downloadAuthor0);

const filename = (url) => {
  const url0 = url.replace('_normal', '');
  return url0.substring(url0.lastIndexOf('/') + 1);
};

const downloadAvatar = async (url) => {
  const url0 = url.replace('_normal', '');
  const path = `src/assets/avatars/mentions/${filename(url0)}`;
  if (!fs.existsSync(path)) {
    await download(url0, path);
    console.log('downloaded ' + filename(url0));
  }
  return `https://montevil.org/assets/avatars/mentions/${filename(url0)}`;
};


export const authors0 = async (
  name,
  gsid = '',
  people = {},
  auth = false,
  nbAuteurs = 0,
  fullname0
) => {
  if (!name) return undefined;

  let authorPic = '/assets/avatars/gs/dummy.jpg';
  let authorUrl = '';
  let affiliation = '';
  let tooltip = 'title="';

  // Resolve alias
  if (people[name]?.alias) name = people[name].alias;
  if ( people[name]?.gsid) gsid = people[name].gsid;

  // Google Scholar avatar
  if (gsid && gsid!="") {
    await downloadAuthor(gsid);
    authorPic = `/assets/avatars/gs/${gsid}.jpg`;
    authorUrl = `https://scholar.google.fr/citations?user=${gsid}`;
  }

  // Local slug avatar
  const slug = slugify(name);
  const temp = `/assets/avatars/${slug}.jpg`;
  if (fs.existsSync('src' + temp)) authorPic = temp;

  if (people[name]?.site) authorUrl = people[name].site;
  if (people[name]?.affiliation) affiliation = people[name].affiliation;

  const authclass = auth ? 'p-author' : '';
  let fullName = fullname0 || name;

  if (!cachedPeople[slug]) {
    cachedPeople[slug] = {
      shortname: name,
      photo: authorPic,
      url: authorUrl,
      gsid,
      affiliation,
      ...(fullname0 && { fullName }),
    };
  } else {
    const person = cachedPeople[slug];
    if (fullname0 && (!person.fullName || person.fullName.length < fullname0.length)) {
      person.fullName = fullname0;
    }
    if (!person.url && authorUrl) person.url = authorUrl;
    if (!person.gsid && gsid) person.gsid = gsid;
    if (person.photo === '/assets/avatars/gs/dummy.jpg' && authorPic !== '/assets/avatars/gs/dummy.jpg') {
      person.photo = authorPic;
    }
    cachedPeople[slug] = person;
    authorUrl = person.url || authorUrl;
    fullName = person.fullName || fullName;
    if (person.affiliation) affiliation =  person.affiliation;


  }
  let sep="";
  if (affiliation) sep = ', ';
  tooltip += `${fullName}${sep}${affiliation}"`;

  // Build HTML
  let content = `<figure class="frameAuthor ${authclass} h-card" ${tooltip}>`;
  content += `<img class="reaction__author__photo2 u-photo noDarkFilter ${auth && nbAuteurs === 1 ? 'hidden' : ''}" src="${authorPic}" height="48" ${auth && nbAuteurs === 1 ? 'width="48"' : ''} alt="${name}">`;
  content += `<figcaption class="authorCaption">${authorUrl ? `<a href="${authorUrl}" class="p-name u-url metalink">${name}</a>` : `<span class="p-name">${name}</span>`}</figcaption>`;
  content += `</figure>`;

  return content;
};


export async function renderCitedBy0(gsentry, people, bibM) {
  if (!gsentry || !gsentry.citing || gsentry.citing.length === 0) {
    return '';
  }

  let html = '<ol class="citedBy">\n';

  for (const article of gsentry.citing) {
    html += '  <li class="citedbyitem">\n';
    let strip="";
    let authorstxt="";
    if (article.authorsid && article.authors) {
      const totalAuthors = article.authorsid.length;
      for (let i = 0; i < totalAuthors; i++) {
        const auth = article.authorsid[i];
        html += await authors(article.authors[i], auth, people);
       authorstxt+=article.authors[i]+" ";
        // Add separators like Nunjucks loop.revindex logic
        const revIndex = totalAuthors - i;
        if (revIndex > 2) {
          html += ', ';
        } else if (revIndex === 2) {
          html += ' & ';
        } else if (revIndex === 1) {
          html += '.';
        }
      }
    }

    if (article.year && article.year !== "NA") {
      html += ` ${article.year}. `;
      //strip+= ` ${article.year}`+" ";

    }
    let title=article.title.replace("[PDF] ", "").replace("[HTML] ", "");
    if (article.journal === "NA") html += '<i>';
    html += `${title.charAt(0).toUpperCase() + title.slice(1)}.`;
    if (article.journal === "NA") html += '</i>';
    else html += ` <i>${article.journal.charAt(0).toUpperCase() + article.journal.slice(1)}</i>.`;
    
    strip+= `${title}`+" "+`${article.journal}`;
    
    
    if (article.mainlink && article.mainlink !== "") {
      html += ` <a href="${article.mainlink}">Publisher</a>`;
    }

    if (article.pdflink && article.pdflink !== "") {
      html += ` <a href="${article.pdflink}">Eprint</a>`;
    }
    if (authorstxt.includes("Montévil")){
      html += ` <a href="${findOrigin(strip,bibM)}" class="anchorlink">${anchorSvg}</a>`;
    }
      
    html += '\n  </li>\n';
  }

  html += '</ol>\n';
  return html;
}


// Memoize async function
export const authors = memoize(authors0);
export const renderCitedBy = memoize(renderCitedBy0);
