 #!/bin/bash
 array=(
"Montevil-2020-CodeForDisruption" "Montevil-2020-HistoricityHeartBiology" "Montevil-submitted-ConceptualTheoreticalSpecifications" "Montevil-submitted-EntropiesAnthropoceneCrisis" "MSL-2020-AnthropoceneExosomatizationNegentropy" "SM-2019-EntretienSurLentropie" "SM-2019-EntretienSurLentropiea" "LM-2018-BigDataKnowledge" "MLS-2018-CenturyGeneThat" "GM-2018-RepetitionEtReversibilite" "MSL-2020-Chapitre1" "LM-2019-PhysicsBiologyExtending" "MM-2020-IdentityOrganismsScientific" "Montevil-2018-FewPendingChallenges" "Montevil-2019-WhichFirstPrinciples" "Montevil-2020-DeLoeuvreDe" "Montevil-Submitted-LeSensDes" "MP-2017-HitchhikersGuideCancer" "SLM-2016-BiologicalDefaultState" "MML-2016-TheoreticalPrinciplesBiology" "MMP-2016-TheoreticalPrinciplesBiology" "MH-2016-PhysicalBiologicalIndividuation" "MSS-2016-ModelingMammaryOrganogenesis" "SLN-2016-CenturyGenomeCentury" "ML-2018-BigDataBiological" "Montevil-2019-PossibilitySpacesNotion" "PMS-submitted-CrickInformationGiving" "PM-submitted-InterveningContinuousWorld" "LM-2017-RandomnessIncreasesComplexity" "MM-2017-UneBreveDiscussion" "GM-2018-RepetitionEtReversibilitea" "GM-2017-RepetitionReversibilityEvolution" "MM-2015-BiologicalOrganisationAs" "BLM-2011-2DimensionalGeometry" "BSQ-2014-SingleCellsTissues" "LM-2014-2DimensionalGeometry" "LM-2014-ProtentionRetentionBiological" "LM-2014-CriticalPhaseTransitions" "LM-2014-PhysicsBiologyExtending" "LM-2014-BiologicalPhaseSpaces" "LM-2014-BiologicalOrderAs" "LM-2014-PhilosophicalSurveyHow" "LM-2014-Introduction" "LM-2012-RandomnessIncreasesOrder" "LM-2014-PerspectivesOrganismsBiological" "LM-2012-RandomnessIncreasesOrdera" "LM-2012-InertVsLiving" "LM-2011-ProtentionRetentionBiological" "LM-2011-PhysicsBiologyExtending" "LMK-2012-NoEntailingLaws" "LMP-2014-LincompressibleComplexiteDu" "LMP-2012-BottomApproachesLevels" "Montevil-2012-GeometrieDuTemps" "Montevil-2019-MeasurementBiologyIs" "Montevil-submitted-TuringsWorkCurrent" "MAS-2020-CombinedMorphometricStatistical" "MAS-2018-NtpClarityBpa" "Montevil-2011-TempsBiologiqueEt" "Montevil-2018-OpenPeerCommentary" "Montevil-2019-AnalysesDouvrages" "LM-2017-LogicBiologyVia" "Montevil-2018-PrimerMathematicalModeling" "LM-2017-ComparingSymmetriesModels" "LM-2014-IntroductionNewPerspectives" "PMS-2016-SamaMethod3d" "Montevil-2015-ChangementsDeSymetrie" "LM-2017-BigDataEt" "MLS-2017-DuSiecleDu" "PMF-2014-EcologicalModelsGene" "PM-2014-EcologicalModelsGene" "LM-2014-ScalingScaleSymmetries" "Montevil-2017-PhilosophicalAccountsBiological" "LM-2014-SymmetrySymmetryBreakings" "LM-2013-ExtendedCriticalityPhase")

rm -f bibM.json
pandoc-citeproc --bib2json bibM.bib  > bibM.json

for i in "${array[@]}"; do  
    mkdir "$i"
    bibtool  -X "$i"  bibM.bib -o "$i".bib
    cd "$i"
    touch index.njk
    cd ..
done
