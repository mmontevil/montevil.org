---
excerpt: Documentation for Software for Automated Morphological Analysis, a method by which epithelial structures grown in 3D cultures can be imaged, reconstructed and analyzed.
noToc: true
hasFullText: false
titlePrefix: "Documentation for "
eleventyNavigation:
  key: SAMA
  title: What is SAMA?
---


<div class="centerList" >
{{ collections.all | eleventyNavigation | eleventyNavigationToHtml(
    {
    activeListItemClass: "selected-A", 
    activeKey: eleventyNavigation.key
    })  |safe }} 
</div>
<div class="indent">
<hr>

# What is SAMA? 

Software for Automated Morphological Analysis or SAMA is a plugin that is operated via the imaging platform, FIJI. Although the analysis is done using R, the user-friendly interface of SAMA integrates imaging and analysis in FIJI.

If you use SAMA, please refer to the [associated paper](#CitationAnchor).

SAMA aims to describe morphological aspects of many objects observed in 3d, in particular but not exclusively epithelial structures in 3d culture.

SAMA is released under the [Gnu Public License](http://www.gnu.org/licenses/gpl.html).

[Download SAMA](http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/Sama.zip) (compatible with windows, mac OSX and Linux)

[Download example dataset](http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/example_SAMA.zip)

[Alternative, computer generated example dataset.](http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/cgi.zip)

[Source code](http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/Rbind_source.zip) for the Rbind plugin

[Documentation](http://montevil.theobio.org/sites/montevil.theobio.org/files/sama/Sama-Documentation.pdf) for SAMA in pdf.

## Changelog

*   22 october 2015: compatibility with version 3.5 of 3D imagej suite and better handling of errors.
*   14 august 2015: compatibility with version 3.3 of 3D imagej suite
*   3 may 2015: first prerelease.

</div>
