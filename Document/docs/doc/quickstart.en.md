# Quick Start Guide

**Operational Quick-Start for dnbc4tools**

[RNA-seq](#single-cell-rna-analysis) • [ATAC-seq](#single-cell-atac-analysis) • [VDJ-seq](#single-cell-vdj-analysis) • [Multi-omics](#integrated-multi-omics-analysis)

<a id="file-naming-conventions"></a>

## Choose a workflow

| Task | Entry point |
| :--- | :--- |
| Ordinary single-sample RNA / ATAC / VDJ | `rna run` / `atac run` / `vdj run` |
| Integrated multi-omics | `multi run --csv config.csv` |
| C6 probe-barcoded samples | `multi run --csv c6.csv` with `[samples]` and RNA chemistry `scRNAC6` |
| Independent RNA / ATAC batch jobs | `rna multi` / `atac multi` generate scripts to execute separately |

Start C6 with the [complete Multi configuration example](parameter/multi.md#c6-samples). Read the [Upgrade Guide](migration.md) for new matrix paths, C6 gzip summaries and default ATAC cutsite counting. Formal 3.2 download details await release confirmation.

## Prerequisites

> **Before you begin:**
> - Ensure dnbc4tools is installed. See the [Installation Guide](./installation.md).
> - In all commands, replace `$dnbc4tools` with your actual installation path (e.g., `/opt/software/dnbc4tools3.2/dnbc4tools`).
> - The backslash `\` is used to split a single command across multiple lines for readability. It is optional.

<a id="file-naming-conventions"></a>

> **`--fastqs` automatic file naming conventions**
>
> When using directory-based input with `--fastqs`, the pipeline automatically detects paired-end files based on file names. The following patterns are supported. When files are specified explicitly with `--fastq1/--fastq2`, or with RNA-specific `--cDNAfastq1/2` and `--oligofastq1/2`, these naming patterns are not required, but the R1/R2 file order must match exactly.
> - **Supported extensions:** `.fastq.gz`, `.fq.gz`, `.fastq`, `.fq`
> - **R1 patterns:** `_R1_`, `_R1`, `_1`, `_read1`
> - **R2 patterns:** `_R2_`, `_R2`, `_2`, `_read2`
>
> Examples: `sample_R1.fastq.gz`, `sample_1.fastq.gz`, `sample_R1_001.fastq.gz` are all recognized as R1 files.

## Single-Cell RNA Analysis <a id="single-cell-rna-analysis"></a>

> Gene expression profiling at single-cell resolution

### Step 1: Build Reference Genome

**Human (GRCh38)**
```bash
# Download reference files
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/GRCh38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/gencode.v32.primary_assembly.annotation.gtf.gz

# Extract files
gzip -d GRCh38.primary_assembly.genome.fa.gz
gzip -d gencode.v32.primary_assembly.annotation.gtf.gz

# Build reference
$dnbc4tools tools mkgtf --ingtf gencode.v32.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools rna mkref --ingtf genes.filtered.gtf --fasta GRCh38.primary_assembly.genome.fa --threads 10 --species Homo_sapiens
```

**Mouse (GRCm38)**
```bash
# Download reference files
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/GRCm38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/gencode.vM23.primary_assembly.annotation.gtf.gz

# Extract files
gzip -d GRCm38.primary_assembly.genome.fa.gz
gzip -d gencode.vM23.primary_assembly.annotation.gtf.gz

# Build reference
$dnbc4tools tools mkgtf --ingtf gencode.vM23.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools rna mkref --ingtf genes.filtered.gtf --fasta GRCm38.primary_assembly.genome.fa --threads 10 --species Mus_musculus
```

**Human-Mouse Mixed Reference**
```bash
# Prepare both references as above, then:
$dnbc4tools rna mkref \
    --fasta GRCh38.primary_assembly.genome.fa,GRCm38.primary_assembly.genome.fa \
    --ingtf hg38/genes.filtered.gtf,mm10/genes.filtered.gtf \
    --species hg38,mm10 \
    --threads 10
```

### Step 2: Run Analysis

**Directory-based Input (`--fastqs`)**
```bash
$dnbc4tools rna run \
    --fastqs /test/data/rna_fastqs \
    --genomeDir /database/scRNA/Mus_musculus/mm10 \
    --name test \
    --threads 30
```

Recommended directory structure:
- `/test/data/rna_fastqs/cDNA/*_R1*.fastq.gz`, `*_R2*.fastq.gz`
- `/test/data/rna_fastqs/oligo/*_R1*.fastq.gz`, `*_R2*.fastq.gz`

For directory-based `--fastqs` input, see [`--fastqs` Automatic File Naming Conventions](#file-naming-conventions) for supported patterns.

**File-specific Input (--cDNAfastq1/2 --oligofastq1/2)**
```bash
$dnbc4tools rna run \
    --cDNAfastq1 /test/data/rna_fastqs/cDNA/test_R1.fastq.gz \
    --cDNAfastq2 /test/data/rna_fastqs/cDNA/test_R2.fastq.gz \
    --oligofastq1 /test/data/rna_fastqs/oligo/test_1_1.fq.gz,/test/data/rna_fastqs/oligo/test_2_1.fq.gz \
    --oligofastq2 /test/data/rna_fastqs/oligo/test_1_2.fq.gz,/test/data/rna_fastqs/oligo/test_2_2.fq.gz \
    --genomeDir /database/scRNA/Mus_musculus/mm10 \
    --name test \
    --threads 30
```

## Single-Cell ATAC Analysis <a id="single-cell-atac-analysis"></a>

> Chromatin accessibility profiling at single-cell resolution

### Step 1: Build Reference Genome

**Human (GRCh38)**
```bash
# Download reference files
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/GRCh38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/gencode.v32.primary_assembly.annotation.gtf.gz

# Extract files
gzip -d GRCh38.primary_assembly.genome.fa.gz
gzip -d gencode.v32.primary_assembly.annotation.gtf.gz

# Build reference
$dnbc4tools tools mkgtf --ingtf gencode.v32.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools atac mkref --fasta GRCh38.primary_assembly.genome.fa --ingtf genes.filtered.gtf --species Homo_sapiens --prefix chr
```

**Mouse (GRCm38)**
```bash
# Download reference files
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/GRCm38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/gencode.vM23.primary_assembly.annotation.gtf.gz

# Extract files
gzip -d GRCm38.primary_assembly.genome.fa.gz
gzip -d gencode.vM23.primary_assembly.annotation.gtf.gz

# Build reference
$dnbc4tools tools mkgtf --ingtf gencode.vM23.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools atac mkref --fasta GRCm38.primary_assembly.genome.fa --ingtf genes.filtered.gtf --species Mus_musculus --prefix chr
```

### Step 2: Run Analysis

**Directory-based Input (`--fastqs`)**
```bash
$dnbc4tools atac run \
    --fastqs /test/data \
    --genomeDir /database/scATAC/Mus_musculus/mm10 \
    --name test \
    --threads 10
```
Recommended directory structure:
- `/test/data/*_R1*.fastq.gz`, `*_R2*.fastq.gz`

For directory-based `--fastqs` input, see [`--fastqs` Automatic File Naming Conventions](#file-naming-conventions) for supported patterns.

**File-specific Input (--fastq1/2)**
```bash
$dnbc4tools atac run \
    --fastq1 /test/data/test1_R1.fastq.gz,/test/data/test2_R1.fastq.gz \
    --fastq2 /test/data/test1_R2.fastq.gz,/test/data/test2_R2.fastq.gz \
    --genomeDir /database/scATAC/Mus_musculus/mm10 \
    --name test \
    --threads 10
```

## Single-Cell VDJ Analysis <a id="single-cell-vdj-analysis"></a>

> Immune receptor repertoire profiling (requires 5' RNA-seq data)

> **Prerequisite**: Complete 5' scRNA analysis first to establish cell-bead correspondence.

### Step 1: 5' RNA Analysis

**5' scRNA-seq Analysis**

> **Note**: For 5' scRNA-seq data, add the `--end5` parameter to specify the library chemistry.

```bash
$dnbc4tools rna run \
    --fastqs /test/rna/data \
    --genomeDir /database/scRNA/Homo_sapiens \
    --name test \
    --threads 30 \
    --end5
```

### Step 2: VDJ Analysis

**Directory-based Input (`--fastqs`)**
```bash
$dnbc4tools vdj run \
    --fastqs /test/data \
    --beadstrans /scRNA/test1/outs/singlecell.csv \
    --ref human \
    --name test_human_tcr \
    --threads 20 \
    --chain TR
```
Directory structure recommendation:
<ul>
  <li><code>/test/data/*_R1*.fastq.gz</code>, <code>*_R2*.fastq.gz</code></li>
</ul>

For directory-based `--fastqs` input, see [`--fastqs` Automatic File Naming Conventions](#file-naming-conventions) for supported patterns.

**File-specific Input (--fastq1/2)**

**TCR Analysis (Human)**
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data/test1_R1.fastq.gz,/test/data/test2_R1.fastq.gz \
    --fastq2 /test/data/test1_R2.fastq.gz,/test/data/test2_R2.fastq.gz \
    --beadstrans /scRNA/test1/outs/singlecell.csv \
    --ref human \
    --name test_human_tcr \
    --threads 20 \
    --chain TR
```

**TCR Analysis (Mouse)**
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data_tcrmouse/test3_R1.fastq.gz,/test/data_tcrmouse/test4_R1.fastq.gz \
    --fastq2 /test/data_tcrmouse/test3_R2.fastq.gz,/test/data_tcrmouse/test4_R2.fastq.gz \
    --beadstrans /scRNA/test2/outs/singlecell.csv \
    --ref mouse \
    --name test_mouse_tcr \
    --threads 20 \
    --chain TR
```

**BCR Analysis (Human)**
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data_bcrhuman/test5_R1.fastq.gz,/test/data_bcrhuman/test6_R1.fastq.gz \
    --fastq2 /test/data_bcrhuman/test5_R2.fastq.gz,/test/data_bcrhuman/test6_R2.fastq.gz \
    --beadstrans /scRNA/test1/outs/singlecell.csv \
    --ref human \
    --name test_human_bcr \
    --threads 20 \
    --chain IG
```

**BCR Analysis (Mouse)**
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data_bcrmouse/test7_R1.fastq.gz,/test/data_bcrmouse/test8_R1.fastq.gz \
    --fastq2 /test/data_bcrmouse/test7_R2.fastq.gz,/test/data_bcrmouse/test8_R2.fastq.gz \
    --beadstrans /scRNA/test2/outs/singlecell.csv \
    --ref mouse \
    --name test_mouse_bcr \
    --threads 20 \
    --chain IG
```

## Multi-omics Analysis <a id="integrated-multi-omics-analysis"></a>

> Run RNA/ATAC/VDJ pipelines in one integrated workflow and generate a unified report

### Step 1: Prepare Config File

> **Configuration note**: In `[libraries]`, `fastqs` should be the FASTQ directory path for each omics library; the pipeline will auto-detect R1/R2 files in each directory. When VDJ modules are enabled, set `end5,true` in the `[rna]` section.

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

Recommended directory structure:
- **RNA**: `/test/data/rna/cDNA/` and `/test/data/rna/oligo/`
- **ATAC**: paired FASTQ files under `/test/data/atac/`
- **VDJ-T**: paired FASTQ files under `/test/data/vdj-t/`
- **VDJ-B**: paired FASTQ files under `/test/data/vdj-b/`


### Step 2: Run Multi-omics Pipeline

```bash
$dnbc4tools multi run \
    --name test_multi \
    --csv ./multi_config.csv \
    --threads 20
```

## Command Reference <a id="command-reference"></a>

### Essential Commands Summary

| Workflow | Command | Purpose |
| :--- | :--- | :--- |
| **RNA Analysis** | `dnbc4tools rna run` | Complete RNA-seq pipeline |
| **ATAC Analysis** | `dnbc4tools atac run` | Complete ATAC-seq pipeline |
| **VDJ Analysis** | `dnbc4tools vdj run` | TCR/BCR repertoire analysis |
| **Reference Building** | `dnbc4tools rna mkref` | Build RNA reference database |
| **Reference Building** | `dnbc4tools atac mkref` | Build ATAC reference database |
| **Multi-omics** | `dnbc4tools multi run` | Integrated RNA/ATAC/VDJ analysis and unified report |
| **GTF Processing** | `dnbc4tools tools mkgtf` | Filter and process GTF files |

## Related Documentation

| Resource | Description |
| :--- | :--- |
| [Pipelines](pipeline/pipeline.md) | Analysis workflow guides |
| [Parameters](parameter/parameter.md) | Command reference and configuration options |
| [Outputs](outs/outs.md) | Understanding result files and reports |
| [GitHub Issues](https://github.com/MGI-tech-bioinformatics/DNBelab_C_Series_HT_scRNA-analysis-software/issues) | Report bugs or request features |
