---
title: Quantities
eleventyNavigation:
  key: Quantities
  parent: SAMA
  order: 6
---

Summary of the relevant quantities, by order of appearance in the pdf produced.

## Basic morphometrics

Note: axis refers to the axis when fitting the structure to an [ellipsoid](https://en.wikipedia.org/wiki/Ellipsoid).

*   "**Quality**" Elon1-Elon2 without lumen analysis. Elon1-Elon2+5*lumenosity with lumen analysis.

Proportions of the structure:

*   **"Elon1"** elongation: length of the main axis of the structure/length of the second axis of the structure
*   **"logElon1"** Logarithm of Elon1-1 .
*   **"Elon2"** flatness: length of the second axis of the structure/length of the third axis of the structure
*   **"logElon2"** Logarithm of Elon2 -1.

Sizes

*   **"logvol"** Logarithm of the volume of the structure, in units (ex: µm³).
*   "**logEll_MajRad**" logarithm of the length of the largest axis of the structure.
*   "**logFerret**" logarithm of the largest distance between two points of the structure.

Comparison with other shapes

*   **"Sphericity"** ratio of volume to area set to 1 for spheres (and smaller for any other shape). That is S³=36 pi V²/A³.
*   **"RatioVolEllipsoid"** volume of the structure / volume of the embeding ellipsoid. Describes how convoluted the structure is that is to say how different from en ellipsoid it is.
*   **"logRatioVolEllipsoid"** Logarithm of 1-RatioVolEllipsoid.
*   **"RatioVolbox"** Volume of the structure/ Volume of its bounding box.
*   **"logRatioVolbox"** Logarithm 1-RatioVolbox.
*   "**logMoment1**" "**logMoment2**" "**logMoment3**" logarithms of the three moments invariant by rotation and translation discussed in Sadjadi, Firooz A.; Hall, Ernest L., "Three-Dimensional Moment Invariants," in _Pattern Analysis and Machine Intelligence, IEEE Transactions on_ , vol.PAMI-2, no.2, pp.127-136, March 1980 doi: 10.1109/TPAMI.1980.4766990  
    [http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=4766990&isnumber=4766983](http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=4766990&isnumber=4766983)
*   "**logMoment4**" "**logMoment5**" Moments also invariant by scaling.

## Thickness measures (from bonej)

Thickness is a quantity that can be computed for every point inside a structure: it is the radius of the largest ball which contains this point and that fit inside the structure.

*   "**Thickness_Mean**" Each structure is represented by its mean thickness.
*   "**Thickness_SD**" Each structure is represented by the standard deviation of its thickness.
*   "**Thickness_Max**" Each structure is represented by the thickness of its thickest point.
*   "**logThickness_Mean**", "**logThickness_SD**", "**logThickness_Max**" Logarithm of the above.
*   "**rThickness_Mean**" reduced thickness: Mean Thickness / volume of the structure (power 1/3, to compare a length with a length)
*   "**rThickness_SD**" same for standard deviation.
*   "**rThickness_Max**" same for maximum.
*   "**rbThickness_SD**" standard deviation / mean
*   "**rbThickness_Max**" max/ mean

## Lumen analysis

*   "**lumenosity**" volume of lumen / volume of the structure
*   "**lumen**" 1 if there is a lumen 0 otherwise. (when the mean is applied, it is the proportion of structures with lumena).

## Branching analysis

*   "**complexity**" logarithm of the number of branches of the skeleton.
*   "**complexity2**" 0 if there is one branch and 1 if there is 2 branches or more.
*   "**complexity3**" logarithm of the cumulative length of branches.
*   "**complexity4**" "entropy" of the branches (sum -p log(p) with p=length of the branch/ cumulative length of branches).

## PCA analysis

*   "**Dim.1**" "**Dim.2**" "**Dim.3**" "**Dim.4**" "**Dim.5**" The first 5 dimension from pca analysis. The variable taken into account depend on the analysis options (with or without lumen analysis, branching analysis, etc.).
