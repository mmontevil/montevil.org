 #!/bin/bash
 array=(
"2016-Theory-Morphogenesis" "2020-Montevil-CodeForDisruption" "2020-Montevil-Historicity-Heart-Biology" "2021-Montevil-Theory-Accuracy-Medicine" "submitted-Montevil-Entropies-Anthropocene" "2020-MSL-Anthropocene-Exosomatization-Negentropy" "2019-SM-Entretien-Entropie-1" "2019-SM-Entretien-Entropie-2" "2018-ML-Big-Data-Biology" "2018-MLS-Gene-Century-Organism" "2019-LM-Extending-Criticality-Extended" "2020-MM-Identity-Organism" "2018-Montevil-Perspective-from-theory" "2019-Montevil-First-Principles-Biology" "2020-Montevil-Turing-Biology" "2021-Sens-Formes-biologie" "2017-MP-Hitchhikers-Guide-Cancer" "2016-SLM-Theoretical-Principle-Default-State" "2016-MML-Theoretical-Principles-Organization" "2016-MMP-Theoretical-Principles-Variation" "2016-MSS-Modeling-Organogenesis-Principles" "2016-SLN-Conclusion-Century-Organism" "2018-ML-BigDataBiological" "2019-Montevil-Possibility-Spaces-Novelty" "2017-MM-Une-Breve-Discussion" "2018-GM-Repetition-Reversibilite" "2017-GM-Repetition-Reversibility-Evolution" "2015-MM-Organisation-Closure-Constraints" "2011-BLM-2D-Time-Biology" "2014-BSQ-Tissues-Collagen-Time" "2014-LM-Perspectives-Organisms" "2012-LM-Randomness-Order-Evolution" "2012-LM-Inert-Vs-Living" "2011-LM-Protention-Retention-Biology" "2011-LM-Biology-Extending-Criticality" "2012-LMK-No-Entailing-Laws-Enablement" "2014-LMP-Incompressible-Complexite" "2012-LMP-Levels-Organization-Criticality" "2012-Montevil-Geometrie-Temps-Biologique" "2019-Montevil-Measurement-Biology-Theory" "2020-MAS-Morphometric-Clarity-Bpa" "2018-MAS-NtpClarityBpa" "2011-Montevil-Temps-Biologique-These" "2019-Montevil-Varennes-Models" "2017-LM-Logic-Physics-Biology" "2018-Montevil-Primer-Mathematical-Modeling" "2017-LM-Comparing-Symmetries-Models" "2014-LM-Introduction-New-Perspectives" "2016-PMS-Sama-Method-Morphometry" "2015-Montevil-Symetrie-Objectivation-Vivant" "2017-LM-Big-Data-Connaissance" "2017-MLS-Siecle-Organisme" "2014-PMF-Ecological-Models-Cells-Genes" "2014-PM-Ecological-Models-Cells" "2014-LM-ScalingScaleSymmetries" "2017-Montevil-Garson-Functions" "2013-LM-Extended-Criticality-Enablement" "2015-LMS-Search-Principles-Organisms" "2021-Montevil-Stiegler-Sciences-Entropocene" "2016-SLN-Century-Organism" "2020-MSL-Anthropocene-Exosomatisation-Negentropie")
rm -fr ../src/assets/bib/*.bib
pandoc-citeproc --bib2json bibM.bib  > bibM.json
pandoc-citeproc --bib2json bibconf.bib  > bibconf.json
node bibjson.js   > bibconf2.json

cp -f bibM.bib ../src/assets/bib/bibM.bib
mv -f bibM.json ../src/_data/bibM.json
mv -f bibconf.json ../src/_data/bibconf.json
mv -f bibconf2.json ../src/_data/bibconf2.json

for i in "${array[@]}"; do  
    bibtool  -X "$i"  bibM.bib -o "$i".bib
    mv -f "$i".bib ../src/assets/bib/"$i".bib
done
