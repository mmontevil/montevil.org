 #!/bin/bash
 array=(
"2020-Montevil-CodeForDisruption" "2020-Montevil-Historicity-Heart-Biology" "2021-Montevil-Theory-Accuracy-Medicine" "submitted-Montevil-EntropiesAnthropoceneCrisis" "2020-MSL-AnthropoceneExosomatizationNegentropy" "2019-SM-EntretienSurLentropie" "2019-SM-EntretienSurLentropiea" "2018-LM-BigDataKnowledge" "2018-MLS-Gene-Century-Organism" "2020-MSL-Chapitre1" "2019-LM-PhysicsBiologyExtending" "2020-MM-Identity-Organism" "2018-Montevil-FewPendingChallenges" "2019-Montevil-WhichFirstPrinciples" "2020-Montevil-DeLoeuvreDe" "2021-Sens-Formes-biologie" "2017-MP-Hitchhikers-Guide-Cancer" "2016-SLM-Theoretical-Principle-Default-State" "2016-MML-Theoretical-Principles-Organization" "2016-MMP-Theoretical-Principles-Variation" "2016-MSS-Modeling-Organogenesis-Principles" "2016-SLN-Conclusion-Century-Organism" "2018-ML-BigDataBiological" "2019-Montevil-Possibility-Spaces-Novelty" "2017-MM-UneBreveDiscussion" "2018-GM-Repetition-Reversibilite" "2017-GM-RepetitionReversibilityEvolution" "2015-MM-Organisation-Closure-Constraints" "2011-BLM-2D-Time-Biology" "2014-BSQ-Tissues-Collagen-Time" "2014-LM-PerspectivesOrganismsBiological" "2012-LM-Randomness-Order-Evolution" "2012-LM-Inert-Vs-Living" "2011-LM-Protention-Retention-Biology" "2011-LM-Biology-Extending-Criticality" "2012-LMK-No-Entailing-Laws-Enablement" "2014-LMP-Incompressible-Complexite" "2012-LMP-Levels-Organization-Criticality" "2012-Montevil-Geometrie-Temps-Biologique" "2019-Montevil-Measurement-Biology-Theory" "2020-MAS-Morphometric-Clarity-Bpa" "2018-MAS-NtpClarityBpa" "2011-Montevil-TempsBiologiqueEt" "2019-Montevil-AnalysesDouvrages" "2017-LM-Logic-Physics-Biology" "2018-Montevil-Primer-Mathematical-Modeling" "2017-LM-ComparingSymmetriesModels" "2014-LM-IntroductionNewPerspectives" "2016-PMS-Sama-Method-Morphometry" "2015-Montevil-Symetrie-Objectivation-Vivant" "2017-LM-BigDataEt" "2017-MLS-Siecle-Organisme" "2014-PMF-Ecological-Models-Cells-Genes" "2014-PM-Ecological-Models-Cells" "2014-LM-ScalingScaleSymmetries" "2017-Montevil-PhilosophicalAccountsBiological" "2013-LM-Extended-Criticality-Enablement")
rm -fr ../src/assets/bib/*.bib
pandoc-citeproc --bib2json bibM.bib  > bibM.json
cp -f bibM.bib ../src/assets/bib/bibM.bib
mv -f bibM.json ../src/_data/bibM.json

for i in "${array[@]}"; do  
    bibtool  -X "$i"  bibM.bib -o "$i".bib
    mv -f "$i".bib ../src/assets/bib/"$i".bib
done