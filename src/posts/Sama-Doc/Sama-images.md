---
title: SAMA-images
excerpt:  3D structures are counted and parameters that define shape, volume and position are measured.
date: 2016-05-04
eleventyNavigation:
  key: images
  parent: SAMA
  order: 3
---

_**Important:**_

*   _Computation may take a long time depending on the number of images, their size and the computer used. SAMA-images is designed to separate automatic parts (tier 1 and 3) which require a substancial amount of computing time from the interactive part which is fast to avoid waiting time._

# Tier 1:

*   *Basic morphometrics:* 3D structures are counted and parameters that define shape, volume and position are measured. These data are saved in an excel spreadsheet in SAMA-image data. The threshold is set by default to 30.
*   *Additional filtering:* 3 choices: "none", "Enhance boundaries" which consolidates the luminosity boundaries in order to have more stable outcomes, less dependant on the threshold and "Split neighbors" which tries to separate structure that are touching yet distinct (might generate artifacts).
*   *Check threshold for basic morphometrics* enables the user to choose an image. The image will be preprocessed and the user will be asked to choose a valid threshold.
*   *Compute convex hull:* This is an option for the basic morphometrics. By default this has been unchecked. While this option gives complementary parameters about the shape of the structures, we rely on a function of 3D suite which is not completely stable and may abort the process.
*   *Lumen measurement:* In this step, the images are processed and stored in SAMA-prelumen analysis for further analysis in Tiers 2 and 3.
*   *Branching measurement:* In this step, the images are processed and branching is analyzed by the 3d Skeleton plugin.
*   *Thickness measurement:* By default this has been unchecked because it requires BoneJ. Similar to Convex hull option, this option gives useful parameters about the branching of the structures but is memory-consuming. See: Hildebrand T, Rüegsegger P (1997) A new method for the model-independent assessment of thickness in three-dimensional images. J. Microsc. 185: 67-75\. doi:[10.1046/j.1365-2818.1997.1340694.x](http://dx.doi.org/10.1046/j.1365-2818.1997.1340694.x).

# Tier 2:

The user sets the threshold sfor lumen analysis after the lumen analysis part of tier 1 has been performed. In this step, the user determines a threshold value for lumen in the images. If the user checks this option, the program will first run through Tier 1 and then pause at Tier 2\. The first image in SAMA-Prelumen analysis will be opened and a user interface asks the user to choose a threshold. Once the user selects the optimum threshold, the program will continue to open the other images in the folder one at a time for the same action.

The user should aim for a threshold where the boundary of the lumen are above the threshold (in red) and the lumen is below (i.e. dark).

# Tier 3:

The final lumen measurement is done. Once the user has defined all the threshold of the images in Tier 2, this step automatically carries out the final analysis of the lumen parameters.
