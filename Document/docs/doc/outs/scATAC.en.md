# scATAC Analysis Output

Single-Cell ATAC Sequencing Output File Guide

## Overview <a id="overview"></a>

After single-cell ATAC sequencing analysis is complete, a standardized structure of files and subdirectories is generated in the specified output directory for chromatin accessibility analysis and epigenomic research.

> **Tip**: All output files use standard formats compatible with mainstream single-cell epigenomic analysis tools (e.g., Signac, ArchR), adhering to internationally accepted data format standards.

## Directory Structure <a id="directory-structure"></a>

```
.
├── alignment.fragments.sorted.tagged.bam       # QC-filtered alignment results (requires 'need_bam' parameter for analysis)
├── alignment.fragments.sorted.tagged.bam.bai   # Index file for the alignment results
├── filtered_peak_bc_matrix/                         # Directory for the filtered peak matrix in MEX format
│   ├── barcodes.tsv.gz                         # Barcode information for filtered cells
│   ├── matrix.mtx.gz                           # Peak signal data in sparse matrix format for filtered data
│   └── peaks.bed.gz                            # Peak position information for filtered data
├── fragments.tsv.gz                            # Contains all fragments aligned to the genome
├── fragments.tsv.gz.tbi                        # Index file for fragments, for fast random access
├── filtered.fragments.tsv.gz                   # QC-filtered ATAC fragment file, containing only fragments from filtered cells
├── filtered.fragments.tsv.gz.tbi               # Tabix index for the filtered fragments file, for fast querying of genomic intervals
├── metrics_summary.xls                         # Summary table of analysis quality metrics
├── raw_peak_bc_matrix/                            # Directory for the raw peak matrix in MEX format
│   ├── barcodes.tsv.gz                         # Raw cell barcode information
│   ├── matrix.mtx.gz                           # Raw peak signal data in sparse matrix format
│   └── peaks.bed.gz                            # Raw peak position information
├── raw_peak_bc_matrix.h5
├── filtered_peak_bc_matrix.h5
├── singlecell.csv                              # Summary table of cell information
└── *_scATAC_report.html                        # Analysis report in HTML format
```

<a id="v32-outputs"></a>

Raw and filtered peak matrices also have H5 exports. Matrix counts default to cutsites; cell calling, FRIP and TSS fractions retain unique-fragment statistics. BAM requires `--need_bam`; indexes can be BAI or CSI.

## File Details <a id="file-details"></a>

### ATAC Fragment and Peak Files <a id="atac-fragment-and-peak-files"></a>

**Core Content**: ATAC-seq fragment information and peak identification results, containing complete chromatin accessibility data and cell barcode tags.

#### fragments.tsv.gz

`fragments.tsv.gz` is a compressed TSV file containing ATAC-seq fragment information, which is one of the core data for downstream analysis. Its main features and contents are as follows:

*   **Purpose**:
    *   **Chromatin Accessibility Analysis**: Precisely locate the genomic coordinates of each open chromatin region.
    *   **Data Visualization**: Can be directly loaded as a BED file in genome browsers like IGV and UCSC for visualization.
    *   **Downstream Tool Input**: Compatible with mainstream single-cell analysis tools such as ArchR and Signac.

*   **Content & Format**:
    *   The file is in **BED-like** format, with each row representing a unique ATAC-seq fragment.
    *   The file contains the **5 columns of information** as shown in the table below:

        <table>
        <thead>
        <tr>
        <th width="20%">Field Name</th>
        <th width="80%">Description</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><code>chrom</code></td>
        <td>The name of the reference genome chromosome, identifying the chromosomal location of the fragment.</td>
        </tr>
        <tr>
        <td><code>chromStart</code></td>
        <td>The adjusted start position of the fragment on the chromosome (0-based), corrected for the transposase cleavage site.</td>
        </tr>
        <tr>
        <td><code>chromEnd</code></td>
        <td>The adjusted end position of the fragment on the chromosome (exclusive), corrected for the transposase cleavage site.</td>
        </tr>
        <tr>
        <td><code>barcode</code></td>
        <td>The cell ID identifier, corresponding to the <code>CB</code> tag in the BAM file, used to assign the fragment to a specific cell.</td>
        </tr>
        <tr>
        <td><code>readSupport</code></td>
        <td>The total number of read pairs associated with this fragment (including unique and duplicate reads).</td>
        </tr>
        </tbody>
        </table>

*   **Coordinate Adjustment**:
    *   To accurately locate the transposase cleavage site, the fragment intervals in the file are adjusted: the start position is shifted 4bp forward from the leftmost alignment position, and the end position is shifted 5bp backward from the rightmost alignment position.

#### fragments.tsv.gz.tbi

The Tabix index file for `fragments.tsv.gz`.

*   **Core Purpose**:
    *   **Fast Data Access**: Allows for rapid, genome-interval-based querying of large `fragments.tsv.gz` files without reading the entire file.
    *   **Tool Performance Optimization**: Used by tools like ArchR, Signac, and IGV to load and process data from specific regions.
*   **Format**:
    *   A standard binary index file generated by the `tabix` tool.

#### filtered.fragments.tsv.gz

This is the ATAC-seq fragment file after cell quality control and filtering. It is a subset of `fragments.tsv.gz`, containing only fragments from high-quality cells.

*   **Core Purpose**:
    *   **Core Downstream Analysis**: This is the **recommended input file** for core downstream steps such as cell clustering and differential accessibility analysis.
    *   **Improved Signal-to-Noise Ratio**: Using this file improves the accuracy and signal-to-noise ratio of the analysis results by removing low-quality cells and background noise.
*   **Content & Format**:
    *   The file format is identical to `fragments.tsv.gz` (compressed BED-like TSV) and contains the same 5 columns.
    *   It includes only fragments from barcodes identified as "real cells" by the cell filtering algorithm (e.g., based on TSS enrichment and number of fragments in peaks).

#### filtered.fragments.tsv.gz.tbi

The Tabix index file for `filtered.fragments.tsv.gz`.

*   **Core Purpose**:
    *   **Downstream Analysis Support**: Ensures that downstream tools (like ArchR, Signac) can quickly access data from specific genomic regions when using the filtered fragment file.
*   **Format**:
    *   A standard binary index file generated by the `tabix` tool.

#### alignment.fragments.sorted.tagged.bam

This is the ATAC-seq alignment result file containing all fragments that have a valid barcode and were successfully aligned.

*   **Core Purpose**:
    *   **In-depth Analysis & Visualization**: Can be used in genome browsers like IGV for deep visualization to inspect alignments at specific loci.
    *   **Custom Analysis**: Provides the raw input for advanced users who need to directly manipulate alignment-level data.

*   **Content & Format**:
    *   Uses the international standard **BAM (Binary Alignment Map)** format.
    *   The file is **sorted by genomic coordinates** and indexed (with a `.bai` file) for fast random access.
    *   Each read is tagged with cell origin information via TAG fields.

*   **Key TAG Field Descriptions**:
    *   Cell and molecular barcode information is stored in the following TAG fields:

        <table>
        <thead>
        <tr>
        <th width="15%">Tag</th>
        <th width="15%">Type</th>
        <th width="70%">Description</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><code>CB</code></td>
        <td>Z</td>
        <td>Cell barcode identifier after error correction and cell merging.</td>
        </tr>
        <tr>
        <td><code>CC</code></td>
        <td>Z</td>
        <td>Error-corrected cell barcode sequence.</td>
        </tr>
        <tr>
        <td><code>CR</code></td>
        <td>Z</td>
        <td>Cell barcode sequence as reported by the sequencer.</td>
        </tr>
        </tbody>
        </table>

#### alignment.fragments.sorted.tagged.bam.bai

The index file for `alignment.fragments.sorted.tagged.bam`.

*   **Core Purpose**:
    *   **Fast Data Access**: Allows tools like IGV and Samtools to quickly jump to and read alignment data from any genomic region without loading the entire BAM file.
    *   **Performance Guarantee**: Essential for the performance of any tool that performs random access operations on the BAM file.
*   **Format**:
    *   Standard **BAI (BAM Index)** format generated by the `samtools index` command.

### Peak Matrix Files <a id="peak-matrix-files"></a>

**Core Content**: The single-cell peak signal count matrix, divided into raw and quality-controlled filtered data, using the standard sparse matrix format.

#### Filtered Peak Matrix (`filtered_peak_bc_matrix/`)

Contains the peak count matrix after high-quality cell filtering, serving as the core data for downstream quantitative analysis.

*   **Core Purpose**:
    *   **Downstream Quantitative Analysis**: The **primary input** for analyses such as cell clustering, differential accessibility analysis, and trajectory inference.
    *   **High-Quality Data**: Contains only barcodes identified as real cells, ensuring the accuracy of the analysis results.

*   **Content & Format**:
    *   Uses the standard **Matrix Market Exchange (MEX)** format, consisting of the following three compressed files:
        <table>
        <thead>
        <tr>
        <th width="25%">Filename</th>
        <th width="75%">Description</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><code>barcodes.tsv.gz</code></td>
        <td>A list of cell IDs, identifying high-quality cells that passed QC. Each line contains one cell ID, corresponding to a column in the matrix.</td>
        </tr>
        <tr>
        <td><code>peaks.bed.gz</code></td>
        <td>A file with peak region coordinates in BED format. Contains chromosome, start, and end positions, corresponding to a row in the matrix.</td>
        </tr>
        <tr>
        <td><code>matrix.mtx.gz</code></td>
        <td>The peak region count matrix in Matrix Market format. Contains matrix dimensions and the row, column, and value for non-zero elements.</td>
        </tr>
        </tbody>
        </table>

*   **Format Advantages**:
    *   **Space-Efficient**: The sparse matrix format (`.mtx`) saves significant storage space by only storing non-zero elements.
    *   **Highly Compatible**: The MEX format is a standard in the single-cell community, compatible with almost all mainstream analysis tools like Seurat, Signac, Scanpy, etc.

#### Raw Peak Matrix (`raw_peak_bc_matrix/`)

Contains the raw peak count matrix for all detected cell barcodes (without filtering).

*   **Core Purpose**:
    *   **Quality Control Assessment**: Can be used to evaluate the effectiveness of cell filtering or to perform manual filtering based on custom criteria.
    *   **Data Integrity**: Preserves all original data, which can be used for deep mining or re-analysis if needed.

*   **Content & Format**:
    *   Uses the standard **Matrix Market Exchange (MEX)** format, with the same file composition as the `filtered_peak_bc_matrix/` directory.
    *   Includes all detected barcodes, including high-quality cells, low-quality cells, and background droplets.

### Analysis Summary <a id="analysis-summary"></a>

**Core Content**: A summary of experimental quality assessment and statistical metrics, providing complete data quality control information.

#### metrics_summary.xls

An Excel-formatted summary table of key analysis metrics, providing a structured assessment of the overall experiment quality.

*   **Core Purpose**:
    *   **Quality Assessment**: Quickly evaluate key metrics such as sequencing data quality, alignment efficiency, and cell identification results.
    *   **Results Overview**: Provides a summary view of the analysis results without inspecting all files.

*   **Content & Format**:
    *   Contains key metrics from three main categories:
        <table>
        <thead>
        <tr>
        <th width="20%">Metric Category</th>
        <th width="80%">Includes</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><strong>Basic Stats</strong></td>
        <td>Basic sequencing metrics like total read pairs, valid barcode ratio, Q30 base quality, etc.</td>
        </tr>
        <tr>
        <td><strong>Cell Calling</strong></td>
        <td>Cell calling results like estimated number of cells, fraction of fragments in peaks, fraction of fragments in TSS, number of peaks detected, TSS enrichment, etc.</td>
        </tr>
        <tr>
        <td><strong>Alignment</strong></td>
        <td>Alignment statistics like genome alignment rate, mitochondrial DNA ratio, etc.</td>
        </tr>
        </tbody>
        </table>

    *   Includes built-in recommended quality control thresholds for user convenience:
        <details markdown="block" open>
        <summary><strong>Recommended Quality Thresholds:</strong></summary>
        <ul>
        <li><strong>Valid Barcode Ratio</strong>: >70%</li>
        <li><strong>Q30 Base Quality</strong>: >75% (Barcode and UMI regions)</li>
        <li><strong>Genome Alignment Rate</strong>: >50%</li>
        <li><strong>TSS Enrichment Score (Human/Mouse)</strong>: >4</li>
        <li><strong>Fraction of Fragments in Peaks</strong>: >15%</li>
        <li><strong>Fraction of Fragments in TSS</strong>: >10%</li>
        <li><strong>Percentage of Duplicate Reads</strong>: >10%</li>
        </ul>
        </details>

#### singlecell.csv

`singlecell.csv` includes `Cell,totalFrags,fragments,mt_region_fragments,chloroplast_region_fragments,TSS_region_fragments,blacklist_region_fragments,peaks_number,peak_region_fragments,peak_region_cutsites,is_cell_barcode,Cellbarcode`. The peak-region fragment and cutsite columns represent distinct counts. A missing cutsite statistic from an older tool is not zero.
A CSV-formatted table of cell-level quality control information, recording detailed statistics for each cell barcode.

*   **Core Purpose**:
    *   **Fine-grained QC**: Allows users to perform more detailed cell filtering and analysis based on custom criteria.
    *   **Downstream Analysis Input**: Can be used as cell metadata input for analysis tools like Signac and Scanpy.

*   **Content & Format**:
    *   Each row represents one cell barcode.
    *   Key columns include: number of fragments, number of peaks, number of fragments in TSS/peak regions, whether it is identified as a high-quality cell, bead merging information, etc.

#### *_scATAC_report.html

An interactive HTML report for reviewing analysis results.

*   **Core Purpose**:
    *   **Results Visualization**: Intuitively displays key analysis results such as QC metrics, cell clustering, and TSS enrichment in the form of interactive charts.
    *   **Results Interpretation**: Provides the biological significance and technical explanation of various metrics to help users interpret the data deeply.
    *   **Easy Sharing**: A single HTML file that is easy to circulate and share.

*   **Content & Format**:
    *   Can be opened in any modern browser without an internet connection.
    *   For a detailed interpretation of the report, please refer to the [Web Report Interpretation](#web-report-interpretation) section below.
    *   Key content modules included are as follows:
        <table>
        <thead>
        <tr>
        <th width="25%">Report Feature</th>
        <th width="75%">Description</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><strong>Interactive Charts</strong></td>
        <td>Interactive visualizations for QC metrics, cell clustering, peak analysis, etc.</td>
        </tr>
        <tr>
        <td><strong>Statistical Summary</strong></td>
        <td>A numerical summary and trend analysis of key performance indicators.</td>
        </tr>
        <tr>
        <td><strong>Detailed Interpretation</strong></td>
        <td>The biological significance and technical explanation of various metrics.</td>
        </tr>
        </tbody>
        </table>

## File Format Description <a id="file-format-description"></a>

**Technical Specification**: A detailed description of the standard formats used for the output files.

#### Matrix Market Format (`.mtx.gz`) <a id="market-matrix-format-mtxgz"></a>

Market Exchange Format (MEX) is a standard format for storing sparse count matrices in single-cell analysis, known for its space efficiency and high compatibility.

*   **Core Advantages**:
    *   **Space-Efficient**: The sparse matrix format only stores non-zero elements, which significantly saves storage space for single-cell data where over 95% of values are typically zero.
    *   **Highly Compatible**: As an international standard, it can be directly read by almost all mainstream analysis tools, including Seurat, Scanpy, and Signac.

*   **File Composition**:
    *   A complete MEX format dataset consists of the following **three files**:
        <table>
        <thead>
        <tr>
        <th width="25%"><strong>Filename</strong></th>
        <th width="75%"><strong>Description</strong></th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><code>matrix.mtx.gz</code></td>
        <td>A compressed sparse matrix file. The header contains matrix dimensions, and each subsequent line records the position (row/column index) and value of a non-zero element.</td>
        </tr>
        <tr>
        <td><code>barcodes.tsv.gz</code></td>
        <td>A compressed cell barcode file. Each line is a cell ID, and the line number corresponds to the matrix **column**.</td>
        </tr>
        <tr>
        <td><code>peaks.bed.gz</code></td>
        <td>A compressed feature (peak) file. Each line is a peak's coordinates in BED format, and the line number corresponds to the matrix **row**.</td>
        </tr>
        </tbody>
        </table>

## Web Report Interpretation <a id="web-report-interpretation"></a>

**Overview**: The HTML web report provides visual summaries and metric explanations for single-cell ATAC sequencing results, including key performance indicators for experimental quality and downstream analysis.

The HTML web report is the main entry point for reviewing single-cell ATAC sequencing results. It covers cell calling, fragment quality, TSS enrichment, peak-related metrics, and clustering results, and helps users identify metrics that require further review.

> **Usage Notes**: It is recommended to review the metrics in the order they are presented in the report.

> **Note**: The following standards are for reference only. Actual quality assessment should consider factors such as sample type, cell state, and experimental goals. Since significant differences can exist between samples, we recommend interpreting the results in the context of your specific experimental background.

### Main Report Content and Structure

<img src="../images/html_scatac1.png" alt="scATAC Web Report" width="500">

### Core Analysis Metrics Explained

#### Cell Metrics <a id="cell-metrics"></a>

**Core Function**: Cell identification, quality assessment, and chromatin accessibility statistics, providing key indicators for the overall effectiveness of the experiment.

**Quality Control Standards:**

<table>
<thead>
<tr>
<th width="25%">Metric Name</th>
<th width="30%">Recommended</th>
<th width="30%">Acceptable</th>
<th width="15%">Needs Improvement</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Median fragments per cell</strong></td>
<td>≥ 10,000</td>
<td>2,000–10,000</td>
<td>< 2,000</td>
</tr>
<tr>
<td><strong>Median fraction of fragments overlapping peaks</strong></td>
<td>≥ 30%</td>
<td>15–30%</td>
<td>< 15%</td>
</tr>
<tr>
<td><strong>Median fraction of fragments overlapping TSS</strong></td>
<td>≥ 20%</td>
<td>10–20%</td>
<td>< 10%</td>
</tr>
<tr>
<td><strong>Fraction fragments in cells</strong></td>
<td>≥ 50%</td>
<td>20–50%</td>
<td>< 20%</td>
</tr>
</tbody>
</table>

**Detailed Metric Explanations:**

<table>
<thead>
<tr>
<th width="30%">Metric Name</th>
<th width="70%">Detailed Explanation & Technical Requirements</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Estimated number of cells</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The total number of valid cells identified from the sequencing data (as distinct from background noise or empty droplets).</li>
<li><strong>Calculation Process</strong>: After merging barcodes from the same droplet, cells are filtered based on peak-overlapping fragment counts, TSS proportion, and related QC metrics.</li>
<li><strong>Interpretation</strong>: Compare this value with expected cell loading, fragment-count distribution, and filtering results. If it is much lower than expected, review sample integrity, library quality, and sequencing depth.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Species</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The species or reference genome version used for the analysis.</li>
<li><strong>Use case</strong>: Confirms whether the reference genome used for analysis matches the sample species. This is a basic item for result review and troubleshooting.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Median fragments per cell</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The median number of valid ATAC-seq fragments contained within a single cell.</li>
<li><strong>Use case</strong>: Assesses the number of valid fragments available for open-chromatin analysis in each cell and reflects sequencing coverage.</li>
<li><strong>Interpretation</strong>:
<ul>
<li><strong>High-Quality Standard</strong>: ≥ 10,000</li>
<li><strong>Recommended Minimum</strong>: ≥ 2,000</li>
</ul>
</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Mean raw read pairs per cell</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The average number of raw sequencing read pairs assigned to each cell.</li>
<li><strong>Calculation</strong>: `Total Raw Read Pairs / Estimated Number of Cells`</li>
<li><strong>Interpretation</strong>: A value of ≥ 25,000 is recommended to ensure adequate chromatin coverage. Lower values may reduce the stability of peak calling, clustering, and differential accessibility analysis.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Fraction overlapping peaks</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of a single cell's fragments that fall into identified open chromatin regions (Peaks).</li>
<li><strong>Use case</strong>: Key metric for ATAC signal specificity. A higher proportion indicates that valid fragments are more concentrated in open chromatin regions and background noise is relatively lower.</li>
<li><strong>Interpretation</strong>:
<ul><li><strong>Needs attention</strong>: If < 15%, review nuclei quality, transposition efficiency, peak calling results, and sequencing depth.</li></ul>
</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Fraction overlapping TSS</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of a single cell's fragments that fall within the ±2kb region of a Transcription Start Site (TSS).</li>
<li><strong>Use case</strong>: Assesses promoter-proximal open-chromatin signal and ATAC-seq library specificity.</li>
<li><strong>Interpretation</strong>:
<ul><li><strong>Needs attention</strong>: If < 10%, interpret together with the TSS enrichment profile, fragment length distribution, and sample preparation workflow.</li></ul>
</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Fraction of fragments in cells</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of all valid fragments that are successfully assigned to a high-quality cell ID.</li>
<li><strong>Use case</strong>: Assesses how much valid fragment signal comes from high-quality cells and helps evaluate background fragments or empty-droplet effects.</li>
<li><strong>Interpretation</strong>:
<ul><li><strong>Needs attention</strong>: A low ratio may indicate high background fragments, abnormal filtering strictness, poor sample quality, or library construction issues.</li></ul>
</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Number of peaks</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The total number of open chromatin regions (peaks) identified across the genome after aggregating the signal from all cells.</li>
<li><strong>Use case</strong>: Assesses the number of detectable open chromatin regions and the coverage of regulatory elements in the sample.</li>
<li><strong>Influencing factors</strong>: Affected by cell number, cell-type heterogeneity, sequencing depth, and peak calling parameters.</li>
<li><strong>Typical Range</strong>: 50,000 – 150,000 peaks.</li>
</ul>
</td>
</tr>
</tbody>
</table>

#### Sequencing Metrics <a id="sequencing-metrics"></a>

**Core Function**: Basic quality assessment of sequencing data, including barcode identification rate, alignment quality, and sequencing accuracy.

**Quality Control Standards:**

<table>
<thead>
<tr>
<th width="25%">Metric Category</th>
<th width="25%">Recommended</th>
<th width="25%">Acceptable</th>
<th width="25%">Needs Improvement</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Valid barcodes</strong></td>
<td>≥ 80%</td>
<td>70–80%</td>
<td>< 70%</td>
</tr>
<tr>
<td><strong>Q30 bases in barcode</strong></td>
<td>> 85%</td>
<td>75–85%</td>
<td>< 75%</td>
</tr>
<tr>
<td><strong>Q30 bases in read</strong></td>
<td>> 85%</td>
<td>75–85%</td>
<td>< 75%</td>
</tr>
<tr>
<td><strong>Confidently mapped read pairs</strong></td>
<td>> 80%</td>
<td>50–80%</td>
<td>< 50%</td>
</tr>
</tbody>
</table>

**Detailed Metric Explanations:**

<table>
<thead>
<tr>
<th width="30%">Metric Name</th>
<th width="70%">Detailed Explanation & Technical Requirements</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Total number of read pairs</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The total number of raw sequencing read pairs allocated to the sample.</li>
<li><strong>Use case</strong>: Represents the total data volume of the sequencing run and serves as the baseline for evaluating sequencing depth and downstream QC metrics.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Valid barcodes</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of reads whose cell barcode sequence can be successfully matched to the predefined whitelist (with error correction).</li>
<li><strong>Use case</strong>: Assesses whether cell barcode recognition is stable and whether fragments can be assigned to cells correctly.</li>
<li><strong>Interpretation</strong>: A low proportion usually suggests barcode recognition issues, which may be related to barcode sequencing quality, contamination, or library preparation quality.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Confidently mapped read pairs</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of all reads that successfully align to any location on the reference genome.</li>
<li><strong>Interpretation</strong>:
<ul><li><strong>Needs attention</strong>: If < 50%, review sample contamination, species selection, reference genome version, and sequencing quality.</li></ul>
</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Mitochondrial reads ratio</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of all aligned reads that map to the mitochondrial genome.</li>
<li><strong>Use case</strong>: Assesses mitochondrial-derived fragment proportion and helps evaluate nuclei preparation and sample integrity.</li>
<li><strong>Interpretation</strong>: An excessively high ratio (e.g., > 10%) often suggests cell death, excessive lysis, or elevated mitochondrial DNA capture.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Nucleosome-free regions</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of fragments originating from open chromatin regions (that is, nucleosome-free regions).</li>
<li><strong>Use case</strong>: Assesses the proportion of fragments from open chromatin and reflects valid ATAC-seq signal strength.</li>
<li><strong>Interpretation</strong>: A high proportion (e.g., > 40%) generally indicates strong chromatin accessibility signal and efficient transposition.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Mono-nucleosome regions</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of fragment regions containing a single nucleosome.</li>
<li><strong>Use case</strong>: Assesses mono-nucleosome fragment proportion and, together with nucleosome-free regions, helps evaluate chromatin structure integrity.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Q30 bases in barcode</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of bases with a sequencing quality score of Q30 or higher in the cell barcode sequence.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Q30 bases in read</strong></td>
<td>
<ul>
<li><strong>Definition</strong>: The proportion of bases with a sequencing quality score of Q30 or higher in the sequencing read.</li>
</ul>
</td>
</tr>
</tbody>
</table>

#### Visualization Chart 1 <a id="visualization-chart-1"></a>

**Core Function**: Multi-dimensional visualization for cell quality control, fragment analysis, and chromatin accessibility assessment.

#### Barcode Rank Plot

**Chart Function**:
This plot ranks all cell barcodes by fragment count to distinguish high-quality true cells from background noise.

**How to Interpret**:

*   **Axes**:
    *   **X-axis (Barcode Rank)**: All barcodes ranked in descending order by fragment count. Left = high-fragment barcodes; right = low-fragment barcodes.
    *   **Y-axis (Fragment Counts)**: Total peak-overlapping fragment counts per barcode (log scale).
*   **Key Feature (Knee Point)**:
    *   The curve usually has a clear "knee point".
    *   The **blue region** to the left of the knee indicates barcodes identified as high-quality real cells.
    *   The **gray region** to the right indicates background noise.
*   **Interactivity**:
    *   Hover to inspect barcode rank and fragment count details.
    *   Blue color intensity reflects the local density of real cells.

#### Droplet Beads Distribution

**Chart Function**:
Shows the distribution of captured cell barcodes (beads) within droplets identified as real cells.

**How to Interpret**:

*   **Theoretical distribution**: Bead count per droplet is expected to approximately follow a **Poisson distribution**, reflecting random capture in microfluidics.
*   **Practical factors**: The observed distribution is affected by sequencing saturation, droplet size uniformity, and cell concentration.

#### Cell Data Distribution

**Chart Function**:
Three violin plots show the distributions of key QC metrics in high-quality cells: **Fragments**, **TSS Proportion**, and **Peak Proportion**.

**How to Interpret**:

*   **Violin plot basics**:
    *   Plot **width** indicates cell density at that value. Wider sections represent more cells.
    *   The internal boxplot summarizes median and quartiles.
*   **Metric interpretation**:
    *   **Fragments**: Distribution of total fragments per cell. Better libraries usually have a higher central density.
    *   **TSS Proportion**: Distribution of fragment fractions around TSS. A higher center indicates stronger transcription-associated accessibility.
    *   **Peak Proportion**: Distribution of fragment fractions in called peaks. A higher center indicates better signal-to-noise.

#### Fragment Length Distribution

**Chart Function**:
Shows the insert length distribution of deduplicated ATAC-seq fragments, a key plot for assessing sample quality and chromatin structure integrity.

**How to Interpret**:

*   **Periodic peaks**:
    *   **< ~100 bp**: First peak, corresponding to **nucleosome-free regions (NFRs)**, that is, open chromatin.
    *   **~200 bp**: Second peak, corresponding to **mono-nucleosome** fragments.
    *   **~400 bp, ~600 bp**: Subsequent peaks corresponding to **di-nucleosome** and **tri-nucleosome** fragments.
*   **Quality assessment**:
    *   **High-quality sample**: Clear ~200 bp periodic peaks with a prominent NFR peak, indicating intact nuclei and clear chromatin structure.
    *   **Low-quality sample**: Flat curve without periodicity, often indicating over-lysis or disrupted chromatin architecture.

#### Other Key Metrics <a id="other-key-metrics"></a>

<img src="../images/html_scatac2.png" alt="scATAC Web Report" width="500">

##### Percent duplicates

- **Definition**: The proportion of fragments identified as PCR duplicates.
- **Use case**: Used to assess library complexity and sequencing saturation, and to determine whether additional sequencing is likely to be useful.
- **Quality interpretation**:
  - High duplication (e.g., >20-30%) usually indicates sequencing has approached saturation and additional sequencing may have limited benefit.
  - Very low duplication (e.g., <10%) may suggest insufficient depth; deeper sequencing may recover more unique fragments.

##### Jaccard threshold

- **Definition**: Similarity cutoff used to determine whether two beads came from the same droplet/cell.
- **Use case**: In C4 ATAC, one droplet may contain multiple beads; the software uses bead-level fragment overlap (Jaccard index) to decide whether beads should be merged.
- **Algorithm**: Automatically determined by Otsu's method. To ensure stability, if the computed threshold is < `0.02`, it is set to `0.02`.

#### Visualization Chart 2 <a id="visualization-chart-2"></a>

**Core Function**: Advanced visualizations for cell clustering, TSS enrichment patterns, saturation assessment, and bead similarity.

#### Cluster Analysis

**Chart Function**:
Cells with similar chromatin accessibility patterns are grouped in 2D space using UMAP + Louvain clustering to identify potential cell subpopulations.

**How to Interpret**:

1. **Left plot (cell clusters)**
    - Each point is one cell.
    - Different colors indicate different clusters, potentially representing distinct cell types or states.
    - Nearby points have more similar accessibility profiles.
2. **Right plot (fragment count overlay)**
    - Uses the same UMAP layout with a color gradient for per-cell fragment count.
    - Darker colors indicate higher fragment counts and usually better data quality.

#### TSS Enrichment Profile

**Chart Function**:
Shows fragment insertion enrichment around transcription start sites (TSS), a core indicator of ATAC-seq signal specificity and quality.

**How to Interpret**:

1. **Axes**
    - **X-axis**: Position relative to TSS (0 = TSS).
    - **Y-axis**: Normalized signal intensity (insertion frequency).
2. **Key pattern**
    - High-quality data usually shows a clear enrichment peak at TSS center (0).
    - Signal should drop quickly away from the center.
3. **Quality assessment**
    - **TSS Enrichment Score** quantifies this pattern; higher scores (e.g., >4-6) indicate better signal-to-noise.
    - Flat curves without a clear enrichment peak may suggest poor sample quality or library preparation issues.

#### Single Cell Targeting Plot

**Chart Function**:
A scatter plot of two key QC metrics per cell, used to evaluate cell-calling performance.

**How to Interpret**:

1. **Axes**
    - **X-axis (Fragment Counts)**: Total fragments per cell (log scale).
    - **Y-axis (TSS Enrichment)**: TSS enrichment score per cell.
2. **Quality assessment**
    - **Top-right**: High fragment count + high TSS enrichment, usually high-quality real cells.
    - **Bottom-left**: Low fragment count + low TSS enrichment, usually background/noise and filtered out.
    - Ideally, high-quality cells and background should be clearly separable.

#### Saturation Curve

**Chart Function**:
Evaluates sequencing depth sufficiency and library complexity, that is, whether additional sequencing can still identify substantial numbers of new unique fragments.

**How to Interpret**:

1. **Axes**
    - **X-axis**: Mean read pairs per cell (sequencing depth).
    - **Y-axis**: Median unique fragments per cell.
2. **Curve behavior**
    - **Linear/rising phase**: Additional sequencing yields many new unique fragments.
    - **Plateau/saturation phase**: Library complexity is mostly exhausted; additional sequencing gives diminishing returns.
3. **Quality guidance**
    - A saturation (duplication-related) level around 20%-50% is often a practical balance between cost and completeness.

#### Bead Similarity Ranking

**Chart Function**:
In C4 ATAC, this plot is used to merge multiple beads from the same droplet by ranking bead pairs using Jaccard similarity.

**How to Interpret**:

1. **Axes**
    - **X-axis**: All bead pairs ranked by Jaccard similarity (descending).
    - **Y-axis**: Jaccard similarity index (log scale).
2. **Key regions**
    - **Blue region**: Similarity above the Otsu-derived threshold; bead pairs are considered from the same cell and merged.
    - **Gray region**: Similarity below threshold; bead pairs are treated as from different cells.

## Related Documentation

| Document | Description |
| :--- | :--- |
| [scATAC Pipeline](../pipeline/scATAC.md) | Detailed scATAC analysis workflow |
| [scATAC Parameters](../parameter/scATAC.md) | Command parameter reference |
| [Output Files](./outs.md) | Return to output documentation index |
