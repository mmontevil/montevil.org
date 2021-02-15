---
title: SAMA-analyze
eleventyNavigation:
  key: analyze
  parent: SAMA
  order: 4
---

_This plugin analyzes all the data generated from images processed in SAMA-images._

# **Preliminary: setConditions**

***Important***: Before starting SAMA-analyze, it **is MANDATORY to save a file “conditions.csv”** __**in “SAMA-image data” folder and** __**describing every image stack**. Users should either start from the template (conditions.csv) provided [here](http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/conditions.csv) or use the macro **setconditions** which will create automatically the id of every images and guide the user to input the other required informations._

To edit conditions.csv, Excel or Open Office can be used and the file should be saved in the .csv format (coma separated value). The different columns have to be separated by **commas**. It is also possible to do the changes with a text editor (wordpad).

The conditions.csv file has 4 columns or more:

1.  **name**: corresponds to the filename of the image (which has to be a unique code).
2.  **Plate**: This is the experiment # and is used to analyze reproducibility of experiments.
3.  **Well**: This is the replicate # within each experiment to analyze reproducibility within each experiment.
4.  All the remaining columns will be considered a **treatment** column and at least one is needed. Those are the name/condition of the experimental treatments and will be used in the data graphs. Several columns can be used If needed (for example one column for the cell type and one for the hormones).

# SAMA-analyze

*   **Were these parameters analyzed?**

Choose the parameters that you have processed with Sama-images. Note that basic morphometrics is always performed and does not require any of these options.

*   **Data handling**

    *   *Put data together:* ***Important:*** this part has to be run once after any changes in sama-images for them to be taken into account.

    *   *Export sheet:* This option produces a sheet with the data of all structure in “Sama-analyze output”, called all-export.csv. This sheet is intended for use with your favorite statistical analysis / plotting software.

*   **Data analysis**

    *   *Batch analyze treatment effect:* produces pdfs named to summarize the data. Several pdfs are produced: by filtering the acceptable structures with:
no filter (with the prefix size0) / size above size threshold (see below) / above 2*size threshold / above 4*size threshold / quality above quality threshold and size above size threshold / structures with lumen and size above size threshold.
Corresponding sheets are also produced if the user wants to produce alternative plots with another software.

    *   *Analyze reproducibility:* produces pdf to check the consistency of the data between plates and between replicates. Note that if there is only one experiment performed, this part will have limited results.

See below for a description of the graphs.

*   **Choose a subset of the conditions?**

This option will lead to another dialog in order to select the condition to be shown on graphs. The user has two ways to achieve this:

The user can use a filtering system on the treatments: for example choosing Only Treatments WITH criterium: E2, will show only the data which have “E2” in their description.

Alternatively, there is a manual choice option which enables to pick the conditions to be plotted manually, and add a custom string to the pdfs name obtained for convenience.

*   **Options for analysis**

    *    *Quality threshold:* see Batch analyze treatment effect.
    *    *Size threshold:* see Batch analyze treatment effect. The threshold is for the volume and is in the same unit than the scale of the image (typically in µm which leads then to µm³).

*   **Options for graphs**

    *   *Choose labels in PCA.* The possible option are: _none, treatment, treatment and plate, plate, filename._ This option aim to workaround the label overcrowding when there are too many points by choosing the information displayed.
    *   *Color graphs:* this option produces color graph, when unchecked the graphs are black and white.
