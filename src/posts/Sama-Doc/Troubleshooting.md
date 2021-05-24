---
title: Troubleshooting
date: 2016-05-08
excerpt: "Documentation for Software for Automated Morphological Analysis : troubleshooting."
eleventyNavigation:
  key: Trouble
  parent: SAMA
  order: 7
illustration: 
  src: /posts/Sama-Doc/sama1.png
tags: 
  - computer software
  - image analysis
  - image processing
  - morphometry
  - open source software
---
# Check list

*   The folder with original images contains only the original images.
*   Conditions.csv is in the _SAMA-images data_ folder, and the columns are separated by commas.
*   RoiManager3D 3.52 is not currently compatible with Java versions newer that version 6 on mac. While a fix is planned, currently, this incompatibility will stop SAMA from running. To work around this issue, delete JavaAppletPlugin.plugin  from your applications folder and then install the legacy Java 6 runtime for OS X ([https://support.apple.com/kb/DL1572?locale=en_US](https://support.apple.com/kb/DL1572?locale=en_US)) and install.
