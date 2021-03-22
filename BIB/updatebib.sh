 #!/bin/bash

array=($(cat bibM.bib | awk -e ' /@.*,/ {print $0}'| awk -e ' gsub(/.*\{/,"" ) {print $0}' | awk -e ' gsub(/,/,"" ) {print $0}'))

rm -fr ../src/assets/bib/*.bib
pandoc -f bibtex -t csljson bibM.bib  > bibM.json
pandoc -f bibtex -t csljson  bibconf.bib  > bibconf.json
node bibjson.js   > bibconf2.json

cp -f bibM.bib ../src/assets/bib/bibM.bib
mv -f bibM.json ../src/_data/bibM.json
mv -f bibconf.json ../src/_data/bibconf.json
mv -f bibconf2.json ../src/_data/bibconf2.json

for i in "${array[@]}"; do  
    bibtool  -X "$i"  bibM.bib -o "$i".bib
    mv -f "$i".bib ../src/assets/bib/"$i".bib
done
