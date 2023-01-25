version=0.997;

#source("http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/install.r")
#source("/home/kamome/Work/cana/confocal3Dculture/t47d/install.r")
#install.packages("./Rsama_0.77.tar.gz")
# Create the personal library if it doesn't exist. Ignore a warning if the directory already exists.
dir.create(Sys.getenv("R_LIBS_USER"), showWarnings = FALSE, recursive = TRUE)

repos <- "http://cran.r-project.org";
install.packages("stringi",repos=repos)
install.packages("stringr",repos=repos)
install.packages("sm",repos=repos)
install.packages("cluster",repos=repos)
install.packages("gdata",repos=repos)
install.packages("FactoMineR",repos=repos)
install.packages("dendextend",repos=repos)

file=paste("Rsama_",version,".tar.gz",sep="");
download.file(paste("http://montevil.org/assets/sama/",file,sep=""),file);
install.packages(file,repos = NULL,type="source")
