//const getShareImage = require('@jlengstorf/get-share-image').default;

module.exports = {
  ogImage: (title, tagline = '', image = '') => {
    if (tagline === '') {
      return (
        'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/w_520,c_fit,co_rgb:691449,g_north_west,x_680,y_50,l_text:Georgia_40_bold:' +
        encodeURIComponent(title).replaceAll('%2C', '%252C') +
        ',e_shadow:90/w_600,c_fit,co_rgb:ede1e6,g_south_west,x_150,y_30,l_text:Georgia_40:' +
        encodeURIComponent('Maël Montévil') +
        '/https://montevil.org/assets/limbes2.jpg'
      );
    } else {
      return (
        'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/w_520,c_fit,co_rgb:691449,g_north_west,x_680,y_50,l_text:Georgia_40_bold:' +
        encodeURIComponent(title).replaceAll('%2C', '%252C') +
        ',e_shadow:90/w_1100,c_limit,co_rgb:ede1e6,g_south_west,x_50,y_30,l_text:Georgia_40:' +
        encodeURIComponent(tagline).replaceAll('%2C', '%252C') +
        '/https://montevil.org/assets/limbes2.jpg'
      );
    }
  },
};
