
const fs = require('fs');
const slugify = require('@sindresorhus/slugify');
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
 let imgclass="";
 if( auth && nbAuteurs==1){imgclass=" hidden ";}
 
let content= `<figure class="frameAuthor `+authclass+` h-card">
 <img class="reaction__author__photo2 u-photo noDarkFilter  `+imgclass+` " src="`+authorPic+`" 
 height="48" alt="`+name+`">
 <figcaption class="authorCaption">`
 +( authorUrl=="" ? `<span class="p-name">`+name+ `</span>`:  `<a href="`+authorUrl+`" class="p-name u-url metalink">`+name+`</a>`)+`
 </figcaption>
 </figure>`;
      return content;
    }

    
const authors1=memoize(authors0);


module.exports = {
 authors: (name, gsid, people,auth=false,nbAuteurs=0 ) =>authors1(name, gsid, people,auth,nbAuteurs) ,
};


