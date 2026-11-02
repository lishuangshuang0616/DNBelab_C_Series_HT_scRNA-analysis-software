# scRNA Analysis Parameters

DNBelab C Series HT scRNA Parameter Configuration Guide

## Overview <a id="overview"></a>

This document explains the parameter meanings, default behaviors, and common usage patterns for each subcommand of `dnbc4tools rna`, covering single-sample analysis (`run`), reference library construction (`mkref`), and multi-sample task generation (`multi`).

> **Tip**
>
> Parameter descriptions are based on the current command-line help information. Examples can be used directly as templates and adjusted as needed.

## Main Analysis Pipeline (run) <a id="main-analysis-pipeline-run"></a>

### Usage <a id="usage"></a>

```bash
dnbc4tools rna run \
  --name sample1 \
  --fastqs /data/rna \
  --genomeDir /reference/rna \
  --threads 16
```

<details markdown="block" class="cli-help">
<summary>Full CLI help</summary>

```shell
$ dnbc4tools rna run --help
dnbc4tools 3.2

Process a single-cell RNA-seq sample.

Usage: dnbc4tools rna run [OPTIONS]

options:
  --help                     show this help message and exit

Input Files:
  Choose one input method: either `--fastqs` (directory input) or all four individual FASTQ files.

  --fastqs <DIR>             Directory containing cDNA and oligo FASTQ subfolders (e.g.,
                             `cDNA/sample_cdna_R1.fastq.gz`, `oligo/sample_oligo_R1.fastq.gz`). Paired-end files are
                             detected from the directory structure.
  --cDNAfastq1 <FILE>        cDNA Read1 FASTQ list. Supports wildcard and comma-separated inputs (e.g.,
                             `sample1_R1.fastq.gz,sample2_R1.fastq.gz`).
  --cDNAfastq2 <FILE>        cDNA Read2 FASTQ list. Order must match `--cDNAfastq1` (e.g.,
                             `sample1_R2.fastq.gz,sample2_R2.fastq.gz`).
  --oligofastq1 <FILE>       Oligo Read1 FASTQ list for barcode merging. Supports wildcard and comma-separated inputs.
  --oligofastq2 <FILE>       Oligo Read2 FASTQ list. Order must match `--oligofastq1` (e.g.,
                             `sample1_oligo_R2.fastq.gz`).

Basic Settings:
  --name <STR>               Unique identifier for the sample. Used for naming output files and reports (e.g.,
                             `sample1`).
  --genomeDir <DIR>          Reference genome directory path containing STAR index files (e.g., `./genome_index`).
  --outdir <DIR>             Output directory path for results and reports [default: current directory] (e.g.,
                             `./output`).
  --threads <INT>            Number of CPU threads for parallel processing [default: all available cores] (e.g.,
                             `16`).

Filtering Settings:
  --calling_method <STR>     Cell detection method [default: emptydrops]. Supported values: `barcoderanks`,
                             `emptydrops`.
  --expectcells <INT>        Expected number of cells to guide detection (e.g., `3000`).
  --forcecells <INT>         Force pipeline to use exactly this number of cells, overriding expected cell detection
                             (e.g., `5000`).
  --minumi <INT>             Minimum UMI count per cell to retain [default: 1000].
  --consistent_cells <FILE>  Headered CSV for merge/cell-calling constraints. Supported schemas: `cell`;
                             `cell,barcode`; `cell,is_cell_barcode`; `cell,barcode,is_cell_barcode`. Other columns are
                             ignored.

Library Settings:
  --chemistry <STR>          Library chemistry version. Options: `scRNAv1HT`, `scRNAv2HT`, `scRNAv3HT`, `scRNA5Pv1`.
  --darkreaction <STR>       Dark cycle setting for cDNA and oligo libraries. Provide two comma-separated values in
                             the form `<cDNA>,<oligo>`. cDNA=`R1`/`unset`; oligo=`R1R2`/`R1`/`unset`.
  --customize <STR>          Custom read structure string. Format: `<type>,<read>:<start>-<end>` joined by `;`. cDNA
                             (e.g., `"cb,R1:7-16;cb,R1:23-32;umi,R1:38-47;R1,R2:1-100"`). Oligo (e.g.,
                             `"cb,R1:7-16;cb,R1:23-32;R1,R2:1-10;R1,R2:17-26;R1,R2:33-42"`). For RNA, provide
                             `--customize` twice when both cDNA and oligo are customized: first cDNA, then oligo.

Analysis Settings:
  --no_introns               Exclude intronic reads from the expression matrix to increase specificity.
  --end5                     Enable 5'-end scRNA-seq analysis for 5' gene-expression profiling.
  --no_bam                   Skip BAM file generation to save time and disk space.
  --sample_read_pairs <INT>  Subsample this number of cDNA read pairs for analysis (e.g., `1000000`).
  --star_parameters <STR>    Extra STAR filtering, alignment, seeding or scoring arguments. Wrap them in quotes (e.g.,
                             `"--outFilterMismatchNmax 10 --outFilterMultimapNmax 1"`). Unknown or ineffective options
                             are rejected.
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
--name sample_001
```

#### `--genomeDir` (Required)

Specify the path to the reference genome directory.

<ul>
  <li><strong>Requirement:</strong> The directory must contain the index and annotation resources generated by the <code>mkref</code> command.</li>
  <li><strong>Content:</strong> Includes genome sequence, STAR alignment index, etc.</li>
</ul>

**Default:** None

**Example:**

```text
--genomeDir /path/to/genome/database
```

### Input File Parameters

**Choose one input method: directory input or individual FASTQ files**

#### `--fastqs` (Method 1)

Specify the path to the directory containing all FASTQ files.

<ul>
  <li><strong>Function:</strong> The pipeline will automatically detect paired files within this directory (including cDNA and oligo subdirectories).</li>
  <li><strong>Directory requirement (RNA):</strong> The <code>--fastqs</code> directory must contain both <code>cDNA/</code> and <code>oligo/</code> subdirectories, and each subdirectory should include paired R1/R2 files.</li>
  <li><strong>Naming requirement:</strong> Automatic detection relies on R1/R2 markers in file names. Supported R1 patterns are <code>_R1_</code>, <code>_R1</code>, <code>_1</code>, and <code>_read1</code>; supported R2 patterns are <code>_R2_</code>, <code>_R2</code>, <code>_2</code>, and <code>_read2</code>. Supported extensions are <code>.fastq.gz</code>, <code>.fq.gz</code>, <code>.fastq</code>, and <code>.fq</code>.</li>
  <li><strong>Note:</strong> This is a convenience option and cannot be used simultaneously with <code>--cDNAfastq1</code> / <code>--cDNAfastq2</code> / <code>--oligofastq1</code> / <code>--oligofastq2</code>.</li>
</ul>

**Recommended directory structure:**

```text
fastq_directory/
├── cDNA/
│   ├── sample_cDNA_L01_R1.fastq.gz
│   └── sample_cDNA_L01_R2.fastq.gz
└── oligo/
    ├── sample_oligo_L01_R1.fastq.gz
    └── sample_oligo_L01_R2.fastq.gz
```

**Default:** None

**Example:**

```text
--fastqs ./fastq_directory
```

#### `--cDNAfastq1` (Method 2A)

Specify one or more cDNA Read 1 FASTQ files individually.

<ul>
  <li><strong>Support:</strong> You can use wildcards (<code>*</code>) to match files or a comma-separated list for multiple files.</li>
  <li><strong>Requirement:</strong> Must be used in pairs with the <code>--cDNAfastq2</code> parameter, and the file order must match exactly.</li>
</ul>

**Default:** None

**Example:**

```text
--cDNAfastq1 sample_cDNA_L01_R1.fastq.gz,sample_cDNA_L02_R1.fastq.gz
```

#### `--cDNAfastq2` (Method 2B)

Specify one or more cDNA Read 2 FASTQ files individually.

<ul>
  <li><strong>Support:</strong> You can use wildcards (<code>*</code>) to match files or a comma-separated list for multiple files.</li>
  <li><strong>Requirement:</strong> Must be used in pairs with the <code>--cDNAfastq1</code> parameter, and the file order must match exactly.</li>
</ul>

**Default:** None

**Example:**

```text
--cDNAfastq2 sample_cDNA_L01_R2.fastq.gz,sample_cDNA_L02_R2.fastq.gz
```

#### `--oligofastq1` (Method 2C)

Specify one or more oligo Read 1 FASTQ files individually.

<ul>
  <li><strong>Support:</strong> You can use wildcards (<code>*</code>) to match files or a comma-separated list for multiple files.</li>
  <li><strong>Requirement:</strong> Must be used in pairs with the <code>--oligofastq2</code> parameter, and the file order must match exactly.</li>
</ul>

**Default:** None

**Example:**

```text
--oligofastq1 sample_oligo_L01_R1.fastq.gz
```

#### `--oligofastq2` (Method 2D)

Specify one or more oligo Read 2 FASTQ files individually.

<ul>
  <li><strong>Support:</strong> You can use wildcards (<code>*</code>) to match files or a comma-separated list for multiple files.</li>
  <li><strong>Requirement:</strong> Must be used in pairs with the <code>--oligofastq1</code> parameter, and the file order must match exactly.</li>
</ul>

**Default:** None

**Example:**

```text
--oligofastq2 sample_oligo_L01_R2.fastq.gz
```

**Input Method Selection:**

<ul>
  <li><strong>Method 1:</strong> Use <code>--fastqs</code> to specify a directory containing <code>cDNA/</code> and <code>oligo/</code> subdirectories.</li>
  <li><strong>Method 2:</strong> Use <code>--cDNAfastq1</code>, <code>--cDNAfastq2</code>, <code>--oligofastq1</code>, and <code>--oligofastq2</code> to specify the paired FASTQ files explicitly.</li>
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
--outdir ./output_results
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

### Filtering Settings

#### `--calling_method` (Optional)

Set the cell identification method to distinguish real cells from empty droplets.

<details markdown="block" open>
  <summary><strong>Method Comparison</strong></summary>



##### barcoderanks

    <ul>
      <li><strong>Principle:</strong> Uses an empirical threshold based on total UMI counts, identifying cells via the "knee point" of the UMI rank plot.</li>
      <li><strong>Use Case:</strong> Quick preliminary analysis or in scenarios where cells are clearly distinct from the background.</li>
    </ul>





##### emptydrops (Default)

    <ul>
      <li><strong>Principle:</strong> Based on a statistical test of the expression profile to determine if a cell's profile is significantly different from the ambient RNA background.</li>
      <li><strong>Use Case:</strong> Standard analysis (recommended), accurately identifies cells with low RNA content and controls for false positives.</li>
    </ul>


</details>

**Default:** `emptydrops`

**Example:**

```text
# Switch to barcoderanks for cell identification
dnbc4tools rna run --name sample1 --fastqs ./fq --genomeDir ./ref --calling_method barcoderanks
```

#### `--expectcells` (Optional)

Omission or `auto` requests estimation. `--forcecells` accepts a positive integer only.

Set the expected number of recovered cells.

<ul>
  <li><strong>Function:</strong> Provides initial guidance for the emptydrops algorithm's preliminary screening.</li>
  <li><strong>Recommendation:</strong> The default <code>auto</code> mode is recommended, which automatically estimates the cell count based on UMI distribution features. If the effective cell count is known, you can also manually set it to 50% of that number as a preliminary screening basis.</li>
</ul>

**Default:** `auto`

**Example:**

```text
# Expect to recover 3000 cells
dnbc4tools rna run --name sample1 --fastqs ./fq --genomeDir ./ref --expectcells 3000
```

#### `--forcecells` (Optional)

Force the pipeline to use an exact number of cells, overriding the software's automatic cell detection.

<ul>
  <li><strong>Function:</strong> Use when you want to analyze a cell population of a known quantity.</li>
  <li><strong>Priority:</strong> This is the highest-priority filtering parameter.</li>
</ul>

**Default:** None

**Example:**

```text
# Force the output of 5000 cells for analysis
dnbc4tools rna run --name sample1 --fastqs ./fq --genomeDir ./ref --forcecells 5000
```

#### `--minumi` (Optional)

Set the minimum UMI count to retain a cell.

<ul>
  <li><strong>Function:</strong> This is a core cell quality control parameter. Cells below this threshold are considered to have poor data quality and will be excluded from subsequent analysis.</li>
  <li><strong>Recommendation:</strong> Use the default value for the initial analysis, then determine a more appropriate threshold based on the "UMI Count Distribution" plot in the web report.</li>
</ul>

**Default:** `1000`

**Example:**

```text
# Lower the UMI threshold for cell filtering to 500
dnbc4tools rna run --name sample1 --fastqs ./fq --genomeDir ./ref --minumi 500
```

#### `--consistent_cells` (Optional)

Accepts complete headered `.csv` or `.csv.gz` tables, including legacy six-column summaries.

Provide a CSV file (with header) for cell-merge/cell-calling constraints.

<ul>
  <li><strong>Function:</strong> Adds external constraints during barcode merging and final cell calling to improve consistency across data batches.</li>
  <li><strong>Supported header schemas:</strong> <code>cell</code>, <code>cell,barcode</code>, <code>cell,is_cell_barcode</code>, <code>cell,barcode,is_cell_barcode</code>.</li>
  <li><strong>Note:</strong> Any additional columns are ignored and do not affect pipeline execution.</li>
  <li><strong>Caution:</strong> If both <code>cell</code> and <code>barcode</code> are present, the oligo data analysis results will not contribute to the final merging. Any other oligo data not from this sample can be used without affecting the analysis results.</li>
</ul>

**Default:** None

**Example:**

```text
--consistent_cells ./constraints/consistent_cells.csv
```

**Cell Identification Analysis Recommendations**

Cell identification is critical for downstream reliability. Start with defaults, then tune based on QC plots.

<details markdown="block" open>
<summary><strong>Click to view diagnostics and strategy</strong></summary>

<ul>
  <li><strong>Too few cells:</strong> Usually <code>--minumi</code> is too strict or ambient RNA is high. Lower <code>--minumi</code> and re-check UMI rank.</li>
  <li><strong>Too many cells:</strong> Usually threshold is too loose. Increase <code>--minumi</code> or constrain with <code>--forcecells</code>.</li>
  <li><strong>No clear knee point:</strong> Check library/sequencing quality first, then tune parameters.</li>
  <li><strong>Multiple knee points:</strong> May indicate mixed populations or doublets; follow with doublet filtering.</li>
</ul>

</details>

### Library Settings

#### `--chemistry` (Optional)

Configure the chemistry version of the scRNA kit, which determines the sequence structure of barcodes and UMIs.

<ul>
  <li><strong>Function:</strong> Guides parsing of barcode and UMI sequence structure.</li>
  <li><strong>Supported Versions:</strong> <code>scRNAv1HT</code>, <code>scRNAv2HT</code>, <code>scRNAv3HT</code>, <code>scRNA5Pv1</code>.</li>
  <li><strong>Smart Detection (auto):</strong> Recommended for first-pass analysis; manual override only when auto-detection fails.</li>
</ul>

**Default:** `auto`

**Example:**

```text
# Scenario: Known library is scRNAv3HT with no dark reaction and auto-analysis failed
dnbc4tools rna run --name sample2 --fastqs ./fq --genomeDir ./ref --chemistry scRNAv3HT --darkreaction unset,unset
```

**Important Note:** Incorrect settings may lead to cell barcode identification failure. Specify manually only if you know the library structure or if auto-detection fails. When manually specified, it is recommended to set `--darkreaction` together.

#### `--darkreaction` (Optional)

Use `auto` alone, or a manual pair: cDNA=`R1/unset`, oligo=`R1/R1R2/unset`. Explicit chemistry and dark cycles must be supplied together.

Configure the dark cycle settings for the cDNA and oligo libraries.

<ul>
  <li><strong>Function:</strong> Guides parsing of dark-cycle patterns from sequencing chemistry.</li>
  <li><strong>Format:</strong> <code>&lt;cDNA_setting&gt;,&lt;oligo_setting&gt;</code>.</li>
  <li><strong>Manual values:</strong> cDNA=R1/unset, oligo=R1/R1R2/unset; use auto alone.</li>
  <li><strong>Smart Detection (auto):</strong> Recommended default; manually set only when auto-detection fails.</li>
</ul>

**Default:** `auto`

**Examples:**

```text
# Example 1: cDNA library has dark cycle on R1, oligo library has dark cycles on both ends
--darkreaction R1,R1R2
```

```text
# Example 2: Both libraries have dark cycles on R1 only
--darkreaction R1,R1
```

```text
# Example 3: Neither library has dark cycles
--darkreaction unset,unset
```

**Important Note:** Incorrect settings may lead to cell barcode identification failure. Specify manually only if you know the library structure or if auto-detection fails. When manually specified, it is recommended to set `--chemistry` together.

#### `--customize` (Advanced)

Precisely define the extraction structure for barcodes, UMIs, and effective sequences (reads) for non-standard libraries. This is an advanced feature that overrides `--chemistry` and `--darkreaction` settings.

<ul>
  <li><strong>Syntax:</strong> <code>"&lt;type&gt;,&lt;read&gt;:&lt;start&gt;-&lt;end&gt;"</code>, with multiple segments separated by semicolons (<code>;</code>).</li>
  <li><strong>Parameter Types (type):</strong> <code>cb</code> (cell barcode), <code>umi</code> (UMI), <code>R1</code> (effective sequence in Read 1), <code>R2</code> (effective sequence in Read 2, paired-end only).</li>
  <li><strong>Dual Configuration:</strong> Specify <code>--customize</code> twice when both cDNA and oligo libraries are customized.</li>
  <li><strong>Notes:</strong> Enclose the full string in quotes; coordinates are 1-based and must not exceed read length.</li>
</ul>

**Examples:**

```text
# For a cDNA library with structure: Barcode 1(1-10bp) + Barcode 2(11-20bp) + UMI(21-30bp) in R1; sequence(1-100bp) in R2
--customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R2:1-100"
```

```text
# For a cDNA library with structure: Barcode 1(7-16bp) + Barcode 2(23-32bp) + UMI(38-47bp) in R1; sequence(1-100bp) in R2
--customize "cb,R1:7-16;cb,R1:23-32;umi,R1:38-47;R1,R2:1-100"
```

```text
# For a 5'-end transcript cDNA library using data from both ends
--customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R1:31-120;R2,R2:1-150"
```

```text
# Example: Custom sequence structures for cDNA and oligo libraries respectively
--customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R2:1-100" --customize "cb,R1:1-10;cb,R1:11-20;R1,R2:1-30"
```

**Risk Warning:** Incorrect custom configurations can lead to data loss or analysis failure. Use only when standard configurations do not meet your needs.

### Analysis Settings

#### `--no_introns` (Flag)

Enable this parameter to filter out reads from intronic regions during analysis.

<ul>
  <li><strong>Function:</strong> Retains only reads from exonic regions for expression quantification, avoiding interference from immature transcripts.</li>
</ul>

**Default:** If not set, reads from intronic regions are included.

#### `--end5` (Flag)

Enable 5'-end single-cell transcriptome data analysis mode.

<ul>
  <li><strong>Function:</strong> Specifically for analyzing mRNA captured at the 5' end.</li>
  <li><strong>Note:</strong> Use this parameter only when using a 5'-end scRNA kit.</li>
</ul>

**Default:** Not set.

#### `--no_bam` (Flag)

Enable this parameter to skip the generation of BAM files.

<ul>
  <li><strong>Function:</strong> Saves time and disk space, significantly reducing computation time and storage requirements.</li>
  <li><strong>Note:</strong> Downstream analysis requiring BAM files will not be possible.</li>
</ul>

**Default:** If not set, BAM files are generated.

#### `--sample_read_pairs` (Optional)

Extract a specified number of read pairs from the input cDNA FASTQ files for analysis.

<ul>
  <li><strong>Function:</strong> Used for quick testing of large datasets before a full analysis, or for down-sampling analysis when resources are limited.</li>
</ul>

**Default:** None (uses all data)

**Example:**

```text
--sample_read_pairs 100000000
```

> **Analysis Recommendation**
> > For the initial analysis, it is recommended to use the default parameters and then adjust them as needed based on the results report.

#### `--star_parameters`

Extra validated STAR alignment, filtering, seeding or scoring arguments. Unknown, pipeline-managed or ineffective options are rejected.

```bash
--star_parameters "--outFilterMismatchNmax 10 --outFilterMultimapNmax 1"
```

<details markdown="block">
<summary>Advanced BAM resources</summary>

BAM resources are planned automatically. Use these hidden overrides only when needed:

| Option | Meaning |
| :--- | :--- |
| `--bam-workers` | Maximum concurrent chunk workers |
| `--bam-compression-threads` | Compression threads per chunk |
| `--bam-queue-depth` | Per-writer queue depth |
| `--bam-max-memory-gb` | Estimated memory budget in GiB, not an RSS cap |
| `--bam-compression-level` | 0–9; omission keeps the HTSlib default |
| `--bam-limit-memory` | Rejects a budget unable to fit even one estimated worker |

`--no_bam` disables BAM generation. See [Multi parameters](multi.md#bam-resources) for scheduling behavior.

</details>

## Reference Database Construction (mkref) <a id="reference-database-construction-mkref"></a>

### Usage

```bash
dnbc4tools rna mkref \
  --fasta genome.fa --ingtf genes.gtf \
  --species human --genomeDir /reference/rna --threads 16
```

<details markdown="block" class="cli-help">
<summary>Full CLI help</summary>

```shell
$ dnbc4tools rna mkref --help
dnbc4tools 3.2

Build an RNA reference database.

Usage: dnbc4tools rna mkref [OPTIONS]

options:
  --help              show this help message and exit

Input Files:
  Input genome FASTA files and gene-annotation GTF files. For mixed-species analysis, separate multiple files with
  commas.

  --fasta <FILE>      Reference-genome FASTA file path(s). Separate multiple files with commas (e.g.,
                      `genome1.fa,genome2.fa`).
  --ingtf <FILE>      Gene-annotation GTF file path(s). Separate multiple files with commas (e.g.,
                      `anno1.gtf,anno2.gtf`).

Basic Settings:
  --genomeDir <DIR>   Output directory path for generated reference files [default: current directory] (e.g.,
                      `./ref`).
  --species <STR>     Species identifier(s). Use commas for mixed-species analysis [default: undefined] (e.g.,
                      `human,mouse`).
  --threads <INT>     Number of CPU threads for parallel processing [default: 10] (e.g., `16`).

Advanced Settings:
  --chrM <STR>        Mitochondrial chromosome identifier in the reference genome (e.g., `MT`).
  --limitram <INT>    Maximum RAM, in GB, allowed for index generation (e.g., `64`). Also affects memory usage and
                      alignment speed during mapping.
  --extra-args <STR>  Additional validated STAR genomeGenerate parameters (e.g., `"--sjdbOverhang 100
                      --genomeSAsparseD 2"`). Preflight rejects alignment-only, unknown and mkref-managed parameters.
  --noindex           Skip the STAR index-generation step.
```

</details>

### Parameter Description

### Required Parameters

#### `--fasta` (Required)

Provide the reference genome sequence file.

<ul>
  <li><strong>Requirement:</strong> Standard FASTA format, primary assembly version is recommended.</li>
</ul>

**Default:** None

**Example:**

```text
--fasta Homo_sapiens.GRCh38.dna.primary_assembly.fa
```

#### `--ingtf` (Required)

Provide the gene structure annotation file.

<ul>
  <li><strong>Function:</strong> Used for gene expression quantification and annotation.</li>
  <li><strong>Requirement:</strong> Standard GTF format.</li>
  <li><strong>Required Features:</strong> Must include <code>gene</code>/<code>transcript</code> and <code>exon</code> entries.</li>
  <li><strong>Required Attributes:</strong> Must include <code>gene_id</code>/<code>gene_name</code> and <code>transcript_id</code>/<code>transcript_name</code>.</li>
  <li><strong>Chromosome Names:</strong> Must match chromosome names in the FASTA genome.</li>
  <li><strong>Coordinates:</strong> Start and end coordinates must be valid.</li>
</ul>

**Default:** None

**Example:**

```text
--ingtf Homo_sapiens.GRCh38.108.gtf
```

**Dual-Species Analysis Configuration**

For dual-species analysis, provide two file paths separated by commas in both `--fasta` and `--ingtf`.

<ul>
  <li><strong>Example:</strong> <code>--fasta human.fa,mouse.fa --ingtf human.gtf,mouse.gtf</code></li>
  <li><strong>Important:</strong> File order must exactly match the <code>--species</code> order.</li>
</ul>

#### Settings

#### `--genomeDir` (Optional)

Specify the output directory for the generated reference database.

<ul>
  <li><strong>Function:</strong> All generated reference files (index, annotations, etc.) will be stored in this directory.</li>
</ul>

<details markdown="block" open>
  <summary><strong>Directory Structure Preview</strong></summary>
  <pre>
  genomeDir/
  ├── fasta/
  │   └── genome.fa          # Processed genome sequence file
  ├── genes/
  │   └── genes.gtf          # Processed gene annotation file
  ├── star/
  │   ├── SA                 # STAR index file
  │   ├── SAindex            # STAR index core file
  │   ├── chrLength.txt      # Chromosome length information
  │   ├── chrName.txt        # Chromosome name information
  │   ├── chrNameLength.txt  # Chromosome name and length
  │   ├── chrStart.txt       # Chromosome start position
  │   ├── Genome             # Genome sequence compressed file
  │   ├── genomeParameters.txt # Genome parameter configuration
  │   ├── Log.out            # STAR index construction log
  │   ├── sjdbInfo.txt       # Splice junction database information
  │   ├── sjdbList.fromGTF.out.tab # Splice junctions extracted from GTF
  │   ├── sjdbList.out.tab   # List of all splice junctions
  │   └── mtgene.list        # List of mitochondrial genes
  └── ref.json               # Database configuration and metadata file
  </pre>
  </details>

**Default:** `./` (current directory)

**Example:**

```text
dnbc4tools rna mkref --fasta genome.fa --ingtf genes.gtf --genomeDir /database/scRNA/GRCh38
```

#### `--species` (Optional)

Identifiers cannot contain path separators, whitespace or reserved `_and_`.

Specify one or more species names for the reference database.

<ul>
  <li><strong>Function:</strong> This name is recorded in the configuration file and used for species identification, gene annotation, and cell annotation in subsequent analyses.</li>
</ul>

<details markdown="block" open>
  <summary><strong>Dual-Species Analysis Configuration</strong></summary>
  <ul>
    <li><strong>Naming Format:</strong> Use commas to separate multiple species names (e.g., <code>hg38,mm10</code>).</li>
    <li><strong>Order Requirement:</strong> Must be strictly consistent with the order of <code>--fasta</code> and <code>--ingtf</code> files.</li>
    <li><strong>Automatic Processing:</strong> The pipeline automatically adds a species prefix to genes (e.g., <code>hg38_GENE1</code>) and separates statistical information in the results.</li>
  </ul>
  </details>

<details markdown="block" open>
  <summary><strong>Cell Annotation Support</strong></summary>


Providing this parameter for specific species enables automatic downstream cell type annotation.

  <ul>
    <li><strong>Supported:</strong> <code>Homo_sapiens</code> (or <code>hg38</code>), <code>Mus_musculus</code> (or <code>mm10</code>).</li>
    <li><strong>Not Supported:</strong> Other species do not support cell annotation.</li>
  </ul>
  </details>

**Default:** `undefined`

**Examples:**

```text
# Single species
--species Homo_sapiens
```

```text
# Dual species (human + mouse)
--species hg38,mm10
```

#### `--threads` (Optional)

Set the number of CPU threads to be used during STAR index construction.

<ul>
  <li><strong>Performance Impact:</strong> Increasing the number of threads can significantly shorten the index construction time.</li>
  <li><strong>Resource Balance:</strong> Be mindful of the balance between the number of threads and available RAM; too many threads can lead to insufficient memory.</li>
</ul>

**Default:** `10`

**Example:**

```text
--threads 16
```

### Advanced Settings

#### `--chrM` (Optional)

Specify the name of the mitochondrial chromosome.

<ul>
  <li><strong>Function:</strong> Used to assess cell quality. High mitochondrial gene expression often indicates cell stress or death.</li>
  <li><strong>Auto-detection:</strong> By default, it will automatically identify from common names (e.g., <code>chrM</code>, <code>MT</code>).</li>
</ul>

**Default:** `auto`

**Example:**

```text
# If the mitochondrial chromosome name is "mitochondrion"
dnbc4tools rna mkref --fasta genome.fa --ingtf genes.gtf --chrM mitochondrion
```

#### `--limitram` (Optional)

Limit the maximum memory usage (in GB) during STAR genome index generation.

<ul>
  <li><strong>Function:</strong> This parameter controls the memory consumption during STAR index construction. The memory configuration of the index directly affects the memory usage and runtime speed of subsequent <code>rna run</code> analysis.</li>
  <li><strong>Impact:</strong> A higher memory limit enables the generation of higher-performance indexes, thereby speeding up RNA analysis, but increases memory consumption; a lower memory limit reduces index performance and may slow down analysis speed.</li>
  <li><strong>Recommendation:</strong> Set according to available system memory to avoid index construction failures due to insufficient memory.</li>
</ul>

**Default:** None

**Example:**

```text
--limitram 64
```

#### `--extra-args` (Advanced)

Pass additional command-line arguments directly to STAR index generation.

<ul>
  <li><strong>Function:</strong> For special requirements and performance optimization.</li>
  <li><strong>Note:</strong> Improper parameter settings can lead to index construction failure or subsequent analysis issues.</li>
</ul>

**Default:** None

**Example:**

```text
--extra-args "--sjdbOverhang 99 --runThreadN 20"
```

#### `--extra-args`

Validated STAR `genomeGenerate` arguments. Alignment-only and pipeline-managed options are rejected.

```bash
--extra-args "--sjdbOverhang 100 --genomeSAsparseD 2"
```

#### `--noindex` (Flag)

If this parameter is set, it will only generate the configuration file without building the genome index.

<ul>
  <li><strong>Function:</strong> Use this parameter to skip the time-consuming index construction step when the index files already exist.</li>
</ul>

**Default:** Not set

**Example:**

```text
# Generate only the configuration file, do not build the index
dnbc4tools rna mkref --fasta genome.fa --ingtf genes.gtf --noindex
```

**Database Construction Technical Notes:**

<ul>
  <li>For genomes with numerous and variably sized chromosomes, database construction automatically determines optimized values for <code>genomeSAindexNbases</code> and <code>genomeChrBinNbits</code>.</li>
  <li>After construction, a <code>ref.json</code> file is generated in the database directory to record all key configuration metadata.</li>
  <li>Dual-species analysis automatically adds a species prefix to each gene (for example, <code>hg38_GENE1</code> and <code>mm10_GENE2</code>) to distinguish genes across species.</li>
  <li>All build parameters and version information are recorded in <code>ref.json</code> to ensure reproducibility.</li>
</ul>

**Single-Species ref.json Example:**

```json
{
  "chrmt": "chrM",
  "genome": "/database/scRNA/Homo_sapiens/fasta/genome.fa",
  "genomeDir": "/database/scRNA/Homo_sapiens/star",
  "gtf": "/database/scRNA/Homo_sapiens/genes/genes.gtf",
  "input_fasta_files": [
    "genome.fa"
  ],
  "input_gtf_files": [
    "genes.gtf"
  ],
  "mtgenes": "/database/scRNA/Homo_sapiens/star/mtgene.list",
  "species": "Homo_sapiens",
  "version": "3.2"
}
```

**Dual-Species ref.json Example:**

```json
{
  "chrmt": "hg38_chrM,mm10_chrM",
  "genome": "/database/scRNA/hg38_and_mm10/fasta/genome.fa",
  "genomeDir": "/database/scRNA/hg38_and_mm10/star",
  "gtf": "/database/scRNA/hg38_and_mm10/genes/genes.gtf",
  "input_fasta_files": [
    "hg38_genome.fa",
    "mm10_genome.fa"
  ],
  "input_gtf_files": [
    "hg38_genes.gtf",
    "mm10_genes.gtf"
  ],
  "mtgenes": "/database/scRNA/hg38_and_mm10/star/mtgene.list",
  "species": "hg38_and_mm10",
  "version": "3.2"
}
```

**Performance Optimization Recommendations:**

<ul>
  <li>For common genomes (for example, human and mouse), pre-build indexes and reuse them across projects.</li>
  <li>Dual-species index construction takes longer; run it when sufficient compute resources are available.</li>
  <li>Regularly check updates from Ensembl and similar databases, and refresh reference genomes and annotations in time.</li>
</ul>

## Multi-sample Operations (multi) <a id="multi-sample-operations-multi"></a>

This command generates scripts without starting analysis. Use three TAB-separated columns: sample name, `cDNA_R1;cDNA_R2`, `oligo_R1;oligo_R2`. Commas join same-end lanes. Scripts are written to the working directory and never overwrite existing names; `--outdir` sets analysis output inside the scripts. Execute them after successful generation.

### Usage

```bash
dnbc4tools rna multi --list samples.tsv --genomeDir /reference/rna --threads 16
```

<details markdown="block" class="cli-help">
<summary>Full CLI help</summary>

```shell
$ dnbc4tools rna multi --help
dnbc4tools 3.2

Process multiple RNA-seq samples.

Usage: dnbc4tools rna multi [OPTIONS]

options:
  --help             show this help message and exit

Input Files:
  --list <FILE>      Tab-separated sample list: sample name <TAB> cDNA R1;R2 <TAB> oligo R1;R2. Multiple FASTQ files
                     within one end are comma-separated. Generates one shell script per sample in the current working
                     directory; run the generated scripts to start analysis.

Basic Settings:
  --genomeDir <DIR>  Reference genome directory path containing required reference files.
  --outdir <DIR>     Analysis output directory written into each generated script [default: current directory] (e.g.,
                     `./output`). Scripts are written to the current working directory.
  --threads <INT>    Number of CPU threads written into each generated analysis script.

Analysis Settings:
  --end5             Enable 5'-end single-cell transcriptome analysis.
```

</details>

### Parameter Description

### Required Parameters

#### `--list` (Required)

Specify the path to the list file containing information for multiple samples.

<ul>
  <li><strong>File Format:</strong> Tab-separated (<code>\t</code>) text file, UTF-8 encoding recommended.</li>
  <li><strong>Column Structure:</strong>
      <ol>
          <li>Sample Name</li>
          <li>cDNA Data Path</li>
          <li>Oligo Data Path</li>
      </ol>
  </li>
  <details markdown="block" open>
  <summary><strong>Path Format Rules</strong></summary>
  <ul>
      <li><strong>Multiple FASTQ files:</strong> Paths for multiple FASTQ files from the same library should be separated by commas (<code>,</code>).</li>
      <li><strong>R1 and R2 files:</strong> Paths for paired R1 and R2 files should be separated by semicolons (<code>;</code>).</li>
      <li><strong>Path Type:</strong> Both absolute and relative paths are supported.</li>
  </ul>
  </details>

</ul>

**Default:** None

<details markdown="block" open>
<summary><strong>Example:</strong></summary>

```text
# Example 1: SampleA, with 1 pair of R1/R2 files for cDNA and oligo each
SampleA	/path/to/A_cDNA_R1.fq.gz;/path/to/A_cDNA_R2.fq.gz	/path/to/A_oligo_R1.fq.gz;/path/to/A_oligo_R2.fq.gz
```

```text
# Example 2: SampleB, with 2 pairs of R1/R2 files for cDNA, and 1 pair for oligo
SampleB	/path/to/B_cDNA_L01_R1.fq.gz,/path/to/B_cDNA_L02_R1.fq.gz;/path/to/B_cDNA_L01_R2.fq.gz,/path/to/B_cDNA_L02_R2.fq.gz	/path/to/B_oligo_R1.fq.gz;/path/to/B_oligo_R2.fq.gz
```

</details>

> **Parameter Inheritance Note**
> > For other analysis parameter settings, please refer to the corresponding parameters of the [`dnbc4tools rna run`](#main-analysis-pipeline-run) command. All samples should use the same reference database.

> **Execution Behavior**
>
> `dnbc4tools rna multi` generates per-sample execution scripts (for example, `sample1.sh`) for batch submission and reuse. By default, it does not automatically run all sample analyses serially.

## Related Documentation

| Resource | Description |
| :--- | :--- |
| [scRNA Pipeline](../pipeline/scRNA.en.md) | Single-cell RNA analysis workflow guide |
| [scRNA Output](../outs/scRNA.en.md) | Detailed output file interpretation |
