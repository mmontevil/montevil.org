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
    {image= "https://montevil.org"+image;}
    
    let buff =  Buffer.from(image);
let base64data = buff.toString('base64');
 /*   if(tagline ===''){
        return 'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/l_fetch:'+base64data+',w_400,h_350,c_limit/fl_layer_apply,x_-360,y_-125,e_shadow:90/w_520,c_fit,co_rgb:691449,g_north_west,x_680,y_50,l_text:Georgia_40_bold:'+encodeURIComponent(title).replaceAll('%2C','')+',e_shadow:90/w_600,c_fit,co_rgb:a36c89,g_south_west,x_150,y_30,l_text:Georgia_40:'+encodeURIComponent('Maël Montévil')+'/https://montevil.org/assets/limbes2.jpg';
    }else{
  return 'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/l_fetch:'+base64data+',w_400,h_400,c_limit/fl_layer_apply,x_-360,y_-125/w_520,c_fit,co_rgb:691449,g_north_west,x_680,y_50,l_text:Georgia_40_bold:'+encodeURIComponent(title).replaceAll('%2C','')+'/w_1100,c_scale,co_rgb:ede1e6,g_south_west,x_50,y_30,l_text:Georgia_40:'+encodeURIComponent(tagline)+'/https://montevil.org/assets/limbes2.jpg';
}*/
    if(tagline ===''){
        return 'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/w_520,c_fit,co_rgb:691449,g_north_west,x_680,y_50,l_text:Georgia_40_bold:'+encodeURIComponent(title).replaceAll('%2C','%252C')+',e_shadow:90/w_600,c_fit,co_rgb:ede1e6,g_south_west,x_150,y_30,l_text:Georgia_40:'+encodeURIComponent('Maël Montévil')+'/https://montevil.org/assets/limbes2.jpg';
    }else{
  return 'https://res.cloudinary.com/mmontevil/image/fetch/w_1200,h_630,c_fill,q_auto,f_auto/w_520,c_fit,co_rgb:691449,g_north_west,x_680,y_50,l_text:Georgia_40_bold:'+encodeURIComponent(title).replaceAll('%2C','%252C')+',e_shadow:90/w_1100,c_limit,co_rgb:ede1e6,g_south_west,x_50,y_30,l_text:Georgia_40:'+encodeURIComponent(tagline).replaceAll('%2C','%252C')+'/https://montevil.org/assets/limbes2.jpg';
}
    
  }}
};
