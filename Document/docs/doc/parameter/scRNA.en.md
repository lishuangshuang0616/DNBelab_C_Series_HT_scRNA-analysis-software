# scRNA Parameters

DNBelab C Series HT scRNA Parameter Configuration Guide

## Overview <a id="概述"></a>

This document explains the parameter definitions, default behaviors, and standard usage patterns for `dnbc4tools rna` subcommands, including single-sample analysis (`run`), reference database construction (`mkref`), and multi-sample script generation (`multi`).

**Tip:** Parameter specifications are based on the latest command-line help messages. Examples can be used directly as operational templates.

## Main Analysis Workflow (run) <a id="v32-options"></a> <a id="主分析流程-run"></a>

### Usage <a id="usage"></a>

```bash
dnbc4tools rna run \
  --name sample1 \
  --fastqs /data/rna \
  --genomeDir /reference/rna \
  --threads 16
```

### Full Command-Line Help

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
  --consistent_cells <FILE>  Headered CSV or CSV.gz for merge/cell-calling constraints. Supported schemas: `cell`;
                             `cell,barcode`; `cell,is_cell_barcode`; `cell,barcode,is_cell_barcode`. Other columns are
                             ignored.

Library Settings:
  --chemistry <STR>          Library chemistry version. Auto-detected when omitted [default: auto]. Options:
                             `scRNAv1HT`, `scRNAv2HT`, `scRNAv3HT`, `scRNA5Pv1`.
  --darkreaction <STR>       Dark cycle setting for cDNA and oligo libraries. Auto-detected when omitted [default:
                             auto]. Provide two comma-separated values in the form `<cDNA>,<oligo>`.
                             cDNA=`R1`/`unset`; oligo=`R1R2`/`R1`/`unset`.
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

### Parameter Reference Tables

#### Required & Basic Settings

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--name` | String | **Required** | Unique sample identifier; used as output file prefix and report title (e.g., `sample_001`) |
| `--genomeDir` | Directory | **Required** | Reference directory containing STAR index and annotations built via `rna mkref` |
| `--outdir` | Directory | `./` | Root output directory for analysis results and HTML reports |
| `--threads` | Integer | All cores | Number of CPU threads allocated for parallel processing |

#### Input Files Options

Choose one input mode: directory-based (`--fastqs`) or explicit files (`--cDNAfastq1/2` and `--oligofastq1/2`).

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--fastqs` | Directory | None | FASTQ directory containing `cDNA/` and `oligo/` subdirectories (auto-detects paired files) |
| `--cDNAfastq1` | File path | None | cDNA Read 1 file list (supports comma-separated paths or wildcards `*`) |
| `--cDNAfastq2` | File path | None | cDNA Read 2 file list (order must strictly match `--cDNAfastq1`) |
| `--oligofastq1` | File path | None | Oligo Read 1 file list (supports comma-separated paths or wildcards `*`) |
| `--oligofastq2` | File path | None | Oligo Read 2 file list (order must strictly match `--oligofastq1`) |

> **Important:** All sequencing files in a single analysis run must originate from the same library preparation and share consistent dark reaction cycles; files from different libraries cannot be merged.

#### Cell Calling & QC Settings

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--calling_method` | `emptydrops` \| `barcoderanks` | `emptydrops` | Cell detection algorithm (`emptydrops`: expression test; `barcoderanks`: UMI inflection) |
| `--expectcells` | Integer \| `auto` | `auto` | Expected number of recovered cells to guide algorithm thresholding |
| `--forcecells` | Integer | None | Forces the pipeline to retain exactly this number of cells (highest priority, overrides auto-calling) |
| `--minumi` | Integer | `1000` | Minimum UMI threshold per cell; barcodes below this cutoff are excluded |
| `--consistent_cells` | CSV file | None | External cell whitelist or barcode merging constraint table (supports `.csv` / `.csv.gz`) |

#### Library Chemistry & Read Structure

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--chemistry` | Choice | `auto` | scRNA kit chemistry: `scRNAv1HT`, `scRNAv2HT`, `scRNAv3HT`, `scRNA5Pv1` |
| `--darkreaction` | Choice / String | `auto` | Dark cycle settings formatted as `<cDNA>,<oligo>` (e.g., `R1,R1R2`, `unset,unset`) |
| `--customize` | String | None | Custom barcode/read structure definition; specify twice (first cDNA, then oligo) |

#### Analysis Settings & Tuning

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--no_introns` | Flag | Disabled | Exclude intronic reads and quantify expression strictly using exonic alignments |
| `--end5` | Flag | Disabled | Enable 5'-end scRNA-seq mode (for 5' transcript capture kits) |
| `--no_bam` | Flag | Disabled | Skip BAM file generation to save disk space and runtime |
| `--sample_read_pairs` | Integer | None | Subsample a specified number of cDNA read pairs for rapid benchmarking |
| `--star_parameters` | String | None | Additional arguments passed to STAR aligner (must be wrapped in quotes) |

---

### Key Parameter Deep Dives

#### 1. FASTQ Directory Structure & Input Rules

When using `--fastqs`, the pipeline resolves paired-end files based on subdirectory naming:

```text
fastq_directory/
├── cDNA/
│   ├── sample_cDNA_L01_R1.fastq.gz
│   └── sample_cDNA_L01_R2.fastq.gz
└── oligo/
    ├── sample_oligo_L01_R1.fastq.gz
    └── sample_oligo_L01_R2.fastq.gz
```

- **Naming detection**: Supports standard read patterns `_R1_`, `_R1`, `_1`, `_read1` paired with `_R2_`, `_R2`, `_2`, `_read2`; file extensions support `.fastq.gz`, `.fq.gz`, `.fastq`, `.fq`.
- **Individual inputs**: If not using `--fastqs`, all four options `--cDNAfastq1`, `--cDNAfastq2`, `--oligofastq1`, and `--oligofastq2` must be supplied. Multiple lanes are comma-separated and R1/R2 pairs must align sequentially.

#### 2. Cell Calling Algorithms & Diagnosis Strategies

The pipeline offers two complementary cell identification methods:

| Method | Principle | Strengths & Best Use Cases |
| :--- | :--- | :--- |
| **`emptydrops`** (Default) | Dirichlet-multinomial statistical test comparing non-empty droplets against ambient RNA profiles | Accurately identifies low-RNA cells while controlling false positives; recommended for almost all tissue samples |
| **`barcoderanks`** | Empirical inflection thresholding on total UMI rank curves | Fast and lightweight; suitable for high-contrast samples or rapid preliminary quality screening |

**UMI Rank Curve Diagnostics & Decisions:**

- **Steep drop**: Clear distinction between genuine cells and background droplets; default settings yield optimal results.
- **Gradual decline / No clear inflection**: High ambient RNA contamination or damaged cells. Use conservative cell counts by setting `--expectcells` or increasing `--minumi 1500`.
- **Cell count mismatch**:
  - *Too low*: Check if `--minumi` is overly stringent or if sequencing depth is low; try lowering to `--minumi 500`.
  - *Too high*: Background noise droplets included; use `--forcecells <N>` to lock the target cell count directly.

#### 3. External Cell Whitelist Constraints (`--consistent_cells`)

Injects prior cell information during barcode merging and cell identification (e.g., cross-omics barcode pairing or historical gold standards). Supports headered `.csv` or `.csv.gz`:

| Header Schema | Function |
| :--- | :--- |
| `cell` | Constrains final identified valid cell barcode list |
| `cell,barcode` | Enforces explicit bead-to-cell merging mapping; **bypasses Oligo analysis and applies this mapping directly** |
| `cell,is_cell_barcode` | Supplies candidate barcodes and explicitly flags whether each is a genuine cell |
| `cell,barcode,is_cell_barcode` | Complete constraint schema (compatible with legacy 6-column summary tables) |

#### 4. Chemistry & Dark Reaction Configuration (`--chemistry` & `--darkreaction`)

- **Chemistry (`--chemistry`)**: Supports `scRNAv1HT`, `scRNAv2HT`, `scRNAv3HT`, `scRNA5Pv1`. Defaults to `auto`.
- **Dark Reaction (`--darkreaction`)**: Configures dark cycles for MGI sequencing platforms.
  - Automatic detection: `--darkreaction auto`
  - Manual format: `<cDNA>,<oligo>`:
    - cDNA options: `R1` or `unset`
    - Oligo options: `R1R2`, `R1`, or `unset`
    - Common combinations: `--darkreaction R1,R1R2`, `--darkreaction unset,unset`
  - **Rule**: If `--chemistry` is specified manually, `--darkreaction` must also be explicitly set.

#### 5. Custom Read Structure (`--customize`)

For non-standard library protocols, use `--customize` to define exact 1-based intervals for barcodes, UMIs, and reads.

- **Syntax**: `"<type>,<read>:<start>-<end>"`, delimited by semicolons `;`.
  - `cb`: Cell Barcode
  - `umi`: Unique Molecular Identifier
  - `R1` / `R2`: Usable read sequence
- **Rule**: Must be passed **twice sequentially** for scRNA: first for cDNA, second for oligo.

```bash
# cDNA: R1(1-10bp CB, 11-20bp CB, 21-30bp UMI), R2(1-100bp cDNA)
# Oligo: R1(1-10bp CB, 11-20bp CB), R2(1-30bp Tag)
dnbc4tools rna run \
  --name custom_demo --genomeDir ./ref \
  --cDNAfastq1 cdna_R1.fq.gz --cDNAfastq2 cdna_R2.fq.gz \
  --oligofastq1 oligo_R1.fq.gz --oligofastq2 oligo_R2.fq.gz \
  --customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R2:1-100" \
  --customize "cb,R1:1-10;cb,R1:11-20;R1,R2:1-30"
```

#### 6. STAR Parameters & BAM Resource Scheduling

Pass validated STAR alignment, filtering, or scoring parameters via `--star_parameters`:

```bash
--star_parameters "--outFilterMismatchNmax 10 --outFilterMultimapNmax 1"
```

<details markdown="block">
<summary>Advanced Settings: BAM Resource Scheduling</summary>

BAM generation is auto-scheduled based on CPU cores, file handles, and estimated RAM. You may override these with internal flags:

| Parameter | Description |
| :--- | :--- |
| `--bam-workers` | Maximum concurrent chunk worker processes |
| `--bam-compression-threads` | Compression threads allocated per chunk worker |
| `--bam-queue-depth` | Queue depth buffer per sample writer |
| `--bam-max-memory-gb` | Estimated memory budget in GiB (not an RSS ceiling) |
| `--bam-compression-level` | Gzip compression level (0–9; defaults to HTSlib) |
| `--bam-limit-memory` | Aborts execution if even one worker exceeds estimated budget |

If disk space or speed is a priority and downstream BAM inspection is not required, use `--no_bam` to skip BAM output entirely.

</details>

---

## Reference Database Construction (mkref) <a id="参考数据库构建-mkref"></a>

`dnbc4tools rna mkref` builds a STAR index database from reference FASTA and GTF annotation files.

### Usage

```bash
dnbc4tools rna mkref \
  --fasta genome.fa --ingtf genes.gtf \
  --species human --genomeDir /reference/rna --threads 16
```

### Full Command-Line Help

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
  --species <STR>     Species identifier(s) [default: undefined]. For mixed-species references, provide
                      comma-separated names in the same order as --fasta and --ingtf (e.g., `human,mouse`).
  --threads <INT>     Number of CPU threads for parallel processing [default: all available cores] (e.g., `16`).

Advanced Settings:
  --chrM <STR>        Mitochondrial chromosome name [default: auto-detect common names]. For mixed-species references,
                      provide comma-separated names in --species order (e.g., `MT,chrM`).
  --limitram <INT>    RAM limit for STAR index generation, in GiB (e.g., `64`). Omit to use STAR's default. Index
                      sparsity can affect mapping memory use and speed.
  --extra-args <STR>  Additional validated STAR genomeGenerate parameters (e.g., `"--sjdbOverhang 100
                      --genomeSAsparseD 2"`). Preflight rejects alignment-only, unknown and mkref-managed parameters.
  --noindex           Skip the STAR index-generation step.
```

### Parameter Reference Tables

#### Required & Basic Settings

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--fasta` | File path | **Required** | Reference genome FASTA file(s) (comma-separated for mixed species, e.g., `human.fa,mouse.fa`) |
| `--ingtf` | File path | **Required** | Gene annotation GTF file(s) (comma-separated for mixed species, e.g., `human.gtf,mouse.gtf`) |
| `--genomeDir` | Directory | `./` | Output directory path for generated reference database files |
| `--species` | String | `undefined` | Species identifier(s), comma-separated for mixed species (e.g., `human,mouse`) |
| `--threads` | Integer | All cores | Number of CPU threads for STAR indexing and annotation processing |

#### Advanced Settings

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--chrM` | String | Auto-detect | Mitochondrial chromosome name(s) in species order (e.g., `MT,chrM`) |
| `--limitram` | Integer (GiB) | STAR default | RAM limit in GiB for STAR index construction |
| `--extra-args` | String | None | Validated additional parameters passed to STAR `genomeGenerate` |
| `--noindex` | Flag | Disabled | Generates metadata and preprocessed annotations without building STAR index |

---

### Reference Architecture & Key Configurations

#### 1. GTF Annotation Requirements & Dual-Species Reference

- **GTF Format Rules**:
  - Must adhere to standard GTF format (GFF/GFF3 not supported).
  - Must include `gene` or `transcript` features as well as `exon` rows.
  - Attributes must include `gene_id` or `gene_name`, and `transcript_id` or `transcript_name`.
  - Chromosome identifiers must strictly match FASTA headers.
- **Mixed-Species Reference**:
  - `--fasta`, `--ingtf`, and `--species` accept comma-separated inputs with matching order:
    ```bash
    dnbc4tools rna mkref \
      --fasta human.fa,mouse.fa \
      --ingtf human.gtf,mouse.gtf \
      --species human,mouse \
      --genomeDir /ref/human_and_mouse
    ```
  - Gene names and chromosomes are automatically prefixed with the species name (e.g., `human_GAPDH`, `mouse_Actb`) for clean cross-species separation.

#### 2. Directory Layout & `ref.json` Metadata

A successfully built reference directory contains:

```text
genomeDir/
├── fasta/
│   └── genome.fa          # Unified processed FASTA sequence
├── genes/
│   └── genes.gtf          # Standardized gene annotation
├── star/
│   ├── SA                 # STAR genome index
│   ├── SAindex            # STAR index parameters
│   ├── chrLength.txt      # Chromosome lengths
│   ├── chrName.txt        # Chromosome names
│   ├── mtgene.list        # Mitochondrial gene list for QC
│   └── genomeParameters.txt
└── ref.json               # Reference configuration and provenance
```

**Single-Species `ref.json` Example:**

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

**Dual-Species `ref.json` Example:**

```json
{
  "chrmt": "human_chrM,mouse_chrM",
  "genome": "/database/scRNA/human_and_mouse/fasta/genome.fa",
  "genomeDir": "/database/scRNA/human_and_mouse/star",
  "gtf": "/database/scRNA/human_and_mouse/genes/genes.gtf",
  "input_fasta_files": [
    "human.fa",
    "mouse.fa"
  ],
  "input_gtf_files": [
    "human.gtf",
    "mouse.gtf"
  ],
  "mtgenes": "/database/scRNA/human_and_mouse/star/mtgene.list",
  "species": "human_and_mouse",
  "version": "3.2"
}
```

---

## Multi-Sample Workflow (multi) <a id="多样本操作-multi"></a>

`dnbc4tools rna multi` generates standalone executable shell scripts for each sample defined in a tab-separated list file. It does not launch analyses automatically.

### Usage

```bash
dnbc4tools rna multi --list samples.tsv --genomeDir /reference/rna --threads 16
```

### Full Command-Line Help

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
  --threads <INT>    Number of CPU threads written into each generated analysis script. If omitted, each analysis
                     detects available cores when it runs.

Analysis Settings:
  --end5             Enable 5'-end single-cell transcriptome analysis.
  --no_bam           Skip BAM file generation for every sample in the generated scripts.
```

### Parameter Reference Tables

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--list` | File path | **Required** | Tab-separated sample list file |
| `--genomeDir` | Directory | **Required** | Reference genome directory path |
| `--outdir` | Directory | `./` | Output root directory written into each sample script (scripts are generated in current working directory) |
| `--threads` | Integer | Auto-detect | Thread count configured inside each generated script |
| `--end5` | Flag | Disabled | Enables 5'-end scRNA analysis mode in generated scripts |
| `--no_bam` | Flag | Disabled | Skips BAM generation in all generated scripts |

---

### Sample List Rules & Execution Workflow

#### 1. `--list` File Specification

The sample list must be a tab-separated (`\t`) text file with 3 columns:
1. **Sample Name** (`sample_name`)
2. **cDNA FASTQ Paths** (paired R1 and R2 separated by semicolon `;`, multiple lane files comma-separated `,`)
3. **Oligo FASTQ Paths** (paired R1 and R2 separated by semicolon `;`, multiple lane files comma-separated `,`)

```tsv
SampleA	/data/A_cDNA_R1.fq.gz;/data/A_cDNA_R2.fq.gz	/data/A_oligo_R1.fq.gz;/data/A_oligo_R2.fq.gz
SampleB	/data/B_cDNA_L1_R1.fq.gz,/data/B_cDNA_L2_R1.fq.gz;/data/B_cDNA_L1_R2.fq.gz,/data/B_cDNA_L2_R2.fq.gz	/data/B_oligo_R1.fq.gz;/data/B_oligo_R2.fq.gz
```

#### 2. Execution & Cluster Dispatch

- Running `dnbc4tools rna multi` creates per-sample shell scripts (e.g., `SampleA.sh`, `SampleB.sh`) in the current directory.
- Each script contains the complete parameterized `dnbc4tools rna run` command.
- Users can execute scripts directly via `bash SampleA.sh` or submit them to batch workload managers (e.g., Slurm, SGE) for cluster execution.
