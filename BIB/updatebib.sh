 #!/bin/bash
 array=(
"2020-Montevil-CodeForDisruption" "2020-Montevil-HistoricityHeartBiology" "InPress-Montevil-ConceptualTheoreticalSpecifications" "submitted-Montevil-EntropiesAnthropoceneCrisis" "2020-MSL-AnthropoceneExosomatizationNegentropy" "2019-SM-EntretienSurLentropie" "2019-SM-EntretienSurLentropiea" "2018-LM-BigDataKnowledge" "2018-MLS-CenturyGeneThat" "2020-MSL-Chapitre1" "2019-LM-PhysicsBiologyExtending" "2020-MM-IdentityOrganismsScientific" "2018-Montevil-FewPendingChallenges" "2019-Montevil-WhichFirstPrinciples" "2020-Montevil-DeLoeuvreDe" "Submitted-Montevil-LeSensDes" "2017-MP-HitchhikersGuideCancer" "2016-SLM-BiologicalDefaultState" "2016-MML-TheoreticalPrinciplesBiology" "2016-MMP-TheoreticalPrinciplesBiology" "2016-MSS-ModelingMammaryOrganogenesis" "2016-SLN-CenturyGenomeCentury" "2018-ML-BigDataBiological" "2019-Montevil-PossibilitySpacesNotion" "2017-MM-UneBreveDiscussion" "2018-GM-RepetitionEtReversibilite" "2017-GM-RepetitionReversibilityEvolution" "2015-MM-BiologicalOrganisationAs" "2011-BLM-2DimensionalGeometry" "2014-BSQ-SingleCellsTissues" "2014-LM-PerspectivesOrganismsBiological" "2012-LM-RandomnessIncreasesOrder" "2012-LM-InertVsLiving" "2011-LM-ProtentionRetentionBiological" "2011-LM-PhysicsBiologyExtending" "2012-LMK-NoEntailingLaws" "2014-LMP-LincompressibleComplexiteDu" "2012-LMP-BottomApproachesLevels" "2012-Montevil-GeometrieDuTemps" "2019-Montevil-MeasurementBiologyIs" "2020-MAS-CombinedMorphometricStatistical" "2018-MAS-NtpClarityBpa" "2011-Montevil-TempsBiologiqueEt" "2019-Montevil-AnalysesDouvrages" "2017-LM-LogicBiologyVia" "2018-Montevil-PrimerMathematicalModeling" "2017-LM-ComparingSymmetriesModels" "2014-LM-IntroductionNewPerspectives" "2016-PMS-SamaMethod3d" "2015-Montevil-ChangementsDeSymetrie" "2017-LM-BigDataEt" "2017-MLS-DuSiecleDu" "2014-PMF-EcologicalModelsGene" "2014-PM-EcologicalModelsGene" "2014-LM-ScalingScaleSymmetries" "2017-Montevil-PhilosophicalAccountsBiological" "2013-LM-ExtendedCriticalityPhase")

pandoc-citeproc --bib2json bibM.bib  > bibM.json
cp -f bibM.bib ../src/assets/bib/bibM.bib
mv -f bibM.json ../src/_data/bibM.json

for i in "${array[@]}"; do  
    bibtool  -X "$i"  bibM.bib -o "$i".bib
    mv -f "$i".bib ../src/assets/bib/"$i".bib
done
