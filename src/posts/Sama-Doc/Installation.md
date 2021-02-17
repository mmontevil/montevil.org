---
title: Installation of SAMA
date: 2016-05-02
eleventyNavigation:
  key: Installation
  parent: SAMA
  order: 1
---

# Dependencies

## Programs required:

If they are not already installed, install FIJI and R.

*   FIJI - *[http://fiji.sc/Installation](http://fiji.sc/Installation)*
*   R - [<u>http://cran.r-project.org/</u>](http://cran.r-project.org/)

*WARNING for Microsoft Windows users:* it is better to install R and fiji outside Program Files to avoid problems of permissions.

## FIJI Plugins required:

*   3D imageJ suite [http://imagejdocu.tudor.lu/doku.php?id=plugin:stacks:3d_ij_suite:start](http://imagejdocu.tudor.lu/doku.php?id=plugin:stacks:3d_ij_suite:start). 
As of now, Sama is compatible with version 3.5 and later.
This plugin can be installed by going to _help> update fiji_. And in the new window going to _Manage update sites_ and activating the 3D ImageJ Suite.

## Optional FIJI Plugins:

*   BoneJ [http://bonej.org/#install](http://bonej.org/#install)
*   Puredenoise [http://bigwww.epfl.ch/algorithms/denoise/](http://bigwww.epfl.ch/algorithms/denoise/)

# Installation of Sama

*   Download SAMA:

[http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/Sama.zip](http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/Sama.zip)

*   Extract Sama.zip and copy the SAMA folder in the plugins folder of FIJI.
*   (Re)start FIJI.
*   In FIJI , run _Plugin>Sama>install or update R component_. Then select install in the dialog and hit ok. This process will install the required R packages, including the R SAMA components.
*   *Windows only:* SAMA will ask you for the path to the R executable. It usually is in /root folder/R/R-x.x.x/bin/. In case of a mistake, it is possible to change this path in SAMA > updateR. Let us recall that R should not be installed in Program files because of issues with permissions.
