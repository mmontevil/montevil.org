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


options(contrasts=c("contr.sum","contr.poly"))
library(stringr)
library(sm)
library(FactoMineR)
library(cluster)
library(gdata)
library(dendextend)


#######################################variable names###################################

checkvar <- function (st,var){
	return(!is.null(st[[var]]));
}
observables <- function (st,lumen=TRUE,tree=TRUE,versioncounter=4,logs=FALSE,thres=TRUE){
	qtt=rbind("Quality","Elon1","logElon1","Elon2","logElon2","logvol","logEll_MajRad","logFerret","Sphericity","RatioVolEllipsoid",
		  "logRatioVolEllipsoid","RatioVolbox","logRatioVolbox","ShapeScore");
		  
		  if(thres){
		  qtt=rbind(qtt,"score01","score02");
		  }
		  
	if(logs){
		qtt=rbind("Quality","logvol","logElon1","logElon2","Sphericity","logRatioVolEllipsoid","logRatioVolbox");
	}
	
	qtt=rbind(qtt,"sphericity2","ratiovolHull","logMoment1","logMoment2","logMoment3","logMoment4","logMoment5")
	qtlum=rbind("lumenosity","lumen");
	qttree=rbind("complexity","complexity2","complexity3","complexity4");
	qtbonus=rbind("Thickness_Mean", "Thickness_SD", "Thickness_Max",
		      "logThickness_Mean", "logThickness_SD", "logThickness_Max",
	       "rThickness_Mean", "rThickness_SD", "rThickness_Max",
	       "rbThickness_SD", "rbThickness_Max");
	qtt=rbind(qtt,qtbonus);
	if(lumen){
		qtt=rbind(qtt,qtlum);
	}   
	if(tree){
		qtt=rbind(qtt,qttree);
	}
	return(qtt[sapply(qtt,function(x) checkvar(st,x))])
}


observablesold <- function (lumen=TRUE,tree=TRUE,versioncounter=4,logs=FALSE){
	qtv1=rbind("Quality","Elon1","logElon1","Elon2","logElon2","logvol","Sphericity","RatioVolEllipsoid",
		   "logRatioVolEllipsoid","RatioVolbox","logRatioVolbox");
	qtv1b=rbind("Quality","logvol","logElon1","logElon2","Sphericity","logRatioVolEllipsoid","logRatioVolbox");
	
	if(logs){
		qtv1=qtv1b;
	}
	
	qtv2=rbind(qtv1,"sphericity2","ratiovolHull")
	
	qtv3=rbind(qtv1,"logEll_MajRad","Moment1","Moment2","Moment3","Moment4")
	qtv4=rbind(qtv2,"logEll_MajRad","Moment1","Moment2","Moment3","Moment4")
	
	
	
	qtlum=rbind("lumenosity","lumen");
	qttree=rbind("complexity1","complexity2","complexity3","complexity4");
	#qttree=rbind("complexity1","complexity2");
	
	if(versioncounter==1){
		qtt=qtv1;
	}
	if(versioncounter==2){
		qtt=qtv2;
	}
	if(versioncounter==3){
		qtt=qtv3;
	}
	if(versioncounter==4){
		qtt=qtv4;
	}
	if(lumen){
		qtt=rbind(qtt,qtlum);
	}
	
	if(tree){
		qtt=rbind(qtt,qttree);
	}
	return(qtt)
}


#######################################some usefull functions###################################
caps <- function(x) min(x,1);
outt <- function(dir) paste(dirname(dir),"/SAMA-Analyze output/",sep="");

coefvar <- function(x){
	return(sd(x)/(mean(x)+0.000001));
}
lengthh <- function(x){
	return(length(x));
}
median.data.frame <- function(x, na.rm=FALSE) {
	if(is.factor(x)) NA else
		median(x, na.rm=na.rm)
}
multcompor <- function(x,comp){
	return(sapply(x, function(x0) return(0<sum(x0==comp))));
}
strtovec <- function (str) {
	res=c();
	if (toString(str)!=""){
		con=textConnection(toString(str));
		res=as.numeric(scan(con, what="character", sep=" ",quiet = TRUE));
		close(con);
		##closeAllConnections();
		res=res[!is.na(res)];
	}
	n=length(res);
	
	if (n==0)
		res=c(1);
	res
}
#number of branches
complexity1 <- function (vec) {
	log(length(vec))
}
#more than 1 branch
complexity2 <- function (vec) {
	sum(length(vec)>1)
}
#sum of length of branches
complexity3 <- function (vec) {
	log(sum(vec))
}
#sum of length of branches
complexity4 <- function (vec) {
	ttl=sum(vec);
	-(sum((vec/ttl)*log(vec/ttl)))
}


####################################### filterwells is a hack to remove some conditions###################################

##prolactine
filterwells <- function (st) {
	st[st$Plate!="P1",];
}

##promegestone
filterwells <- function (st) {
	st[st$filename!="R135-11 NA",];
}
##no
filterwells <- function (st) {
	st2=st[st$Wellc!="E2 (10^-10) + R5020 (10^-10)",];
	st2=st2[st2$Wellc!="E2 + Prolactin",];
	st2=st2[st2$Wellc!="1mg/ml",];
	st2=st2[st2$Wellc!="E2(10^-9)",];
	st2[st2$Plate!="P1",];
}

filterwells <- function (st) {
	st
}


####################################### hack to clean names###################################

filtertreat <- function (treat) {
	treat2= str_replace_all(treat,  fixed("10^-"), "");
	treat2= str_replace_all(treat2,  fixed(")"), "");
	treat2= str_replace_all(treat2,  fixed("("), "");
	treat2= str_replace_all(treat2,  fixed(" "), "");
	treat2= str_replace_all(treat2,  fixed("Prolactin"), "Plac");
	treat2= str_replace_all(treat2,  fixed("E210"), "E2");
	treat2= str_replace_all(treat2,  fixed("M"), "");
	
	treat2= str_replace_all(treat2,"[[:digit:]]","");
	treat2
}


filtertreat <- function (treat) {
	treat2= str_replace_all(treat,  fixed("10M"), "10");
	treat2= str_replace_all(treat2,  fixed(" (10^-10)"), "");
	treat2= str_replace_all(treat2,  fixed("  "), " ");
	
	treat2
}
filtertreat <- function (treat) {
	
	treat
}





####################################### load clean and prepare data###################################
addVar <- function (st,var,fun,newvar,secondvar="") {
	if(checkvar(st,var))
	{
		if(secondvar!=""){
			if(checkvar(st,secondvar)){
				st[[newvar]]<-fun(st[[var]],st[[secondvar]]);
			}
		}else{
			st[[newvar]]<-fun(st[[var]]);			
		}		
		
	}
	return(st);
}
renameVar <- function (st,var,newvar) {
	if(checkvar(st,var))
	{
		colnames(st)[colnames(st)==var] <- newvar;
	}
	return(st);
}


filterPro <- function (st,filter,withh) {
	if (withh){
		return(drop.levels(st[str_detect(st$Treatment,filter),]))
	}
	if (!withh){
		return(drop.levels(st[!str_detect(st$Treatment,filter),]))
	}
}

initiate <- function (dir,addcond,file="all.csv",lumen=TRUE,tree=TRUE,filter="",filterwith=TRUE,speccond=c(""),versioncounter=4) {
	st=read.csv(file=paste(dir,file,sep=""),head=TRUE,sep=",");
	
	####add conditions to the data
	
	if(addcond=="external"){
		filee=paste(dir,"conditions",".csv",sep="");
		if(!file.exists(filee)){
			message("*** Conditions.csv does not exist, this is not going to work!");
			stop();
		}
		n=dim(st)[2];
		
		cond=as.matrix(read.csv(file=filee,head=TRUE,sep=","));
		m=dim(cond)[2];
		if(m<4){
			cond=as.matrix(read.csv(file=filee,head=TRUE,sep="	"));
			m=dim(cond)[2];		
		}
		
		if(m<4){
			message("*** Conditions.csv is not fine. Check that it is comma separated and has all required columns (at least 4: filename[name], experiment[plate], replicate[well],condition[any]).");
			stop();
		}
		if(dim(cond)[1]<3){
			message("*** Conditions.csv is not fine. Check that it is comma separated and has at least two rows.");
			stop();
		}
		if(anyDuplicated(cond[,1])>1){
			message("*** There are several files with the same name in conditions.csv, or its format is wrong. ");
			stop();
		}
		stringintoaccount=1;
		while(anyDuplicated(substring(cond[,1],1,stringintoaccount))){
			stringintoaccount=stringintoaccount+1;
		}
		
		lm=dim(cond)[1];
		l=dim(st)[1];	
		stcond<-array("a", dim=c(l,m));
		colnames(stcond)<-c(colnames(cond)[2:m],"Treatment");
		hits=0;
		for (i in 1:(lm)){
			idd=which(substring(st$filename,1,stringintoaccount) == substring(cond[i,1],1,stringintoaccount));
			if(length(idd)>1){hits=hits+1;}
			stcond[idd,1:(m-1)]<-t(array(cond[i,2:m], dim=c(m-1,length(idd))));
			stcond[idd,m]<-array(paste(cond[i,4:m],collapse=" "),dim=c(length(idd),1));
		}
		if(hits<3){
			message("*** The filenames from SAMA-image don't match the ones in conditions.csv. You should check conditions.csv and its format.");
			stop();
		}		
		st<-cbind(st,stcond);
	}
	if(addcond=="double"){
		n=dim(st)[2];
		st[n+1]<- factor(paste(st$RMF,st$Collagen)) ;
		colnames(st)[n+1] <- "Treatment";
	}
	
	
	#st$filename<-paste(substring(st$filename,1,7),str_extract(st$Treatment,"BPA ......."));
	#################filter by conditions
	if(filter!=""){
		st=filterPro(st,filter,filterwith);
	}
	
	if(length(speccond)>1){
		st=drop.levels(st[multcompor(st$Treatment,speccond),]);
	}
	if(length(levels(st$Treatment))==1)
	{message("** I find only one condition in your selected dataset. Check your conditions.csv if that is not on purpose.");}
	#################add descriptive variables
	n=dim(st)[2];
	st$Treatment= filtertreat(st$Treatment);
	st[n+1]<- paste(st$Plate,st$Well,st$Treatment);
	colnames(st)[n+1] <- "Well0";
	
	st[n+2]<- paste(st$Plate,st$Well) ;
	colnames(st)[n+2] <- "Well1";
	st[n+3]<- paste(st$Treatment) ;
	colnames(st)[n+3] <- "Wellc";
	if (is.null(st$filename)){
		st$filename <- st$Well0 ;
	}else{
		st$filename<-substring(st$filename,1,stringintoaccount); 
	} 
	
	#################rename for compatibility between different versions
	st=renameVar(st,"Ell_Elon","Elon1")
	st=renameVar(st,"Ell_Flatness","Elon2")
	st=renameVar(st,"Comp..unit.","Comp")
	
	st=st[st$Elon2<3,];
	
	#################corrections
	
	st$RatioVolEllipsoid<-simplify2array(lapply(st[["RatioVolEllipsoid"]],caps))
	
	#################apply various function
	
	#st<-st[st$day!=1,]
	tologqtt=c("Ell_MajRad","Feret..unit.","Moment1","Moment2","Moment3","Moment4","Moment5","Thickness_Mean", "Thickness_SD", "Thickness_Max")
	
	for (i in tologqtt){
		st=addVar(st,i,log,paste("log",i,sep=""));
	}
	st=addVar(st,"Vol..unit.",log,"logvol");
	st=addVar(st,"Comp",function(x) x^(1/3),"Sphericity");
	st=addVar(st,"Elon1",function(x) log(x -1),"logElon1");
	st=addVar(st,"Elon2",function(x) log(x -1),"logElon2");
	st=addVar(st,"RatioVolEllipsoid",function(x) -log(1.01-x ),"logRatioVolEllipsoid");
	st=addVar(st,"RatioVolbox",function(x) -log(1.01-x ),"logRatioVolbox");
	st=addVar(st,"SurfMeshSmooth..unit.",function(x,y) -(log(1-(y/(4*pi/3))^2/(x/(4*pi))^3)),"sphericity2",secondvar="Vol..unit.");
	st=addVar(st,"VolHull..unit.",function(x,y) -(log(1-y/x)),"ratiovolHull",secondvar="Vol..unit.");
	st=addVar(st,"Elon1",function(x,y) x-y,"Quality",secondvar="Elon2");
	st=addVar(st,"Thickness_Mean",function(x,y) x/y^(1/3),"rThickness_Mean",secondvar="Vol..unit.");
	st=addVar(st,"Thickness_SD",function(x,y) x/y^(1/3),"rThickness_SD",secondvar="Vol..unit.");
	st=addVar(st,"Thickness_Max",function(x,y) x/y^(1/3),"rThickness_Max",secondvar="Vol..unit.");
	st=addVar(st,"Thickness_Mean",function(x,y) log(x+1),"logThickness_Mean");
	st=addVar(st,"Thickness_SD",function(x,y) log(x+1),"logThickness_SD");
	st=addVar(st,"Thickness_Max",function(x,y) log(x+1),"logThickness_Max");
	st=addVar(st,"Thickness_Max",function(x,y) x/(y+0.000001),"rbThickness_Max",secondvar="Thickness_Mean");
	st=addVar(st,"Thickness_SD",function(x,y) x/(y+0.000001),"rbThickness_SD",secondvar="Thickness_Mean");
	st=addVar(st,"Elon1",function(x,y) (log(x/y)),"ShapeScore",secondvar="RatioVolEllipsoid");
	st=addVar(st,"ShapeScore",function(x) x<0.5,"score01");
	st=addVar(st,"ShapeScore",function(x) x<0.75,"score02");

	###########lumen
	if(lumen){
		st=addVar(st,"volum.lumens..unit.",function(x,y) x/y,"lumenosity",secondvar="Vol..unit.");
		st=addVar(st,"volum.lumens..unit.",function(x) (0.01<x),"lumen");
		st=addVar(st,"Quality",function(x,y) x+5*y,"Quality",secondvar="lumenosity");
	}
	###########tree
	n=dim(st)[2];
	
	if(tree){
		listl=sapply(st[["lengths"]],strtovec)
		st$complexity<- sapply(listl,complexity1) ;
		st$complexity2<- sapply(listl,complexity2) ;
		st$complexity3<- sapply(listl,complexity3);
		st$complexity4<- sapply(listl,complexity4);
	}
	#elengthss=as.numeric(scan(textConnection(st[["elengths"]]), what="character", sep=" "));
	st
}

exportF <- function (dir,addcond,file="all.csv",lumen=TRUE,tree=TRUE,filter="",filterwith=TRUE,versioncounter=4) {
	st=initiate(dir,addcond,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,versioncounter=versioncounter);
	write.csv(st,paste(outt(dir),"all_export.csv",sep="")); 
}

#######################################get conditions###################################

getconditions <- function (dir,addcond,versioncounter=4) {
	st=initiate(dir,addcond,lumen=FALSE,tree=FALSE,versioncounter=versioncounter);
	tt=cbind(levels(st$Treatment),1);
	rownames(tt)=levels(st$Treatment);
	write.csv(tt,paste(dir,"combinedcdt.csv",sep=""),row.names = T,quote=F); 
}

#######################################plot averages###################################


coarseplot <- function (dir,addcond,crical=-100,lumencri=FALSE,file="all.csv",lumen=TRUE,tree=TRUE,filter="",filterwith=TRUE,speccond=c(""),specname="",crisize=-1,versioncounter=4,label="welltreat",center=FALSE,withpca=TRUE,colorr=T,byplate=F) {
message("**RSAMA=0.9976**");	
st=initiate(dir,addcond,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,speccond=speccond,versioncounter=versioncounter);
	strc="";
	pcaplate=F;
	
	if(length(speccond)!=1){
		strc=specname;
	}
	qtt=observables(st,lumen=lumen,tree=tree,versioncounter=versioncounter);
	qttlog=observables(st,lumen=lumen,tree=tree,versioncounter=versioncounter,logs=FALSE);

	outputname="coarseplot";
	if(byplate){
		outputname="reproducibility";
		temp=st[["Treatment"]];
		st$Treatment=st[["Plate"]];
		st$Plate=temp;
		pcaplate=T;
	}
	
	if (filter!=""){
		aa=if(filterwith) "with_" else "without_" ;
		strc=paste(strc,aa,filter,"_",sep="");
	}   
	
	st=st[crisize<st[["Vol..unit."]],];
	strc=paste(strc,"Size",crisize,"_",sep="");
	
	if(-99<crical){
		st=st[crical<st$Quality,];
		strc=paste(strc,"Q",crical,"_",sep="");
	}
	# st=st[st[["Elon2"]]<5,];
	if(lumencri){
		st=st[st$lumen,];
		strc=paste(strc,"with_lumen_",sep="");
	}
	
	if (center){
		strc=paste(strc,"centered","_",sep="");
	}    
	#st=st[st$Plate!="P1",];
	st=filterwells(st); 
	if(dim(st)[1]<=1){
		message(paste("* There is not enough structures of the selected kind:",strc));
		
	}
	else{
		#st=st[0<st$complexity1,];
		aggdata <-aggregate(st, by=list(filenameB=st$filename,wellB=st$Well1,well=st$Well0,PlateB=st$Plate,TreatmentB=st$Treatment,cond=st$Wellc),FUN=mean, na.rm=TRUE)
		aggdatastd <-aggregate(st, by=list(filenameB=st$filename,wellB=st$Well1,well=st$Well0,PlateB=st$Plate,TreatmentB=st$Treatment,cond=st$Wellc),FUN=sd, na.rm=TRUE)
		aggdatam <-aggregate(st, by=list(filenameB=st$filename,wellB=st$Well1,well=st$Well0,PlateB=st$Plate,TreatmentB=st$Treatment,cond=st$Wellc),FUN=coefvar)
		aggdatamd <-aggregate(st, by=list(filenameB=st$filename,wellB=st$Well1,well=st$Well0,PlateB=st$Plate,TreatmentB=st$Treatment,cond=st$Wellc),FUN=median.data.frame, na.rm=TRUE)
		names=c("Mean","Coefficient of variation","Standard deviation","Median");
		datass=list(aggdata,aggdatam,aggdatastd,aggdatamd);
		
		aggdatact <-aggregate(st, by=list(well=st$Well0,TreatmentB=st$Treatment,cond=st$Wellc),FUN=lengthh)
		
		pdf(file = paste(outt(dir),strc,outputname,".pdf",sep=""),pointsize=10,paper="letter",title=paste(strc,"coarseplot"))
		
		if (colorr){
			colfill<-c("blue","deeppink","forestgreen","sienna","darkmagenta","red","grey")
		}else{
			colfill<-gray.colors(as.integer(length(levels(as.factor(aggdata$TreatmentB)))), start = 0.1, end = 0.8);
		}
		ltyy=c(1,2,4,5,6);
		ltyy=c(ltyy,ltyy,ltyy);
		lwdd=2;
		sm.options(col=colfill,lty=ltyy,lwd=lwdd)
		cyl.f <- factor(aggdatact$TreatmentB)
		#remove conditions without at least 2 points
		for (j in levels(cyl.f)){
			if(dim(aggdatact[aggdatact$TreatmentB==j,])[1]<=1){
				message(paste("* Condition",j,"removed for",strc,"not enough structures to get 2 datapoints!"));
				aggdatact=aggdatact[aggdatact$TreatmentB!=j,];
			}
		}
		aggdatact=drop.levels(aggdatact);
		cyl.f <- factor(aggdatact$TreatmentB)
		if(length(levels(cyl.f))<=1){
			message(paste("** There is only one condition when filtering for ",strc));
			pp2="NA";
		}else{pp2=anova(aov(aggdatact[["Elon1"]]~aggdatact$TreatmentB, data=aggdatact))[1,5];}
		#pp=wilcox.test(aggdatact[["Elon1"]]~aggdatact$TreatmentB, data=aggdatact)$p.value;
		sm.density.compare(aggdatact[["Elon1"]], cyl.f,xlab=paste("count",pp2), col=colfill,lty=ltyy,lwd=lwdd); 
		legend("topright",levels(cyl.f), fill=colfill); 
		title("Number of structure in each well.");
		
		opar <- par() 
		for (i in 1:4){
			aggdata0=datass[[i]];
			aggdata0=aggdata0[complete.cases(aggdata0$Elon1),];
			aggdata0=drop.levels(aggdata0);
			name=names[[i]];
			print(name);
			write.csv(aggdata0,paste(outt(dir),strc,outputname,"_",name,".csv",sep=""),row.names = T,quote=F); 
			cyl.f <- factor(aggdata0$TreatmentB);
			
			#remove conditions without at least 2 points
			for (j in levels(cyl.f)){
				if(dim(aggdata0[aggdata0$TreatmentB==j,])[1]<=1){
					aggdata0=aggdata0[aggdata0$TreatmentB!=j,];
				}
			}
			aggdata0=drop.levels(aggdata0);
			cyl.f <- factor(aggdata0$TreatmentB);
			
			
			#}else{
			agg=aggdata0[,qttlog];
			supl=dim(agg)[2]+1;
			agg$TreatmentB<- as.factor(aggdata0$TreatmentB);
			several_plates=length(levels(as.factor(aggdata0$PlateB)))>1;
			if (several_plates && pcaplate) {
				agg$PlateB<- aggdata0$PlateB;
				qualisup=c(supl,supl+1)
			}else{
				qualisup=c(supl);
			}
			labell=c("ind","ind.sup", "quali", "var", "quanti.sup");
			tempwell<-paste(1:length(aggdata0$well),aggdata0$well);
			if(label=="Treatment And Plate"){
				rownames(agg)<-aggdata0$well;
			}
			if(label=="Plate"){
				rownames(agg)<-paste(as.numeric(aggdata0$TreatmentB),aggdata0$wellB);
			}
			if(label=="Treatment"){
				rownames(agg)<-paste(as.numeric(factor(aggdata0$wellB)),aggdata0$TreatmentB);
			}  
			if(label=="Filename"){
				rownames(agg)<-aggdata0$filenameB;
			}
			if(label=="None"){
				labell=c("ind.sup", "quali", "var", "quanti.sup");		
			}	
			if(withpca){
			print(agg);
				nncp=10
				pc.cr <- PCA(agg, scale.unit=TRUE, ncp=nncp, graph=F,quali.sup=qualisup);
				aggdata0=cbind(aggdata0,pc.cr$ind$coord);
				maxpca=0;
				for (i in 1:5){
					pcaname=paste("Dim.",i,sep="");
					if (!is.null(aggdata0[[pcaname]])){
						qtt=c(qtt,pcaname);
						maxpca=i;
					}
				}
			}
#			for (h in c("TreatmentB",qtt)){print(h); print(aggdata0[[h]]);}
			aggdata1=aggdata0[,c("TreatmentB",qtt)];
			meaa=(aggregate(aggdata1, by=list(TreatmentC=aggdata1$TreatmentB),FUN=mean, na.rm=TRUE));
			sdd=(aggregate(aggdata1, by=list(TreatmentC=aggdata1$TreatmentB),FUN=sd, na.rm=TRUE));
			droplevels
			par(opar);
			par(mfrow=c(3,2),oma=c(4,0,2,0));
			k=1;
			aggdata0$TreatmentB=as.factor(aggdata0$TreatmentB);
			for (j in qtt)
			{	pp="";
				pp2="";
				if(length(levels(aggdata0$TreatmentB))>1){
					if ((i==1)&&(substring(j,1,4)!="Dim.")){
						mod2 <- aov(st[[j]]~st$Treatment+Error(st$Well0), data=st)
						ttt=summary(mod2);
						ttt=simplify2array(ttt[["Error: st$Well0"]])
						pp2=simplify2array(ttt[5])[1,1]
					}else{
						pp2=anova(aov(aggdata0[[j]]~aggdata0$TreatmentB, data=aggdata0))[1,5];
					}
					pp2=signif(pp2, digits = 2);
					if(length(levels(aggdata0$TreatmentB))==2){
						pp=signif(wilcox.test(aggdata0[[j]]~aggdata0$TreatmentB, data=aggdata0)$p.value, digits = 2);
					}
				}
				#twocp=TukeyHSD(aov(aggdata0[[j]]~aggdata0$TreatmentB, data=aggdata0));
				#ss=twocp[["aggdata0$TreatmentB"]]
				#ss=ss[,4]
				#sig=ss[ss<0.05]
				 #print(name);
				#print(j);
				#print(sig);
				#print(((aggdata0$TreatmentB)));
				#print(pp2)
				sm.density.compare(aggdata0[[j]], cyl.f,xlab=paste(j,name,pp,pp2), col=colfill,lty=ltyy,lwd=lwdd);
				namee=paste(signif(t(meaa[[j]]), digits = 3),"±",signif(t(sdd[[j]]), digits = 2),sep="");
				
				boxplot(aggdata0[[j]]~aggdata0$TreatmentB,border =colfill,ylab=paste(j,name),las=2,names=namee,show.names=T);				
				
				
				if(k%%3==1){
					mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
				}
				if(k%%3==0){
					par(fig = c(0, 1, 0, 1), oma = c(0, 0, 0, 0), mar = c(0, 0, 0, 0), new = TRUE)
					plot(0, 0, type = "n", bty = "n", xaxt = "n", yaxt = "n")
					legend("bottom", levels(cyl.f), xpd = TRUE, inset = c(0,0), bty = "n", col = colfill, cex = 1.2,ncol=2,lty=ltyy,lwd=lwdd)
					par(opar);
					par(mfrow=c(3,2),oma=c(4,0,2,0));
				}
				k=k+1;
			}
			aggdata2 <-aggregate(aggdata0, by=list(PlateBB=aggdata0$PlateB),FUN=mean, na.rm=TRUE)
			if (center){
				ff=c("P1","P2","P3")
				for (i in ff){
					for (j in which((aggdata0$PlateB==i)==TRUE)){
						aggdata0[j,qttlog]=aggdata0[j,qttlog]- aggdata2[aggdata2$PlateBB==i,qttlog]
					}
				}  
			}
			if(withpca){
				concat = cbind.data.frame(as.factor(agg[,supl]),pc.cr$ind$coord)
				#print(concat);
				ellipse.coord = coord.ellipse(concat,bary=F, axes = c(1, 2))
				ellipse.coorda = coord.ellipse(concat,bary=T, axes = c(3, 4))
				
				par(mfrow=c(1,1),oma=c(0,0,2,0));
				#plot.PCA(pc.cr, axes=c(1,2 ), choix="ind",graph.type="classic")
				plot.PCA(pc.cr, axes=c(1,2 ), choix="var",graph.type="classic")
				mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
				plot.PCA(pc.cr, axes=c(1,2 ), choix="ind",habillage=supl,ellipse=ellipse.coord,cex=1,palette=palette(colfill),col.quali="black",label=labell,graph.type="classic")
				#plot.PCA(pc.cr, axes=c(1,2 ), choix="ind",habillage=supl,cex=1,palette=palette(colfill),col.quali="black",label=labell)
				mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
				
				#plot.PCA(pc.cr, axes=c(3,4 ), choix="var",graph.type="classic")
				#mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
				#plot.PCA(pc.cr, axes=c(3,4 ), choix="ind",habillage=supl,ellipse=ellipse.coorda,cex=1,palette=palette(colfill),col.quali="black",label=labell,graph.type="classic")
				#mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
					
				
				
				#plot.PCA(pc.cr, axes=c(4,1 ), choix="ind",habillage=supl,ellipse=ellipse.coorda,cex=0.8)
				#mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);	
				#if (several_plates){
				#concat = cbind.data.frame(agg[,supl+1],pc.cr$ind$coord)
				#ellipse.coordy = coord.ellipse(concat,bary=T, axes = c(1, 2))
				#plot.PCA(pc.cr, axes=c(1,2 ), choix="ind",habillage=supl+1,ellipse=ellipse.coordy,cex=0.8)
				#mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
				#}
				if(TRUE){ 
					rownames(agg)<-tempwell;   
					pc.cr <- PCA(agg, scale.unit=TRUE, ncp=nncp, graph=F,quali.sup=qualisup);	    
				}    
				
				#demoflex <- agnes(pc.cr$ind$coord[,c(1:4)],method='ward',par.method=c(0.625,0.625,-0.25))
				#demoflex2 <- agnes(pc.cr$ind$coord[,c(3,4)],method='ward',par.method=c(0.625,0.625,-0.25))
				#plot(as.hclust(demoflex),xlab=paste(name, "dimension 1 to 4"))
				demoflex <- as.dendrogram(agnes(pc.cr$ind$coord[,c(1:min(4,maxpca))],method='ward',par.method=c(0.625,0.625,-0.25)))
				demoflex <- color_labels(demoflex,col=colfill[as.integer(agg[order.dendrogram(demoflex),supl])] )
				#plot((demoflex),xlab=paste(name, "dimension 1 to 4"))
				par(mai=c(3,0.5,0.5,0.5));
				
				plot(demoflex, hang = -1);
				mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
				#plot(as.hclust(demoflex2),xlab=paste(name, "dimension 1 to 8"))
				#mtext(c(name),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
			}
			
		}
		dev.off();
		return(aggdata);
	}
}

#######################################plot averages with classic filters###################################

coarseplotall <- function (dir,crical,addcond,file="all.csv",lumen=TRUE,tree=TRUE,filter="",filterwith=TRUE,speccond=c(""),specname="",versioncounter=4,label="welltreat",center=FALSE,crisize=500,withpca=T,colorr=T,byplate=F) {
	coarseplot(dir,addcond,crical=-100,lumencri=FALSE,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,speccond=speccond,specname=specname,crisize=0,versioncounter=versioncounter,label=label,center=center,withpca=withpca,colorr=colorr,byplate=byplate)
	coarseplot(dir,addcond,crical=-100,lumencri=FALSE,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,speccond=speccond,specname=specname,crisize=crisize,versioncounter=versioncounter,label=label,center=center,withpca=withpca,colorr=colorr,byplate=byplate)	
	coarseplot(dir,addcond,crical=-100,lumencri=FALSE,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,speccond=speccond,specname=specname,crisize=crisize*2,versioncounter=versioncounter,label=label,center=center,withpca=withpca,colorr=colorr,byplate=byplate)
	coarseplot(dir,addcond,crical=-100,lumencri=FALSE,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,speccond=speccond,specname=specname,crisize=crisize*4,versioncounter=versioncounter,label=label,center=center,withpca=withpca,colorr=colorr,byplate=byplate)    
	coarseplot(dir,addcond,crical=crical,lumencri=FALSE,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,speccond=speccond,specname=specname,crisize=crisize,versioncounter=versioncounter,label=label,center=center,withpca=withpca,colorr=colorr,byplate=byplate)
	if(lumen){	coarseplot(dir,addcond,crical=-100,lumencri=TRUE,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,speccond=speccond,specname=specname,crisize=crisize,versioncounter=versioncounter,label=label,center=center,withpca=withpca,colorr=colorr,byplate=byplate)
		coarseplot(dir,addcond,crical=crical,lumencri=TRUE,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,speccond=speccond,specname=specname,crisize=crisize,versioncounter=versioncounter,label=label,center=center,withpca=withpca,colorr=colorr,byplate=byplate)
	}
}

#######################################plot distributions###################################

welldisplot0 <- function (dir,addcond,crical=-100,lumencri=FALSE,file="all.csv",lumen=TRUE,tree=TRUE,filter="",filterwith=TRUE,versioncounter=4,crisize=0,colorr=T) {
	st=initiate(dir,addcond,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,versioncounter=versioncounter);
	
	strc="";
	qtt=observables(st,lumen=lumen,tree=tree,versioncounter=versioncounter,thres=FALSE);
	
	st=filterwells(st);
	
	if (filter!=""){
		aa=if(filterwith) "with_" else "without_" ;
		strc=paste(strc,aa,filter,"_",sep="");
	}   
	
	if(0<crisize){
		st=st[crisize<st[["Vol..unit."]],];
		strc=paste(strc,"Size",crisize,"_",sep="");
	}
	if(-99<crical){
		st=st[crical<st$Quality,];
		strc=paste(strc,"Q",crical,"_",sep="");
	}
	# st=st[st[["Elon2"]]<5,];
	if(lumencri){
		st=st[st$lumen,];
		strc=paste(strc,"with_lumen_",sep="");
	}
	
	pdf(file = paste(outt(dir),strc,"distribution",".pdf",sep=""),pointsize=11)
	ltyy=c(1,2,4,5,6);
	ltyy=c(ltyy,ltyy,ltyy);
	lwdd=2;
	if (colorr){
		colfill<-c("blue","deeppink","forestgreen","sienna","darkmagenta","red","grey")
	}else{
		colfill<-gray.colors(as.integer(length(levels(as.factor(aggdata$TreatmentB)))), start = 0.1, end = 0.8);
	}
	sm.options(nbins=10, h = 0.1,lty=ltyy,lwd=lwdd,col=colfill)
	
	# colfill<-c("blue","deeppink","red","black","darkmagenta","forestgreen")
	
	qtt2=levels(factor(st$Wellc));
	cyl.f <- factor(st$filename)			
	for (kji in levels(cyl.f)){
		if(dim(st[st$filename==kji,])[1]<=1){
			message(paste("* file",kji,"removed, not enough structures!"));
		}
	}
	
	for (j in qtt){
		par(mfrow=c(1,2),oma=c(0,0,2,0))
		k=1
		for (i in qtt2)
		{
			st2<-st[st$Wellc==i,]
			#well1
			cyl.f <- factor(st2$filename)			
			
			for (kji in levels(cyl.f)){
				if(dim(st2[st2$filename==kji,])[1]<=1){
					st2=st2[st2$filename!=kji,];
				}
			}
			st2=drop.levels(st2);
			cyl.f <- factor(st2$filename)
			if (length(levels(cyl.f))>1)
			{
				if(length(levels(factor(st2[["Plate"]])))>1){
					pp1=signif(anova(aov(st2[[j]]~st2[["Plate"]], data=st2))[1,5],digits=2);
				}else{pp1="NA";}
				
				pp2=signif(anova(aov(st2[[j]]~st2[["filename"]], data=st2))[1,5],digits=2);
				
				sm.density.compare((st2[[j]]),col=colfill, cyl.f,xlab=paste("sig. of: Plate",pp1,"Well",pp2),lwd=lwdd)
				title(i);
				legend("topright",levels(cyl.f), fill=colfill)
				if(k%%2==1){
					mtext(c(paste(j)),c(NORTH<-3),line=0.4, cex=1.2, col="black", outer=TRUE, font=2);
				}
				
				k=k+1;
			}else{if(j==qtt[1])  message(paste("* condition",i,"removed, no replicates with enough structures!"));}
		}
	}
	dev.off()
}
welldisplot <- function (dir,addcond,crical=-100,lumencri=FALSE,file="all.csv",lumen=TRUE,tree=TRUE,filter="",filterwith=TRUE,versioncounter=4,crisize=0,colorr=T) {
	welldisplot0(dir,addcond,crical=crical,lumencri=lumencri,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,crisize=0*crisize,versioncounter=versioncounter,colorr=colorr);
		welldisplot0(dir,addcond,crical=crical,lumencri=lumencri,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,crisize=1*crisize,versioncounter=versioncounter,colorr=colorr);
	welldisplot0(dir,addcond,crical=crical,lumencri=lumencri,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,crisize=2*crisize,versioncounter=versioncounter,colorr=colorr);
	welldisplot0(dir,addcond,crical=crical,lumencri=lumencri,file=file,lumen=lumen,tree=tree,filter=filter,filterwith=filterwith,crisize=4*crisize,versioncounter=versioncounter,colorr=colorr);
}
