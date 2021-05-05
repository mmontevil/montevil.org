
const fs = require('fs');
//const slugify = require('@sindresorhus/slugify');
const slugify = require('../../_utils/slugify');
const memoize = require('fast-memoize')

    request = require('request');
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);

    }); 
}
          
  
  var  donwloadAuthor= (id) =>{
    if(!fs.existsSync('src/assets/avatars/gs/'+id+'.jpg')){
    download('https://scholar.googleusercontent.com/citations?view_op=view_photo&user='+id, 'src/assets/avatars/gs/'+id+'.jpg', function(){
    console.log('downloaded '+id);
});
  }
    return undefined;
  };
  var  filename= (url) =>{
        let  url0=url.replace("_normal","");
        let filename0 = url0.substring(url0.lastIndexOf('/')+1);
      return filename0;
  }
    var  downloadAvatar= (url) =>{
      let url0=url.replace("_normal","");
      
    if(!fs.existsSync('src/assets/avatars/mentions/'+filename(url0))){
    download(url0, 'src/assets/avatars/mentions/'+filename(url0) , function(){
    console.log('downloaded '+filename(url0));
});
  }
    return 'https://montevil.org/assets/avatars/mentions/'+filename(url0);
  };

const authors0= (name, gsid, people, auth,nbAuteurs) => {
  let authorPic="/assets/avatars/gs/dummy.jpg";
  let authorUrl="";
  if (gsid !==""){
      donwloadAuthor(gsid);
      authorPic ="/assets/avatars/gs/"+gsid+".jpg";
      authorUrl="https://scholar.google.fr/citations?user="+gsid;
  }

 if (people[name] && people[name].alias ){
   name =people[name].alias
}


temp="/assets/avatars/"+slugify(name)+".jpg";
 if ( fs.existsSync("src"+temp)){ 
   authorPic =temp;
 }
 
 if (people[name] && people[name].site) { authorUrl =people[name].site;}
 let authclass="";
 if(auth){
   authclass="p-author";
}


 
let content= `<figure class="frameAuthor `+authclass+` h-card">`;

 if( auth && nbAuteurs==1){ content=content+`<img class="reaction__author__photo2 u-photo noDarkFilter  hidden " src="`+authorPic+`" 
 height="48"  width="48" alt="`+name+`">`;
}else{
 content=content+`<img class="reaction__author__photo2 u-photo noDarkFilter   " src="`+authorPic+`" 
 height="48" alt="`+name+`">`;
 }
 
content=content+ `<figcaption class="authorCaption">`
 +( authorUrl=="" ? `<span class="p-name">`+name+ `</span>`:  `<a href="`+authorUrl+`" class="p-name u-url metalink">`+name+`</a>`)+`
 </figcaption>
 </figure>`;
      return content;
    }

    
const authors1=memoize(authors0);


module.exports = {
 authors: (name, gsid, people,auth=false,nbAuteurs=0 ) =>authors1(name, gsid, people,auth,nbAuteurs) ,
 downloadAvatar: (url) =>downloadAvatar(url),
};


