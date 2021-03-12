const path = require('path');


var fs = require('fs'),
    request = require('request');

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);

    }); 
};   
          
module.exports = {
  dirname: (filePath) => {
    return path.dirname(filePath);
  },
  
    donwloadAuthor: (id) =>{
    if(!fs.existsSync('src/assets/avatars/gs/'+id+'.jpg')){
    download('https://scholar.googleusercontent.com/citations?view_op=view_photo&user='+id, 'src/assets/avatars/gs/'+id+'.jpg', function(){
    console.log('downloaded '+id);
});
  }
    return undefined;
  },
};
