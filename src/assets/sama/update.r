#source("http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/install.r")
#source("/home/kamome/Work/cana/confocal3Dculture/t47d/install.r")
#install.packages("./Rsama_0.77.tar.gz")
#
version=0.9975;
file=paste("Rsama_",version,".tar.gz",sep="");
download.file(paste("https://montevil.org/assets/sama/",file,sep=""),file);
install.packages(file,repos = NULL,type="source")
