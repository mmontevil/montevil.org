//SAMA
version=0.9972;
//Copyright (C) 2015 Maël Montévil and Tessie Paulose 

//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.

//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.

//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

OS=getInfo("os.name");
print(OS);
print("***************************");

items=newArray("Install","Update");
if (startsWith(OS,"Windows")){
    items=newArray("Install","Update","Change R path");
}

Dialog.create("Choose action");
Dialog.addChoice("	Choose action", items);
Dialog.show();
filterwith=Dialog.getChoice();
print("Sarting R Sama updater version "+version);

command="repos <- \"http://cran.r-project.org\";";
if(filterwith=="Install")
{
  command="source(\"http://montevil.org/assets/sama/install.r\")";
}
if(filterwith=="Update")
{   
  command="source(\"http://montevil.org/assets/sama/update.r\")";
}

if(filterwith=="Change R path")
{    call("R_bind_sama.chooseRpath");
}else{
res=call("R_bind_sama.execCode",command);
}
print("***************************");

