# scVDJ Analysis Parameters

DNBelab C Series HT scVDJ Parameter Configuration Guide

## Main Analysis Pipeline (run) <a id="main-analysis-pipeline-run"></a>

### Usage <a id="usage"></a>

```bash
dnbc4tools vdj run \
  --name sample1 --fastqs /data/tcr \
  --ref human --chain TR \
  --beadstrans /results/rna/outs/singlecell.csv \
  --threads 16
```

<details markdown="block" class="cli-help">
<summary>Full CLI help</summary>

```shell
$ dnbc4tools vdj run --help
dnbc4tools 3.2

Process a single-cell V(D)J sample.

Usage: dnbc4tools vdj run [OPTIONS]

options:
  --help                       show this help message and exit

Input Files:
  Choose one input method: either `--fastqs` (directory input) or individual FASTQ files (`--fastq1` and
  `--fastq2`).

  --fastqs <DIR>               Input directory path containing paired-end FASTQ files (e.g., `./fastq_dir`).
  --fastq1 <FILE>              Read 1 FASTQ file path(s). Wildcards and comma-separated lists are supported (e.g.,
                               `sample1_L01_R1.fastq.gz,sample1_L02_R1.fastq.gz`).
  --fastq2 <FILE>              Read 2 FASTQ file path(s). Must match the order provided to `--fastq1` (e.g.,
                               `sample1_L01_R2.fastq.gz,sample1_L02_R2.fastq.gz`).

Basic Settings:
  --name <STR>                 Unique identifier for the sample. Used for naming output files and reports (e.g.,
                               `sample1`).
  --ref <STR>                  Reference database: `human`/`mouse`, or a custom reference directory path containing
                               `reference.json` (e.g., `human` or `./custom_vdj_ref`).
  --chain <STR>                VDJ receptor type: `IG` (BCR) or `TR` (TCR) (e.g., `TR`).
  --outdir <DIR>               Output directory path for results and reports [default: current directory] (e.g.,
                               `./output`).
  --threads <INT>              Number of CPU threads for parallel processing [default: all available cores].
  --beadstrans <FILE>          RNA-analysis `singlecell.csv` file path for cell filtering and bead merging info (e.g.,
                               `./singlecell.csv`).

Library Settings:
  --darkreaction <STR>         Dark cycle setting for VDJ library. Supported values: `R1`, `unset` (e.g., `R1`).
  --customize <STR>            Custom read structure string. Format: `<type>,<read>:<start>-<end>` joined by `;`.
                               (e.g., `"cb,R1:7-16;cb,R1:23-32;umi,R1:38-47;R1,R1:61-150;R2,R2:1-150"`).
  --enrichment_primers <FILE>  Custom inner enrichment primers file path (one primer sequence per line) (e.g.,
                               `./inner_primers.txt`).

Analysis Settings:
  --keep_all_cells             Retain all cells in analysis without RNA-based filtering.
  --r2_only                    Use only Read 2 sequences for VDJ assembly.
  --sample_read_pairs <INT>    Subsample the specified number of read pairs from input FASTQ file(s) (e.g.,
                               `1000000`).
```

</details>

### Parameter Description

### Required Parameters

> **Essential parameters that must be specified for a successful analysis**

#### `--name` (Required)

Provide a unique name for this analysis run.

<ul>
  <li><strong>Function:</strong> This name will be used as a prefix for all output files and the HTML report.</li>
  <li><strong>Display:</strong> In the final web report, this name will be shown as the Sample ID.</li>
</ul>

**Default:** None

**Example:**

```text
--name sample_VDJ_001
```

#### `--ref` (Required)

Specify the reference database to be used for VDJ analysis.

<ul>
    <li><strong>Function:</strong> Specifies the reference database for VDJ analysis.</li>
    <li><strong>Built-in Support:</strong> The software comes with reference databases for human (<code>human</code>) and mouse (<code>mouse</code>).</li>
    <li><strong>Custom Support:</strong> A path to a custom reference directory containing a <code>reference.json</code> file can be provided.</li>
</ul>

**Default:** None

**Examples:**

```text
# Use the built-in human reference database
--ref human
```

```text
# Use a custom reference database
--ref ./custom_vdj_ref
```

#### `--chain` (Required)

Specify the type of immune receptor to be analyzed.

<ul>
    <li><strong>Core Function:</strong> Specifies the immune receptor type for analysis, directly impacting the identification and recombination analysis of V(D)J gene segments.</li>
    <li><strong><code>TR</code>:</strong> T-cell Receptor, for T-cell studies.</li>
    <li><strong><code>IG</code>:</strong> Immunoglobulin, for B-cell studies.</li>
</ul>

**Default:** None

**Examples:**

```text
# Analyze T-cell receptors
--chain TR
```

```text
# Analyze B-cell receptors
--chain IG
```

### Input File Parameters

**Choose one input method: directory input or individual FASTQ files**

#### `--fastqs` (Method 1)

Specify the path to the directory containing all FASTQ files.

<ul>
  <li><strong>Function:</strong> The pipeline will automatically detect paired files (R1/R2) within this directory.</li>
  <li><strong>Directory requirement (VDJ):</strong> <code>--fastqs</code> should point to a directory that contains only FASTQ files from the current VDJ library, with R1/R2 files placed directly under that directory.</li>
  <li><strong>Naming requirement:</strong> Automatic detection relies on R1/R2 markers in file names. Supported R1 patterns are <code>_R1_</code>, <code>_R1</code>, <code>_1</code>, and <code>_read1</code>; supported R2 patterns are <code>_R2_</code>, <code>_R2</code>, <code>_2</code>, and <code>_read2</code>. Supported extensions are <code>.fastq.gz</code>, <code>.fq.gz</code>, <code>.fastq</code>, and <code>.fq</code>.</li>
  <li><strong>Note:</strong> This is a convenience option and cannot be used simultaneously with <code>--fastq1</code> / <code>--fastq2</code>.</li>
</ul>

**Recommended directory structure:**

```text
VDJ_fastq_dir/
├── sample_VDJ_L01_R1.fastq.gz
├── sample_VDJ_L01_R2.fastq.gz
├── sample_VDJ_L02_R1.fastq.gz
└── sample_VDJ_L02_R2.fastq.gz
```

**Default:** None

**Example:**

```text
--fastqs ./VDJ_fastq_dir
```

#### `--fastq1` (Method 2A)

Specify one or more Read 1 FASTQ files for the VDJ library individually.

<ul>
  <li><strong>Support:</strong> You can use wildcards (<code>*</code>) to match files or a comma-separated list for multiple files.</li>
  <li><strong>Requirement:</strong> Must be used in pairs with the <code>--fastq2</code> parameter, and the file order must match exactly.</li>
</ul>

**Default:** None

**Example:**

```text
--fastq1 sample1_L01_R1.fastq.gz,sample1_L02_R1.fastq.gz
```

#### `--fastq2` (Method 2B)

Specify one or more Read 2 FASTQ files for the VDJ library individually.

<ul>
  <li><strong>Support:</strong> You can use wildcards (<code>*</code>) to match files or a comma-separated list for multiple files.</li>
  <li><strong>Requirement:</strong> Must be used in pairs with the <code>--fastq1</code> parameter, and the file order must match exactly.</li>
</ul>

**Default:** None

**Example:**

```text
--fastq2 sample1_L01_R2.fastq.gz,sample1_L02_R2.fastq.gz
```

**Input Method Selection:**

<ul>
  <li><strong>Method 1:</strong> Use <code>--fastqs</code> to specify a directory containing paired FASTQ files.</li>
  <li><strong>Method 2:</strong> Use <code>--fastq1</code> and <code>--fastq2</code> to specify R1 and R2 files respectively.</li>
</ul>

**Compatible aliases**

<ul>
</ul>

**Important Note:** Files provided for the same input group must come from the same library and use consistent sequencing mode and dark-reaction settings. Data from different libraries must not be merged for analysis.

### Basic Settings

#### `--outdir` (Optional)

Specify the output directory for all analysis results and reports.

<ul>
  <li><strong>Function:</strong> All analysis results will be saved in this directory, and the pipeline will automatically create a structured subdirectory named after the sample.</li>
</ul>

**Default:** `./` (current directory)

**Example:**

```text
--outdir ./VDJ_analysis_output
```

#### `--threads` (Optional)

Set the number of CPU threads to be used during the analysis.

<ul>
  <li><strong>Function:</strong> Increasing the number of threads can significantly speed up the analysis.</li>
  <li><strong>Recommendation:</strong> Adjust based on the number of available CPU cores for optimal performance.</li>
</ul>

**Default:** `Use all available CPU cores`

**Example:**

```text
--threads 16
```

#### `--beadstrans` (Optional)

Accepts complete RNA `singlecell.csv` and C6 `singlecell.csv.gz`. Compressed input requires a matching native VDJ preprocessing tool.

Provide the `singlecell.csv` file from a scRNA analysis for cell filtering and information integration.

<ul>
  <li><strong>Function:</strong> By integrating results from a 5' scRNA analysis, this enables bead merging and cell filtering, thereby establishing a precise correspondence between the single-cell RNA expression profile and the VDJ recombination sequence.</li>
  <li><strong>Requirement:</strong> Using this feature requires providing the <code>singlecell.csv</code> output file from a 5' scRNA analysis of the same sample.</li>
  <li><strong>Note:</strong> If this parameter is not specified, the bead merging step will be skipped, and all detected cells will be retained by default (equivalent to enabling <code>--keep_all_cells</code>).</li>
</ul>

**Default:** None

**Example:**

```text
--beadstrans ./RNA_analysis_output/outs/singlecell.csv
```

### Library Settings

#### `--darkreaction` (Optional)

Supported values are `auto`, `R1`, `unset`; `R1R2` is not supported.

Configure the dark cycle settings for the VDJ library.

<ul>
  <li><strong>Function:</strong> Guides the software to correctly parse dark reaction cycles generated by the sequencing chemistry.</li>
  <li><strong>Smart Detection (auto):</strong> Default setting. The software automatically identifies the structure by analyzing the sequence. <strong>Recommended for initial analysis.</strong></li>
  <li><strong>Manual Settings:</strong> Options are <code>R1</code> (dark cycle in Read 1) or <code>unset</code> (no dark cycle).</li>
</ul>

**Default:** `auto`

**Example:**

```text
# Dark cycle present in Read 1
--darkreaction R1
```

**Important Note:** Incorrect settings may lead to cell barcode identification failure. Specify manually only if you know the library structure or if auto-detection fails.

#### `--customize` (Advanced)

Precisely define the extraction structure for barcodes, UMIs, and effective sequences (reads) for non-standard libraries. This is an advanced feature that overrides `--darkreaction` settings.

<ul>
  <li><strong>Syntax:</strong> <code>"&lt;type&gt;,&lt;read&gt;:&lt;start&gt;-&lt;end&gt;"</code>, with multiple segments separated by semicolons (<code>;</code>).
    <ul>
      <li><strong>Parameter Types (type):</strong> <code>cb</code> (cell barcode), <code>umi</code> (UMI), <code>R1</code>/<code>R2</code> (effective sequence).</li>
    </ul>
  </li>
  <li><strong>Notes:</strong>
      <ul>
        <li>The entire parameter string must be enclosed in quotes.</li>
        <li>Coordinates are 1-based and cannot exceed the read length.</li>
      </ul>
  </li>
</ul>

**Example:**

```text
# Example of a standard VDJ library configuration
--customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R1:31-120;R2,R2:1-150"
```

**Risk Warning:** Incorrect custom configurations can lead to data loss or analysis failure. Use only when standard configurations do not meet your needs.

#### `--enrichment_primers` (Optional)

Specify a file containing internal enrichment primers for VDJ region-specific amplification.

<ul>
  <li><strong>Application:</strong> For VDJ libraries designed for non-human/mouse species or using custom primers.</li>
  <li><strong>Format:</strong> A plain text file with one primer sequence per line.</li>
  <li><strong>Requirement:</strong> This parameter is required when using a custom reference database.</li>
</ul>

**Default:** None

**Example file content:**

```text
GTCCTCGGTGGCCTCCACGTG
AGCACCTGGGGCCTCGGCCAC
CCTGGACTCCTGGGCCCCAG
```

### Analysis Settings

#### `--keep_all_cells` (Flag)

Enable this parameter to retain all detected cells without filtering based on RNA data.

<ul>
  <li><strong>Function:</strong> This behavior is automatically enabled when the <code>--beadstrans</code> parameter is not provided. It is suitable for standalone VDJ analysis or when maximizing cell recovery is desired.</li>
</ul>

**Default:** Not set (but enabled by default if `--beadstrans` is absent)

#### `--r2_only` (Flag)

Enable this parameter to use only Read 2 sequences for VDJ assembly.

<ul>
  <li><strong>Function:</strong> Suitable for library designs where Read 1 contains only barcode and UMI information.</li>
  <li><strong>Note:</strong> The software cannot auto-detect this situation; it must be specified manually based on the library design.</li>
</ul>

**Default:** Not set

#### `--sample_read_pairs` (Optional)

Extract a specified number of read pairs from the input FASTQ files for analysis.

<ul>
  <li><strong>Function:</strong> Used for quick testing of large datasets before a full analysis, or for down-sampling analysis when resources are limited.</li>
  <li><strong>Note:</strong> Subsampling may affect the detection of low-frequency clonotypes. It is recommended to use the full dataset for formal analysis.</li>
</ul>

**Default:** None (uses all data)

**Example:**

```text
--sample_read_pairs 10000000
```

## Related Documentation

| Resource | Description |
| :--- | :--- |
| [scVDJ Pipeline](../pipeline/scVDJ.md) | Single-cell VDJ analysis workflow guide |
| [scVDJ Output](../outs/scVDJ.md) | Detailed output file interpretation |

> **Feedback & Support**
>
> This document is continuously maintained. If you identify errors or additional information is required, please submit feedback via GitHub Issues.
>
