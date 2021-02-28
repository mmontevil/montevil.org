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
  }else{ 
    if(image[0]==="/")
    {image= "https://montevil.org"+image}
    
    let buff =  Buffer.from(image);
let base64data = buff.toString('base64');
    if(tagline ===''){
        return 'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/l_fetch:'+base64data+',w_500,h_500,c_limit/fl_layer_apply,x_-320,y_0/w_600,c_fit,co_rgb:691449,g_west,x_580,y_-100,l_text:Georgia_55:'+encodeURIComponent(title).replace('%2C','')+'/w_600,c_fit,co_rgb:a36c89,g_north_west,x_50,y_550,l_text:Georgia_40:'+encodeURIComponent('Maël Montévil')+'/https://montevil.org/assets/limbes.jpg';
    }else{
  return 'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/l_fetch:'+base64data+',w_400/fl_layer_apply,x_-360,y_0/w_720,c_fit,co_rgb:691449,g_north_west,x_480,y_100,l_text:Georgia_60:'+encodeURIComponent(title).replace('%2C','')+'/w_720,c_fit,co_rgb:ede1e6,g_south_west,x_480,y_70,l_text:Georgia_40:'+encodeURIComponent(tagline)+'/https://montevil.org/assets/limbes.jpg';
}}}
};
