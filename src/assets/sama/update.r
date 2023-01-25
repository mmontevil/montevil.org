#source("http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/install.r")
#source("/home/kamome/Work/cana/confocal3Dculture/t47d/install.r")
#install.packages("./Rsama_0.77.tar.gz")
#
version=0.997;
file=paste("Rsama_",version,".tar.gz",sep="");
download.file(paste("http://montevil.org/assets/sama/",file,sep=""),file);
install.packages(file,repos = NULL,type="source")
