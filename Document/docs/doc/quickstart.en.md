# Quick Start Guide

This guide provides end-to-end operational walkthroughs for the DNBelab C Series™ single-cell analysis suite (dnbc4tools), covering system prerequisites, reference genome indexing, single-modality pipelines, integrated multi-omics orchestration, C6 multiplexed single-cell RNA analysis, and batch analysis script generation.

---

## Choose a Workflow <a id="choose-workflow"></a>

Select the appropriate command entry point according to your experimental design and library preparation:

| Workflow | Command Entry Point | Scope & Description |
| :--- | :--- | :--- |
| [**Single-Cell RNA Analysis**](#single-cell-rna-analysis) | `dnbc4tools rna run` | Single-sample gene expression quantification, EmptyDrops cell calling, and clustering |
| [**Single-Cell ATAC Analysis**](#single-cell-atac-analysis) | `dnbc4tools atac run` | Single-sample chromatin accessibility analysis, peak calling, and QC |
| [**Single-Cell V(D)J Analysis**](#single-cell-vdj-analysis) | `dnbc4tools vdj run` | De novo TCR / BCR immune repertoire assembly, annotation, and clonotyping |
| [**Integrated Multi-Omics**](#integrated-multi-omics-analysis) | `dnbc4tools multi run --csv multi.csv` | Unified orchestration and cross-modality reporting for RNA + ATAC + VDJ |
| [**C6 Multiplexed RNA**](#c6-multi-sample-analysis) | `dnbc4tools multi run --csv sample.config.csv` | Sample Barcode pooled RNA-seq de-multiplexing and per-sample dedicated delivery |
| [**Batch Script Generation**](#batch-script-generation) | `dnbc4tools <rna/atac> multi` | Batch-generate standalone analysis scripts for queued HPC scheduling |

---

## Prerequisites <a id="prerequisites"></a>

<div style="background-color: #e7f3fe; border-left: 6px solid #2196F3; padding: 15px; margin: 1.5em 0; border-radius: 4px;" markdown="block">
<strong>Before you begin:</strong>
<ul style="margin-bottom: 0;">
  <li>Verify software installation and CLI availability. See the <a href="./installation.html">Installation Guide</a>.</li>
  <li>Replace <code>$dnbc4tools</code> in all example commands with your actual executable path (e.g., <code>/opt/software/dnbc4tools3.2/dnbc4tools</code>).</li>
  <li>The backslash <code>\</code> is used solely for multi-line layout in documentation and can be executed as a single continuous command line in your shell.</li>
</ul>
</div>

### `--fastqs` Directory Auto-Detection Rules <a id="file-naming-conventions"></a>

When using directory-based input via `--fastqs <dir>`, the pipeline automatically scans the folder and pairs paired-end reads matching the following patterns:

| Read End | Match Pattern | Example Filenames |
| :--- | :--- | :--- |
| **Read 1 (R1)** | Contains `_R1_`, `_R1`, `_1`, or `_read1` | `sample_R1.fastq.gz`, `sample_1.fq.gz`, `sample_R1_001.fastq.gz` |
| **Read 2 (R2)** | Contains `_R2_`, `_R2`, `_2`, or `_read2` | `sample_R2.fastq.gz`, `sample_2.fq.gz`, `sample_R2_001.fastq.gz` |

* **Supported Extensions**: `.fastq.gz`, `.fq.gz`, `.fastq`, `.fq`
* **Explicit File Arguments Bypass Naming Restrictions**: If files are provided via explicit flags (e.g., `--fastq1/--fastq2` or RNA `--cDNAfastq1/2`, `--oligofastq1/2`), file names do not need to follow these patterns, but the list ordering between paired reads must match strictly.

---

## Single-Cell RNA Analysis <a id="single-cell-rna-analysis"></a>

Designed for standard single-sample 3′ or 5′ single-cell transcriptomic profiling and clustering.

### Step 1: Build Reference Genome

Using Human, Mouse, and Human-Mouse dual-species as common references:

**Human (GRCh38)**
```bash
# 1. Download GENCODE annotation and genomic FASTA
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/GRCh38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/gencode.v32.primary_assembly.annotation.gtf.gz

# 2. Decompress files
gzip -d GRCh38.primary_assembly.genome.fa.gz
gzip -d gencode.v32.primary_assembly.annotation.gtf.gz

# 3. Filter GTF and generate STAR genome index
$dnbc4tools tools mkgtf --ingtf gencode.v32.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools rna mkref --ingtf genes.filtered.gtf --fasta GRCh38.primary_assembly.genome.fa --threads 10 --species Homo_sapiens
```

**Mouse (Mus musculus, GRCm38)**
```bash
# 1. Download annotation and FASTA
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/GRCm38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/gencode.vM23.primary_assembly.annotation.gtf.gz

# 2. Decompress files
gzip -d GRCm38.primary_assembly.genome.fa.gz
gzip -d gencode.vM23.primary_assembly.annotation.gtf.gz

# 3. Filter GTF and generate STAR genome index
$dnbc4tools tools mkgtf --ingtf gencode.vM23.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools rna mkref --ingtf genes.filtered.gtf --fasta GRCm38.primary_assembly.genome.fa --threads 10 --species Mus_musculus
```

**Human-Mouse Mixed-Species Reference**
```bash
# Combine FASTA and GTF after preparing both species
$dnbc4tools rna mkref \
    --fasta GRCh38.primary_assembly.genome.fa,GRCm38.primary_assembly.genome.fa \
    --ingtf hg38/genes.filtered.gtf,mm10/genes.filtered.gtf \
    --species hg38,mm10 \
    --threads 10
```

### Step 2: Run RNA Pipeline

Organize your sequencing files under structured subdirectories containing `cDNA/` and `oligo/`. The pipeline will automatically identify and pair FASTQ files:

```text
/test/data/rna_fastqs/          # Root directory passed to --fastqs
├── cDNA/                       # Transcriptomic cDNA sequencing reads
│   ├── sample_cDNA_R1.fastq.gz
│   └── sample_cDNA_R2.fastq.gz
└── oligo/                      # Bead/barcode Oligo sequencing reads
    ├── sample_oligo_R1.fastq.gz
    └── sample_oligo_R2.fastq.gz
```

**Method 1: Directory Input (Recommended)**

```bash
$dnbc4tools rna run \
    --fastqs /test/data/rna_fastqs \
    --genomeDir /database/scRNA/Homo_sapiens \
    --name test_rna \
    --threads 30
```

**Method 2: Explicit Individual FASTQ Inputs**

When sequencing files are not grouped into `cDNA/` and `oligo/` subdirectories, or are distributed across separate storage paths, specify each input file explicitly using dedicated arguments (comma-separated lists supported):

```bash
$dnbc4tools rna run \
    --cDNAfastq1 /test/data/cDNA/sample_R1.fastq.gz \
    --cDNAfastq2 /test/data/cDNA/sample_R2.fastq.gz \
    --oligofastq1 /test/data/oligo/sample_oligo_R1.fastq.gz \
    --oligofastq2 /test/data/oligo/sample_oligo_R2.fastq.gz \
    --genomeDir /database/scRNA/Homo_sapiens \
    --name test_rna \
    --threads 30
```

---

## Single-Cell ATAC Analysis <a id="single-cell-atac-analysis"></a>

Designed for single-cell chromatin accessibility analysis, peak calling, and transcription factor motif enrichment.

### Step 1: Build ATAC Reference

**Human (GRCh38)**
```bash
# 1. Download GENCODE annotation and genomic FASTA
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/GRCh38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/gencode.v32.primary_assembly.annotation.gtf.gz

# 2. Decompress files
gzip -d GRCh38.primary_assembly.genome.fa.gz
gzip -d gencode.v32.primary_assembly.annotation.gtf.gz

# 3. Filter GTF and build Chromap reference index
$dnbc4tools tools mkgtf --ingtf gencode.v32.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools atac mkref --fasta GRCh38.primary_assembly.genome.fa --ingtf genes.filtered.gtf --species Homo_sapiens --prefix chr
```

**Mouse (Mus musculus, GRCm38)**
```bash
# 1. Download annotation and FASTA
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/GRCm38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/gencode.vM23.primary_assembly.annotation.gtf.gz

# 2. Decompress files
gzip -d GRCm38.primary_assembly.genome.fa.gz
gzip -d gencode.vM23.primary_assembly.annotation.gtf.gz

# 3. Filter GTF and build Chromap reference index
$dnbc4tools tools mkgtf --ingtf gencode.vM23.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools atac mkref --fasta GRCm38.primary_assembly.genome.fa --ingtf genes.filtered.gtf --species Mus_musculus --prefix chr
```

**Human-Mouse Mixed-Species Reference**
```bash
# Combine FASTA and filtered GTF after preparing both species (--prefix is not supported for mixed-species)
$dnbc4tools atac mkref \
    --fasta GRCh38.primary_assembly.genome.fa,GRCm38.primary_assembly.genome.fa \
    --ingtf hg38/genes.filtered.gtf,mm10/genes.filtered.gtf \
    --species hg38,mm10
```

### Step 2: Run ATAC Pipeline

Place sequencing files in a designated folder or provide paired-end files explicitly:

```text
/test/data/atac_fastqs/          # Root directory passed to --fastqs
├── sample_R1.fastq.gz
└── sample_R2.fastq.gz
```

**Method 1: Directory Input (Recommended)**

```bash
$dnbc4tools atac run \
    --fastqs /test/data/atac_fastqs \
    --genomeDir /database/scATAC/Homo_sapiens \
    --name test_atac \
    --threads 10
```

**Method 2: Explicit Individual FASTQ Inputs**

```bash
$dnbc4tools atac run \
    --fastq1 /test/data/sample_R1.fastq.gz \
    --fastq2 /test/data/sample_R2.fastq.gz \
    --genomeDir /database/scATAC/Homo_sapiens \
    --name test_atac \
    --threads 10
```

---

## Single-Cell V(D)J Analysis <a id="single-cell-vdj-analysis"></a>

Designed for full-length TCR / BCR immune repertoire de novo assembly, annotation, and clonotyping.

<div style="background-color: #fffbe6; border-left: 6px solid #ffc107; padding: 15px; margin: 1.5em 0; border-radius: 4px;" markdown="block">
<strong>Prerequisite:</strong> VDJ analysis requires matched 5′ scRNA-seq data. You must first execute the RNA pipeline with the <code>--end5</code> flag to generate the cell-to-bead translation table <code>singlecell.csv</code>.
</div>

### Step 1: Run 5′ RNA Pipeline

```bash
$dnbc4tools rna run \
    --fastqs /test/data/rna_5p_fastqs \
    --genomeDir /database/scRNA/Homo_sapiens \
    --name test_rna_5p \
    --threads 30 \
    --end5
```

### Step 2: Run V(D)J Pipeline

Organize your sequencing files under a designated directory or provide FASTQ files explicitly:

```text
/test/data/vdj_fastqs/          # Root directory passed to --fastqs
├── sample_R1.fastq.gz
└── sample_R2.fastq.gz
```

**Method 1: Directory Input (Recommended)**

*Human TCR Analysis*
```bash
$dnbc4tools vdj run \
    --fastqs /test/data/tcr_fastqs \
    --beadstrans ./test_rna_5p/outs/singlecell.csv \
    --ref human \
    --name test_human_tcr \
    --threads 20 \
    --chain TR
```

*Human BCR Analysis*
```bash
$dnbc4tools vdj run \
    --fastqs /test/data/bcr_fastqs \
    --beadstrans ./test_rna_5p/outs/singlecell.csv \
    --ref human \
    --name test_human_bcr \
    --threads 20 \
    --chain IG
```

**Method 2: Explicit Individual FASTQ Inputs**

When files are located in separate storage paths, provide them via `--fastq1` and `--fastq2`:

*Human TCR Analysis (Explicit Files)*
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data/tcr/sample_R1.fastq.gz \
    --fastq2 /test/data/tcr/sample_R2.fastq.gz \
    --beadstrans ./test_rna_5p/outs/singlecell.csv \
    --ref human \
    --name test_human_tcr \
    --threads 20 \
    --chain TR
```

*Human BCR Analysis (Explicit Files)*
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data/bcr/sample_R1.fastq.gz \
    --fastq2 /test/data/bcr/sample_R2.fastq.gz \
    --beadstrans ./test_rna_5p/outs/singlecell.csv \
    --ref human \
    --name test_human_bcr \
    --threads 20 \
    --chain IG
```

<details markdown="block">
<summary>Click to expand: Mouse TCR and BCR Analysis Examples</summary>

**Mouse TCR Analysis**

```bash
$dnbc4tools vdj run \
    --fastqs /test/data/mouse_tcr_fastqs \
    --beadstrans ./test_mouse_rna_5p/outs/singlecell.csv \
    --ref mouse \
    --name test_mouse_tcr \
    --threads 20 \
    --chain TR
```

**Mouse BCR Analysis**

```bash
$dnbc4tools vdj run \
    --fastqs /test/data/mouse_bcr_fastqs \
    --beadstrans ./test_mouse_rna_5p/outs/singlecell.csv \
    --ref mouse \
    --name test_mouse_bcr \
    --threads 20 \
    --chain IG
```

</details>

---

## Integrated Multi-Omics Analysis <a id="integrated-multi-omics-analysis"></a>

Designed for experimental workflows profiling RNA, ATAC, and V(D)J simultaneously from the same biological sample, providing coordinated execution and a unified interactive report.

### Step 1: Prepare Multi-Omics Configuration (`multi_config.csv`)

```ini
[libraries]
fastqs,feature_types
/test/data/rna,rna
/test/data/atac,atac
/test/data/vdj-t,vdj-t
/test/data/vdj-b,vdj-b

[rna]
genomeDir,/database/scRNA/Homo_sapiens
end5,true

[atac]
genomeDir,/database/scATAC/Homo_sapiens

[vdj-t]
ref,human

[vdj-b]
ref,human
```

### Step 2: Execute Multi-Omics Pipeline

```bash
$dnbc4tools multi run \
    --name test_multi \
    --csv ./multi_config.csv \
    --threads 20
```

Upon completion, the comprehensive interactive report `test_multi_multi_report.html` and individual omics subdirectories are delivered directly under `./test_multi/outs/`.

---

## C6 Multiplexed Single-Cell RNA Analysis <a id="c6-multi-sample-analysis"></a>

Designed for high-throughput experiments where multiple biological samples are pooled and tagged with Sample Barcodes before sequencing. The bioinformatics pipeline demultiplexes reads automatically and delivers isolated outputs for each individual sample.

### Step 1: Prepare C6 Configuration (`sample.config.csv`)

Create a configuration file containing `[rna]`, `[libraries]`, and `[samples]` sections:

```csv
[rna]
genomeDir,/database/scRNA/Homo_sapiens
no_bam,true

[libraries]
fastqs,feature_types
/test/data/c6_pooled_data,rna

[samples]
sample_id,probe_barcode_ids
Sample_01,BC01
Sample_02,BC02;BC03
```

> **Configuration Notes:**
> 
> * **`[samples]` Section**: Specifies each biological sample name and its assigned Sample Barcode tag(s). If multiple barcodes belong to a single sample, separate them with semicolons `;` (e.g., `BC02;BC03`).
> * **Sequencing Data Directory**: `/test/data/c6_pooled_data` must contain the pooled `cDNA/` and `oligo/` subdirectories and FASTQ files.

### Step 2: Execute C6 Pipeline

```bash
$dnbc4tools multi run \
    --name test_c6 \
    --csv ./sample.config.csv \
    --threads 40
```

### Step 3: Core Deliverables

Upon completion, outputs are archived under `./test_c6/outs/`:

* **Batch Summary Report**: `test_c6_multi_report.html`, providing comparative cell yields, sequencing saturation, and throughput metrics across all demultiplexed samples;
* **Global Combined Feature-Barcode Matrix**: `rna/filtered_feature_bc_matrix/` (delivered in MEX, H5, and H5AD formats);
* **Global Single-Cell Bead Metrics**: `rna/singlecell.csv.gz` (streamed gzip compression with `is_cell_barcode` cell annotations);
* **Per-Sample Isolated Outputs**: `rna/per_sample_outs/<sample>/`, containing independent expression matrices, dedicated alignment BAM files (`<sample>_alignments.bam`), and interactive HTML reports.

---

## Batch Script Generation <a id="batch-script-generation"></a>

Designed for scaling up analysis across dozens of independent single-cell samples. By providing a tab-separated sample list, dnbc4tools automatically generates standalone shell scripts for each sample, ready to run directly or queue through workload managers such as Slurm or SGE.

### Step 1: Prepare Sample Manifest

**RNA Sample Manifest (`rna_samples.tsv`)**

Tab-delimited with 3 columns: `sample_id`, `cDNA_R1;cDNA_R2`, `oligo_R1;oligo_R2` (comma-separated for multi-lane files per read):

```text
Sample1	sample1_cDNA_R1.fq.gz;sample1_cDNA_R2.fq.gz	sample1_oligo_R1.fq.gz;sample1_oligo_R2.fq.gz
Sample2	sample2_cDNA_R1.fq.gz;sample2_cDNA_R2.fq.gz	sample2_oligo_R1.fq.gz;sample2_oligo_R2.fq.gz
```

**ATAC Sample Manifest (`atac_samples.tsv`)**

Tab-delimited with 2 columns: `sample_id`, `FASTQ_R1;FASTQ_R2` (comma-separated for multi-lane files per read):

```text
Sample1	sample1_R1.fq.gz;sample1_R2.fq.gz
Sample2	sample2_R1.fq.gz;sample2_R2.fq.gz
```

### Step 2: Generate Analysis Scripts

```bash
# Batch generate RNA execution scripts
$dnbc4tools rna multi \
    --list ./rna_samples.tsv \
    --genomeDir /database/scRNA/Homo_sapiens \
    --threads 20

# Batch generate ATAC execution scripts
$dnbc4tools atac multi \
    --list ./atac_samples.tsv \
    --genomeDir /database/scATAC/Homo_sapiens \
    --threads 20
```

> **Execution Behavior:**
> The `multi` command generates standalone `.sh` scripts (e.g., `run_Sample1.sh`) in the current working directory without automatically starting computational workloads. Execute generated scripts on demand (e.g., `sh run_Sample1.sh`) or submit them to your HPC cluster queue.

---

After completing the quick start walkthroughs, consult detailed documentation for advanced options:

* Explore underlying pipeline workflows: [Pipeline Overview](./pipeline/pipeline.md)
* Learn comprehensive parameters and CLI options: [Parameters Overview](./parameter/parameter.md)
* Understand structured deliverable files: [Output Deliverables Overview](./outs/outs.md)
