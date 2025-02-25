const fs = require('fs');
//const slugify = require('@sindresorhus/slugify');
const slugify = require('../../_utils/slugify');

const memoize = require('fast-memoize');

const axios = require('axios');
async function download(url, filename, callback) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  fs.writeFile(filename, response.data, (err) => {
    if (err) throw err;
    callback();
  });
}

var donwloadAuthor = (id) => {
  if (!fs.existsSync('src/assets/avatars/gs/' + id + '.jpg')) {
    download(
      'https://scholar.googleusercontent.com/citations?view_op=view_photo&user=' +
        id,
      'src/assets/avatars/gs/' + id + '.jpg',
      function () {
        console.log('downloaded ' + id);
      }
    );
  }
  return undefined;
};
var filename = (url) => {
  let url0 = url.replace('_normal', '');
  let filename0 = url0.substring(url0.lastIndexOf('/') + 1);
  return filename0;
};
var downloadAvatar = (url) => {
  let url0 = url.replace('_normal', '');

  if (!fs.existsSync('src/assets/avatars/mentions/' + filename(url0))) {
    download(
      url0,
      'src/assets/avatars/mentions/' + filename(url0),
      function () {
        console.log('downloaded ' + filename(url0));
      }
    );
  }
  return 'https://montevil.org/assets/avatars/mentions/' + filename(url0);
};

const authors0 = (name, gsid, people, auth, nbAuteurs, fullname0) => {
  if (name==undefined){
    return undefined;
  }else{
  let authorPic = '/assets/avatars/gs/dummy.jpg';
  let authorUrl = '';
  let affiliation = '';
  let tooltip = 'title="';
  if (people[name] && people[name].alias) {
    name = people[name].alias;
  }
  if (gsid == '' && people[name] && people[name].gsid) {
    gsid = people[name].gsid;
  }

  if (gsid !== '') {
    donwloadAuthor(gsid);
    authorPic = '/assets/avatars/gs/' + gsid + '.jpg';
    authorUrl = 'https://scholar.google.fr/citations?user=' + gsid;
  }

  temp = '/assets/avatars/' + slugify(name) + '.jpg';
  if (fs.existsSync('src' + temp)) {
    authorPic = temp;
  }

  if (people[name] && people[name].site) {
    authorUrl = people[name].site;
  }
    if (people[name] && people[name].affiliation) {
    affiliation =  people[name].affiliation;
  }
  
  
  let authclass = '';
  if (auth) {
    authclass = 'p-author';
  }
  let fullName = name;

  if (fullname0) {
    fullName = fullname0;
  }

  if (!cachedPeople[slugify(name)]) {
    let person = {
      shortname: name,
      photo: authorPic,
      url: authorUrl,
      gsid: gsid,
      affiliation: affiliation,
    };
    cachedPeople[slugify(name)] = person;
    if (fullname0) {
      cachedPeople[slugify(name)].fullName = fullName;
    }
  } else {
    let person = cachedPeople[slugify(name)];
    if (fullname0 && fullname0 !== '')
      if (
        !person.fullName ||
        (person.fullName && person.fullName.length < fullname0.length)
      )
        person.fullName = fullname0;
    if ((!person.url || person.url == '') && authorUrl !== '')
      person.url = authorUrl;
    if ((!person.gsid || person.gsid == '') && gsid !== '') person.gsid = gsid;
    if (
      (!person.photo || person.photo == '/assets/avatars/gs/dummy.jpg') &&
      authorPic !== '/assets/avatars/gs/dummy.jpg'
    )
      person.photo = authorPic;

    cachedPeople[slugify(name)] = person;

    if (person.url && person.url !== '') authorUrl = person.url;
    if (person.fullName && person.fullName !== '') fullName = person.fullName;
    if (person.affiliation && person.affiliation !== '')
      affiliation = ', ' + person.affiliation;
  }

  tooltip = tooltip + fullName + affiliation + '"';

  let content =
    `<figure class="frameAuthor ` + authclass + ` h-card" ` + tooltip + `>`;

  if (auth && nbAuteurs == 1) {
    content =
      content +
      `<img class="reaction__author__photo2 u-photo noDarkFilter  hidden " src="` +
      authorPic +
      `" 
 height="48"  width="48" alt="` +
      name +
      `">`;
  } else {
    content =
      content +
      `<img class="reaction__author__photo2 u-photo noDarkFilter   " src="` +
      authorPic +
      `" 
 height="48" alt="` +
      name +
      `">`;
  }

  content =
    content +
    `<figcaption class="authorCaption">` +
    (authorUrl == ''
      ? `<span class="p-name">` + name + `</span>`
      : `<a href="` +
        authorUrl +
        `" class="p-name u-url metalink" >` +
        name +
        `</a>`) +
    `
 </figcaption>
 </figure>`;
  return content;
  }
};

const authors1 = memoize(authors0);

module.exports = {
  authors: (
    name,
    gsid,
    people,
    auth = false,
    nbAuteurs = 0,
    fullname = undefined
  ) => authors1(name, gsid, people, auth, nbAuteurs, fullname),
  downloadAvatar: (url) => downloadAvatar(url),
};
