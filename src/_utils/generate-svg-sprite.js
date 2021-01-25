const svgstore = require('svgstore');
const fs = require('fs');
const path = require('path');

// Where are Feather icons available from the npm package?
const ICONS_FOLDER = 'node_modules/feather-icons/dist/icons/';
const ICONS_FOLDER2 = 'src/assets/icons/';

// Which icons do I need for the sprite?
// icon filename + title for accessibility
const ICONS_LIST = {
  calendar: { name: 'date', title: 'Date', folder: ICONS_FOLDER},
  info: { title: 'Info' , folder: ICONS_FOLDER},
  link: { title: 'Link' , folder: ICONS_FOLDER2},
  download: { title: 'download' , folder: ICONS_FOLDER2},
  'external-link': {name: 'exlink', title: 'exLink' , folder: ICONS_FOLDER2},
  'map-pin': { name: 'location', title: 'Location' , folder: ICONS_FOLDER},
  'message-circle': { name: 'comments', title: 'Webmention' , folder: ICONS_FOLDER},
  rss: { name: 'feeds', title: 'Feeds' , folder: ICONS_FOLDER},
  search: { title: 'Search' , folder: ICONS_FOLDER},
  tag: { name: 'tags', title: 'Tag' , folder: ICONS_FOLDER},
  twitter: { title: 'Twitter', folder: ICONS_FOLDER },
  wifi: { name: 'online', title: 'Online', folder: ICONS_FOLDER },
  'wifi-off': { name: 'offline', title: 'Offline' , folder: ICONS_FOLDER},
  pdf2: { name: 'pdf', title: 'PDF' , folder: ICONS_FOLDER2},
  bib2: { name: 'bib', title: 'BIB' , folder: ICONS_FOLDER2},
};

// Initiate the sprite with svgstore
let sprite = svgstore({
  // Add these attributes to the sprite SVG
  svgAttrs: { style: 'display: none;', 'aria-hidden': 'true' },
  // Copy these attributes from the icon source SVG to the symbol in the sprite
  copyAttrs: ['width', 'height'],
});

// Loop through each icon in the list
Object.entries(ICONS_LIST).forEach(([icon, properties]) => {
  // Log the name of the icon and its title to the console
  console.log(`${icon}.svg -> ${properties.title}`);
  const svgFile = fs
    // Load the content of the icon SVG file
    .readFileSync(path.join(properties.folder, `${icon}.svg`), 'utf8')
    // Make its dimensions relative to the surounding text
    .replace(' width="24" height="24"', ' width="1.1em" height="1.1em"')
    // Add a title for accessibility
    .replace(
      / fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-[^"]+">/,
      ` ><title id="${properties.name || icon}-icon">${
        properties.title
      }</title>`
    );
  // Add the new symbol to the sprite
  sprite.add(`symbol-${properties.name || icon}`, svgFile, {
    // Add attributes for accessibility
    symbolAttrs: {
      'aria-labelledby': `${properties.name || icon}-icon`,
      role: 'img',
    },
  });
});
// Finally, store the sprite in a file Eleventy will be able to include
fs.writeFileSync(
  'src/_includes/svg-sprite.svg',
  sprite.toString({ inline: true })
);
