const getShareImage = require('@jlengstorf/get-share-image').default;

module.exports = {
  ogImage: (title, tagline = '',image='') => {
    if(image ===''){
    return title
      ? getShareImage({
          cloudName: 'mmontevil',
          imageWidth: 1200,
          imageHeight: 630,
          imagePublicID: 'https://montevil.org/assets/blue4.webp'
,
          textAreaWidth: 1100,
          textLeftOffset: 50,

          title: title,
          titleFont: 'Georgia',
          titleFontSize: 70 + Math.max(0, 60 - title.length),
          titleGravity: 'south_west',
          titleBottomOffset: 380,

          tagline: tagline,
          taglineFont: 'Georgia',
          taglineFontSize: 40,
          taglineGravity: 'north_east',
          taglineTopOffset: 300,
          taglineColor: '691449',
        }).replace("/upload/","/fetch/")
      : '';
  }else{ let buff =  Buffer.from(image);
let base64data = buff.toString('base64');
    if(tagline ===''){
        return 'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/l_fetch:'+base64data+',w_500/fl_layer_apply,x_-300,y_0/w_520,c_fit,co_rgb:000000,g_south_west,x_580,y_300,l_text:Georgia_60:'+encodeURIComponent(title).replace('%2C','')+'/https://montevil.org/assets/blue4.webp';
    }else{
  return 'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/l_fetch:'+base64data+',w_400/fl_layer_apply,x_-360,y_0/w_720,c_fit,co_rgb:000000,g_north_west,x_480,y_100,l_text:Georgia_60:'+encodeURIComponent(title).replace('%2C','')+'/w_720,c_fit,co_rgb:691449,g_south_west,x_480,y_100,l_text:Georgia_40:'+encodeURIComponent(tagline)+'/https://montevil.org/assets/blue4.webp';
}}}
};
