#SAMA
#    Copyright (C) 2015 Maël Montévil and Tessie Paulose 

#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.

#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.

#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.






####################################### Legacy part ###################################


#######################################add skeleton legacy###################################

distance2 <- function (x1, x2) {
	temp <- x1 - x2;
	sqrt(sum(temp * temp))
}


isin <- function (x1, l,i) {
	nn=3;
	(l[["Xmin..pix."]][i]<=x1[1])&&(l[["Ymin..pix."]][i]<=x1[2])&&(l[["Zmin..pix."]][i]<=x1[3])&&(x1[1]<=l[["Xmax..pix."]][i])&&(x1[2]<=l[["Ymax..pix."]][i])&&(x1[3]<=l[["Zmax..pix."]][i])
}


findskeleton <- function (st,sl,mins) {
	nn=3;
	shift=dim(st)[2];
	
	for (j in 1:dim(st)[1]){
		st[j,shift+1]=0;
		st[j,shift+2]=0;
		st[j,shift+3]="";
		st[j,shift+4]="";
	}
	
	colnames(st)[shift+1] <- "total length"
	colnames(st)[shift+2] <- "nb branches"
	colnames(st)[shift+3] <- "lengths"
	colnames(st)[shift+4] <- "elengths"
	
	for (i in 1:dim(sl)[1]){
		if (mins<=sl[i,3]){
			l=(sl[i,4:6]+sl[i,7:9])/2;
			#l=(sl[i,7:9]);
			minn=10000;
			minid=0;
			for (j in 1:dim(st)[1]){
				#t=st[j,(3:5)+nn];
				#d=distance2(l,t);(d<minn)&&
				if ( (isin(l,st,j))){
					#minn=d;
					if (1<=minid) {
						print(paste( "double fit: branch structure1 structure2",i,minid,j))}  
						minid=j;
						
				}
			}
			if (0==minid) {print("no struct found")
				print(i)
				print(sl[i,3:6])}
				st[minid,shift+1]=st[minid,shift+1]+sl[i,3];
				st[minid,shift+2]=st[minid,shift+2]+1;
				st[minid,shift+3]=paste(st[minid,shift+3], sl[i,3]);
				st[minid,shift+4]=paste(st[minid,shift+4],sl[i,10] );
				
		}
	}
	
	st
}


addskeleton0<- function (dir,filesO,filesAdd,suffix) {
	mins=0;
	qtt=read.csv(file=paste(dir,filesO,sep=""),head=FALSE,sep=","); 
	qtt=as.vector(qtt[,1]);
	qttt=read.csv(file=paste(dir,filesAdd,sep=""),head=FALSE,sep=","); 
	qttt=as.vector(qttt[,1]);
	nn=length(qtt);
	for (j in 1:nn)
	{
		st=read.csv(file=paste(dir,qtt[j],sep=""),head=TRUE,sep=",");
		sl=read.csv(file=paste(dir,qttt[j],sep=""),head=TRUE,sep="	");
		print(j);
		write.csv(findskeleton(st,sl,mins),paste(dir,substring(qtt[j],1,nchar(qtt[j])-4),suffix,".csv",sep=""));
	}
}


#######################################add lumen legacy ###################################


findlumen <- function (st,sl,mins) {
	shift=dim(st)[2];
	
	for (j in 1:dim(st)[1]){
		st[j,shift+1]=0;
		st[j,shift+2]=0;
		st[j,shift+3]="st ";
	}
	colnames(st)[shift+1] <- "volum lumens (unit)"
	colnames(st)[shift+2] <- "number lumens"
	colnames(st)[shift+3] <- "lumens id"
	for (i in 1:dim(sl)[1]){
		print(sl[["Vol..unit."]][i]);
		print(i);
		if (mins<=sl[["Vol..unit."]][i]){
			l=c(sl[["CX..pix."]][i],sl[["CY..pix."]][i],sl[["CZ..pix."]][i]);
			minn=10000;
			minid=0;
			for (j in 1:dim(st)[1]){
				t=st[j,3:5];
				#d=distance2(l,t);(d<minn)&&
				if ( (isin(l,st,j))){
					# minn=d;
					if (1<=minid) {
						print(paste( "double fit: lumen structure1 structure2",i,minid,j))
					}  
					minid=j;
				}
			}
			if (0==minid) {print("no struct found")
				print(i)}
				st[minid,shift+1]=st[minid,shift+1]+sl[["Vol..unit."]][i];
				st[minid,shift+2]=st[minid,shift+2]+1;
				st[minid,shift+3]=paste(st[minid,shift+3],sl[i,1]);
		}
	}
	for (j in 1:dim(st)[1]){
		st[j,shift+4]=(st[j,shift+1]/st[["Vol..unit."]][j])^(1/3);
	}
	colnames(st)[shift+4] <- "(vol/lumenvol)^1/3";
	st
}


addlumen<- function (dir,filesO,filesAdd,suffix,mins) {
	qtt=read.csv(file=paste(dir,filesO,sep=""),head=FALSE,sep=","); 
	qtt=as.vector(qtt[,1]);
	qttt=read.csv(file=paste(dir,filesAdd,sep=""),head=FALSE,sep=","); 
	qttt=as.vector(qttt[,1]);
	nn=length(qtt);
	for (j in 1:nn)
	{
		st=read.csv(file=paste(dir,qtt[j],sep=""),head=TRUE,sep=",");
		sl=read.csv(file=paste(dir,qttt[j],sep=""),head=TRUE,sep=",");
		write.csv(findlumen(st,sl,mins),paste(dir,substring(qtt[j],1,nchar(qtt[j])-4),suffix,".csv",sep=""));
	}
}

####################################### New version###################################


####################################### add skeleton ###################################



findskeleton2 <- function (st,sl,mins) {
	nn=3;
	shift=dim(st)[2];
	
	for (j in 1:dim(st)[1]){
		st[j,shift+1]=0;
		st[j,shift+2]=0;
		st[j,shift+3]="";
		st[j,shift+4]="";
	}
	
	colnames(st)[shift+1] <- "total length"
	colnames(st)[shift+2] <- "nb branches"
	colnames(st)[shift+3] <- "lengths"
	colnames(st)[shift+4] <- "elengths"
	
	for (i in 1:dim(sl)[1]){
		if (mins<=sl[i,3]){
			#l=(sl[i,7:9]);
			#t=st[j,(3:5)+nn];
			#d=distance2(l,t);(d<minn)&&
			minid=which(sl$Structure[i] == st$Label);
			if (is.null(minid)) {
				print("no struct found")
			}else{
				st[minid,shift+1]=st[minid,shift+1]+sl[i,3];
				st[minid,shift+2]=st[minid,shift+2]+1;
				st[minid,shift+3]=paste(st[minid,shift+3], sl[i,3]);
				st[minid,shift+4]=paste(st[minid,shift+4],sl[i,10] );
			}
		}
	}
	st
}




addskeleton2<- function (dir,filesO,filesAdd,suffix) {
	mins=0;
	qtt=read.csv(file=paste(dir,filesO,sep=""),head=FALSE,sep=","); 
	qtt=as.vector(qtt[,1]);
	qttt=read.csv(file=paste(dir,filesAdd,sep=""),head=FALSE,sep=","); 
	qttt=as.vector(qttt[,1]);
	nn=length(qtt);
	for (j in 1:nn)
	{
		st=read.csv(file=paste(dir,qtt[j],sep=""),head=TRUE,sep=",");
		sl=read.csv(file=paste(dir,qttt[j],sep=""),head=TRUE,sep="	");
		print(j);
		write.csv(findskeleton2(st,sl,mins),paste(dir,substring(qtt[j],1,nchar(qtt[j])-4),suffix,".csv",sep=""));
	}
}



####################################### add lumen new ###################################

findlumen2 <- function (st,sl,mins) {
	shift=dim(st)[2];
	
	for (j in 1:dim(st)[1]){
		st[j,shift+1]=0;
		st[j,shift+2]=0;
		st[j,shift+3]="st ";
	}
	colnames(st)[shift+1] <- "volum lumens (unit)"
	colnames(st)[shift+2] <- "number lumens"
	colnames(st)[shift+3] <- "lumens id"
	nn=3;   
	for (i in 1:dim(sl)[1]){
		if (mins<=sl[i,3]){
			#l=(sl[i,7:9]);
			minid=0;
			minid=which(sl$Structure[i] == st$Label);
			
			if (length(minid)==0) {print("no struct found")
				print(i)
				print(sl[i,3:6])}
				st[minid,shift+1]=st[minid,shift+1]+sl[["Vol..unit."]][i];
				st[minid,shift+2]=st[minid,shift+2]+1;
				st[minid,shift+3]=paste(st[minid,shift+3],sl[i,1]);	
		}
	}
	for (j in 1:dim(st)[1]){
		st[j,shift+4]=(st[j,shift+1]/st[["Vol..unit."]][j])^(1/3);
	}
	colnames(st)[shift+4] <- "(vol/lumenvol)^1/3";
	st
}




####################################### add Bonej data ###################################



findboni <- function (st,sl) {
	shift=dim(st)[2];
	for (j in 1:dim(st)[1]){
		st[j,shift+1]=0;
		st[j,shift+2]=0;
		st[j,shift+3]=0;
	}
	colnames(st)[shift+1] <- "Thickness_Mean"
	colnames(st)[shift+2] <- "Thickness_SD"
	colnames(st)[shift+3] <- "Thickness_Max"
	for (i in 1:dim(sl)[1]){
		minid=which(sl$Structure[i] == st$Label);
		if (is.null(minid)) {
			print("no struct found")
		}else{
			st[minid,shift+1]=sl[["Thickness..pixels."]][i];
			st[minid,shift+2]=sl[["SD.Thickness..pixels."]][i];
			st[minid,shift+3]=sl[["Max.Thickness..pixels."]][i];
		}
	}
	st
}






#######################################prepare for merge###################################

mergeF0 <- function (dir,file,tree=TRUE,sep0=",") {	
	st=read.csv(file=paste(dir,file,sep=""),head=TRUE,sep=sep0);
	
	shift=dim(st)[2];	
	st[,shift+1]=file;
	colnames(st)[shift+1] <- "filename";
	if (tree){
		st[["lengths"]]<- as.character(st[["lengths"]]);
		st[["elengths"]]<- as.character(st[["elengths"]]);
	}
	return(st);
}
#######################################merge all###################################


mergeF <- function (dir,tree=TRUE,lumen=TRUE,bonus=TRUE,newversion=TRUE) {
	mins=0;
	qtt=list.files(path = dir, pattern = paste("[.]*","tructure[.]",sep=""));
	if(length(qtt)==0){
	message("There are no morphometric files, this will not work! Please run SAMA-images with the basic morphometric option.");
	stop();
	}
	if (newversion){
		sep0="	";
	}else{
		sep0=",";
	}
	#lumen part
	suffix="Structure";
	if(lumen){
		qttt=list.files(path = dir, pattern = paste("[.]*","lumen[.]",sep=""));
		if(length(qttt)==0){
		message("There are no lumen files, this will not work! Please run all steps of SAMA-images lumen analysis.");
		stop();
		}
		k=1;
		for (i in qttt)
		{
			print(qtt[k]);print("lum");
			st0=read.csv(file=paste(dir,qtt[k],sep=""),head=TRUE,sep=sep0);
			sl0=read.csv(file=paste(dir,qttt[k],sep=""),head=TRUE,sep=sep0);
			write.csv(findlumen2(st0,sl0,mins),paste(dir,substring(qtt[k],1,nchar(qtt[k])-4),"lumen2",".csv",sep=""))
			k=k+1;
		}
		suffix=paste(suffix,"lumen2",sep="")
		qtt=list.files(path = dir, pattern = paste("[.]*",suffix,".csv",sep=""));
		sep0=",";  
	}
	
	#skeleton part
	if(tree)
	{ 
		qttt=list.files(path = dir, pattern = paste("[.]*","br1",".xls",sep=""));
		if(length(qttt)==0){
		message("There are no branching files, this will not work! Please run SAMA-images with the branching analysis option.");
		stop();
		}
		k=1;
		for (i in qttt)
		{print(qtt[k]);print("tree");
			st0=read.csv(file=paste(dir,qtt[k],sep=""),head=TRUE,sep=sep0);
			sl0=read.csv(file=paste(dir,qttt[k],sep=""),head=TRUE,sep="	");
			if (newversion){
				write.csv(findskeleton2(st0,sl0,mins),paste(dir,substring(qtt[k],1,nchar(qtt[k])-4),"tree",".csv",sep=""))
			}else{
				write.csv(findskeleton(st0,sl0,mins),paste(dir,substring(qtt[k],1,nchar(qtt[k])-4),"tree",".csv",sep=""))
			}
			k=k+1;
		}
		suffix=paste(suffix,"tree",sep="")
		qtt=list.files(path = dir, pattern = paste("[.]*",suffix,".csv",sep=""));
		sep0=",";
	}
	
	#bonej thickness part
	if(bonus)
	{ 
		qttt=list.files(path = dir, pattern = paste("[.]*","boni",".xls",sep=""));
		if(length(qttt)==0){
		message("There are no thickness files, this will not work! Please run SAMA-images with the thickness analysis option.");
		stop();
		}
		k=1;
		for (i in qttt)
		{print(qtt[k]);print("bonus");
			st0=read.csv(file=paste(dir,qtt[k],sep=""),head=TRUE,sep=sep0);
			sl0=read.csv(file=paste(dir,qttt[k],sep=""),head=TRUE,sep="	");
			write.csv(findboni(st0,sl0),paste(dir,substring(qtt[k],1,nchar(qtt[k])-4),"bonus",".csv",sep=""))
			k=k+1;
		}
		suffix=paste(suffix,"bonus",sep="")
		qtt=list.files(path = dir, pattern = paste("[.]*",suffix,".csv",sep=""));
		sep0=",";
	}
	
	st= mergeF0(dir,qtt[1],tree=tree,sep0=sep0); 
	for (i in qtt[2:length(qtt)])
	{
		print(i);
		stt=mergeF0(dir,i,tree=tree,sep0=sep0);
		st=rbind(st,stt);
	}
	#st$nodep[is.na(st$nodep)] <- 0;
	write.csv(st,paste(dir,"all.csv",sep="")); 
}

