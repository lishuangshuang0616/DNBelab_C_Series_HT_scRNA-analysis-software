# Release Notes

**Release history of DNBelab C Series™ HT Single-Cell Analysis Software**

[Latest Release](#latest-release) • [Published Releases](#release-history) • [Version Guide](#version-selection-guide)

## Latest Release <a id="latest-release"></a>

**dnbc4tools 3.2 — source documentation (unreleased)**, updated October 23, 2026.

The formal release date, installation package and checksums await confirmation. The latest release documented before this update was 3.1 (May 15, 2026).

### 3.2 changes <a id="32-source"></a>

- C6 probe-barcode sample assignment, per-sample calling/analysis, independent RNA reports and batch comparisons.
- Canonical RNA/ATAC matrix paths with H5 exports; complete compressed C6 `singlecell.csv.gz`, including background and zero-UMI rows.
- Explicit ATAC defaults: ordmag calling, cutsite peak signal/matrix, all merged fragments for peak input, optional final fragment/TSS thresholds and low-targeting filtering.
- Validated STAR arguments, GTF conflict policy, consistent parameter types and dark-cycle rules.
- Preflight diagnostics, structured errors, run locks/checkpoints, safer batch script publication and automatic BAM resource scheduling.
- Rust summary/matrix/BAM paths reduce redundant processing and use bounded intermediate handling. Actual speed and memory depend on the task; no universal speedup is claimed.

See the [Upgrade Guide](migration.md) for behavior changes and matched Python/native requirements. Use the header menu to open the frozen 3.1 manual.

## Published Release History <a id="release-history"></a>

### 3.1 (May 15, 2026) <a id="31-may-15-2026"></a>

#### Multi-omics Analysis

<ul>
  <li><strong>New Multi-omics Mode</strong>: Added support for single-sample multi-omics analysis. Now supports RNA + VDJ combined analysis or individual omics analysis.</li>
</ul>

#### RNA Analysis Enhancements

<ul>
  <li><strong>Consistent Cell Analysis</strong>: Added new parameter <em>--consistent_cells</em> to enable analysis using existing merged results and cell assignments for consistent downstream processing.</li>
</ul>

#### RNA Analysis Bug Fixes

<ul>
  <li><strong>Fraction Reads in Cells</strong>: Fixed calculation error in "fraction reads in cells" metric.</li>
  <li><strong>Species Database</strong>: Fixed bug that occurs when single species contains underscore "_" in dual-species database.</li>
</ul>

#### Performance Optimization

<ul>
  <li><strong>Speed Improvement</strong>: Optimized processing speed for bam2fastq and fqsubC4 tools.</li>
</ul>

#### Configuration & CLI Fixes

<ul>
  <li><strong>CLI Consistency</strong>: Standardized help text and metavar formatting across modules, including multi-sample commands.</li>
</ul>

## Previous Version Notes (3.0 and Earlier) <a id="legacy-version-notes"></a>

The previous release records are listed below in reverse chronological order:

<details markdown="block">
<summary><strong>3.0 (Dec 18, 2025)</strong></summary>

#### RNA-Seq Enhancements

<ul>
  <li><strong>Alignment & Annotation</strong>: Refined prioritization of exonic loci to improve quantification accuracy and resolve multi-gene mapping ambiguities.</li>
  <li><strong>Barcode Processing</strong>: Implemented error correction logic for cell barcodes containing ambiguous 'N' bases.</li>
  <li><strong>Dual-Species Support</strong>: Added robust support for building and analyzing mixed-species reference genomes.</li>
  <li><strong>Output Improvements</strong>: Enriched BAM files with cell tags (CC/CB), updated feature matrices to include gene ID, gene name, and library type.</li>
  <li><strong>Parameter Updates</strong>: Introduced automatic estimation for <em>expectcells</em> and added a new <em>minumi</em> threshold parameter.</li>
</ul>

#### ATAC-Seq Enhancements

<ul>
  <li><strong>QC & Reporting</strong>: Expanded QC metrics to include barcode/read Q30 statistics and insert size distributions derived from deduplicated fragments.</li>
  <li><strong>Technical Updates</strong>: Upgraded alignment engine to chromap v0.3.3, enhanced barcode correction algorithms, and enriched BAM outputs.</li>
</ul>

#### VDJ Enhancements

<ul>
  <li><strong>Assembly & Annotation</strong>: Advanced per-cell assembly algorithms to maximize full-length contig recovery with stricter filtering criteria.</li>
  <li><strong>Performance</strong>: Optimized memory management to eliminate the need for full data preloading during analysis.</li>
  <li><strong>Output & Reporting</strong>: Enhanced <em>contig_annotations.csv</em> with comprehensive details, improved QC metrics, and added consensus sequence annotations.</li>
  <li><strong>Compatibility</strong>: Enabled support for custom reference generation for non-human/mouse species.</li>
</ul>

#### Cross-Module Improvements

<ul>
  <li><strong>Parameter Standardization</strong>: Unified the <em>customize</em> parameter usage across all analysis modules.</li>
  <li><strong>Storage Efficiency</strong>: Achieved significant reduction in disk usage through optimized file organization.</li>
  <li><strong>Workflow Optimization</strong>: Deprecated the <em>process</em> parameter and automated the cleanup of intermediate files to streamline execution.</li>
</ul>

</details>

<details markdown="block">
<summary><strong>2.1.3 (October 9, 2024)</strong></summary>



#### New Features

  <ul>
    <li>Added RNA 5' transcriptome analysis module</li>
    <li>Added single-cell VDJ analysis module</li>
    <li>GTF file format checking and correction functionality</li>
  </ul>


#### Installation & Performance

  <ul>
    <li>Released as tar.gz with no additional environment configuration needed</li>
    <li>Removed conda installation method</li>
    <li>Fixed memory exceptions in scATAC bead merging</li>
    <li>Optimized RNA alignment and interval annotation performance</li>
  </ul>

</details>

<details markdown="block">
<summary><strong>2.1.2 (April 24, 2024)</strong></summary>



#### ATAC Analysis Improvements

  <ul>
    <li>Updated algorithm: Jaccard-based merging → cell calling via peak fragments</li>
    <li>Added multiple filtering parameters and BAM format support</li>
    <li>Enhanced chloroplast handling in database construction</li>
    <li>Unified web report style with RNA analysis</li>
  </ul>


#### General Improvements

  <ul>
    <li>Streamlined installation process (removed R package requirements)</li>
    <li>Improved N filtering logic for cell barcodes and UMI regions</li>
  </ul>

</details>

<details markdown="block">
<summary><strong>2.1.1 (September 21, 2023)</strong></summary>



#### RNA Workflow Optimization

  <ul>
    <li>Bead merging analysis using oligo data before cell calling</li>
    <li>Enhanced marker gene display (top 50 genes by log2 fold change per population)</li>
  </ul>


#### Bug Fixes

  <ul>
    <li>Fixed high memory usage in container versions</li>
    <li>Resolved ATAC report image display issues</li>
  </ul>

</details>

<details markdown="block">
<summary><strong>2.1.0 (July 28, 2023)</strong></summary>



#### Major Addition

  <ul>
    <li><strong>New ATAC analysis module</strong></li>
  </ul>


#### RNA Module Updates

  <ul>
    <li>Optimized reference database construction with <em>ref.json</em> information file</li>
    <li>Replaced Seurat with Scanpy for faster dimensionality reduction and clustering</li>
  </ul>

</details>

<details markdown="block">
<summary><strong>2.0.7 (November 4, 2022)</strong></summary>



#### Automation & Parameters

  <ul>
    <li>Automatic recognition of reagent versions and sequencing dark cycles</li>
    <li>New parameters: <em>chemistry</em>, <em>darkreaction</em>, <em>customize</em> (replacing <em>cDNAconfig</em>/<em>oligoconfig</em>)</li>
    <li>Removed <em>mixseq</em> parameter</li>
  </ul>


#### Technical Improvements

  <ul>
    <li>Added adapter sequence trimming for RNA cDNA libraries</li>
    <li>Memory parameter <em>limitram</em> for database construction with automatic optimization</li>
  </ul>

</details>

<details markdown="block">
<summary><strong>2.0.6 (September 19, 2022)</strong></summary>



#### Container & Reliability

  <ul>
    <li>Added Singularity container support</li>
    <li>Fixed reproducibility issues for consistent results</li>
    <li>Corrected cDNA library Q30 statistics and barcode count consistency</li>
  </ul>

</details>

<details markdown="block">
<summary><strong>2.0.5 (August 19, 2022)</strong></summary>



#### Container & Format Support

  <ul>
    <li>Added Docker image version</li>
    <li>Reduced GTF format requirements (flexible gene_name/transcript_name handling)</li>
    <li>Improved UMI correction logic and HTML report descriptions</li>
  </ul>

</details>

<details markdown="block">
<summary><strong>2.0.0 (June 20, 2022)</strong></summary>



#### Major Release

  <ul>
    <li><strong>Command-line interface support</strong></li>
    <li>Enhanced workflow stability and error handling</li>
    <li>Optimized alignment and annotation performance</li>
    <li>Default emptydrops cell identification method</li>
    <li>Added saturation analysis and cell cluster annotation</li>
  </ul>

</details>

## Version Selection Guide <a id="version-selection-guide"></a>

<table>
  <thead>
    <tr>
      <th>Version</th>
      <th>Key Features</th>
      <th>Recommended Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>3.1+</b></td>
      <td>Multi-omics (RNA + VDJ)</td>
      <td>RNA + VDJ combined analysis</td>
    </tr>
    <tr>
      <td><b>2.1.3+</b></td>
      <td>RNA 5', VDJ</td>
      <td>VDJ, 5' RNA</td>
    </tr>
    <tr>
      <td><b>2.1.0+</b></td>
      <td>ATAC analysis support</td>
      <td>ATAC-seq analysis</td>
    </tr>
    <tr>
      <td><b>2.0.0+</b></td>
      <td>Command-line interface</td>
      <td>Standard 3' RNA analysis</td>
    </tr>
  </tbody>
</table>

### Historical Versions

Detailed download links and installation instructions for older versions are available in the [Previous Installation Guide](installation_previous.md). Additional information can be found at [GitHub Releases](https://github.com/MGI-tech-bioinformatics/DNBelab_C_Series_HT_scRNA-analysis-software/releases).

> **Release Guidance**:
> - **Stable**: Recommended for production environments; receives security and critical bug fixes.
> - **Release Candidate (RC)**: Feature-complete builds intended for final validation and staging/pre-production. Minor bug fixes may still be applied.
> - **Beta**: For testing and development only; APIs and behavior may change.

---

*For detailed installation and usage instructions, see the [Installation Guide](installation.md) and [Quick Start](quickstart.md).*
