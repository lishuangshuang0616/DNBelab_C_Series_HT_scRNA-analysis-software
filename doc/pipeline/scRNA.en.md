# DNBelab C Series HT scRNA Analysis Pipeline

Single-Cell RNA Sequencing Data Analysis Guide

## Overview <a id="overview"></a>

This document provides a complete guide on how to use dnbc4tools for single-cell RNA sequencing data analysis.

**Workflow**: Raw Data → Quality Control → Alignment → Cell Identification → Expression Matrix → Analysis Report

![scRNA Analysis Pipeline Overview](../images/scRNA_pipeline.png)

> **Usage Note**: `$dnbc4tools` represents the executable path and must be replaced with the actual installation path. The backslash `\` is used to split a command across multiple lines for readability.

## File Preparation <a id="file-preparation"></a>

Two types of FASTQ files are required for the analysis:

<table>
  <thead>
    <tr>
      <th>File Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>cDNA Library</b></td>
      <td>Sequencing data containing Cell Barcodes, UMIs, and transcriptome information.</td>
    </tr>
    <tr>
      <td><b>Oligo Library</b></td>
      <td>Contains Cell Barcode information for both large and small beads, and UMI information for small beads.</td>
    </tr>
  </tbody>
</table>

> **Note**: Ensure that the FASTQ files are of good quality and record their paths for subsequent analysis.

## Reference Data <a id="reference-data"></a>

### Reference Database Input Files

<table>
  <thead>
    <tr>
      <th>File Type</th>
      <th>Format</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Genome File</b></td>
      <td>FASTA</td>
      <td>Contains the complete genome sequence of a species (usually the primary assembly), including chromosomes, mitochondria, and other genetic information. This file is fundamental for genome alignment and analysis.</td>
    </tr>
    <tr>
      <td><b>Annotation File</b></td>
      <td>GTF</td>
      <td>Provides detailed information on genes, transcripts, exons, and other functional regions in the genome. This file specifies the location, type, and attributes of genes.</td>
    </tr>
  </tbody>
</table>

> **Recommended Data Source**: It is recommended to use files from the [Ensembl database](https://www.ensembl.org/index.html). Ensembl's GTF files contain optional tags that facilitate filtering with `dnbc4tools tools mkgtf`.

**GTF File Requirements:**

- Must contain annotations of type <code>gene</code> or <code>transcript</code> as well as <code>exon</code>.
- Attributes must include <code>gene_id</code> or <code>gene_name</code> and <code>transcript_id</code> or <code>transcript_name</code>.
- The GFF file format is not supported.
- The genome file and annotation file must be from corresponding versions.

### GTF File Preprocessing (Optional) <a id="gtf-file-processing-optional"></a>

GTF files downloaded from sites like ENSEMBL and UCSC often contain many types of genes. Selecting specific gene types relevant to your research can reduce overlapping gene annotations and improve the uniqueness of alignments, as reads mapping non-uniquely to multiple genes are filtered out.

We provide three functions for GTF file processing:

<table>
  <thead>
    <tr>
      <th>Function</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Gene Type Statistics</b></td>
      <td>Count the number of various gene types in a GTF file.</td>
    </tr>
    <tr>
      <td><b>Correct GTF File</b></td>
      <td>Fill in missing information to ensure the GTF file meets analysis requirements.</td>
    </tr>
    <tr>
      <td><b>Filter Gene Types</b></td>
      <td>Filter specific gene types based on research needs.</td>
    </tr>
  </tbody>
</table>

#### Gene Type Statistics

```shell
# Count gene type quantities
$dnbc4tools tools mkgtf \
  --action stats \
  --ingtf genes.gtf \
  --output gtfstat.txt \
  --type gene_biotype
```

 <strong>Note</strong>: You need to check the tags in the GTF file to determine the <code>type</code>.

  <img src="https://s2.loli.net/2024/10/09/afGqtQocTE9h3uR.png" alt="GTF File Type Example" width="800">

Example Output:

```shell
$cat gtf_type.txt
Type    Count
protein_coding  20006
lncRNA  17755
processed_pseudogene    10159
unprocessed_pseudogene  2605
misc_RNA        2221
snRNA   1910
miRNA   1879
TEC     1056
transcribed_unprocessed_pseudogene      950
snoRNA  943
transcribed_processed_pseudogene        503
rRNA_pseudogene 497
IG_V_pseudogene 187
transcribed_unitary_pseudogene  146
IG_V_gene       145
......
```

#### Correct GTF File

If a GTF file has incomplete content, the main analysis pipeline may fail due to incomplete annotations. This function can automatically fill in missing information in gene and transcript entries to ensure the pipeline runs smoothly.

```shell
# Correct GTF file
$dnbc4tools tools mkgtf \
  --action check \
  --ingtf genes.gtf \
  --output corrected.gtf
```

The software cross-references `gene_id` with `gene_name` and `transcript_id` with `transcript_name` to fill in missing details and flags locations where multiple gene information might exist.

#### Filter Gene Types

```shell
# Filter gene types
$dnbc4tools tools mkgtf \
  --ingtf genes.gtf \
  --output genes.filter.gtf \
  --type gene_biotype
```

Default included gene types:
```
protein_coding
lncRNA/lincRNA
antisense
IG_V_gene
IG_LV_gene
IG_D_gene
IG_J_gene
IG_C_gene
IG_V_pseudogene
IG_J_pseudogene
IG_C_pseudogene
TR_V_gene
TR_D_gene
TR_J_gene
TR_C_gene
```

You can also use the `include` parameter to customize the gene types to be retained:

```shell
# Custom gene type filtering
$dnbc4tools tools mkgtf \
  --ingtf genes.gtf \
  --output genes.filter.gtf \
  --type gene_biotype \
  --include protein_coding,lncRNA,lincRNA,\
        antisense,IG_V_gene,IG_LV_gene,IG_J_gene,\
        IG_C_gene,IG_V_pseudogene,IG_J_pseudogene,\
        IG_C_pseudogene,TR_V_gene,TR_D_gene,TR_J_gene,TR_C_gene
```

### Reference Database Construction

Before running the `dnbc4tools rna run` analysis, a reference database must be built. This step uses the annotation file (GTF) and reference genome (FASTA) to create an index for aligning and annotating the sequencing reads.

**Command:**

```shell
# Build reference database
$dnbc4tools rna mkref \
  --fasta genome.fa \
  --ingtf genes.gtf \
  --species Homo_sapiens \
  --threads 10
```

**Output Directory:**

Upon successful execution, a reference database directory will be created at the specified location with the following structure:

```
/opt/database/Homo_sapiens
├── fasta
│   ├── genome.fa
│   └── genome.fa.fai
├── genes
│   └── genes.gtf
├── ref.json
└── star
    ├── chrLength.txt
    ├── chrNameLength.txt
    ├── chrName.txt
    ├── chrStart.txt
    ├── exonGeTrInfo.tab
    ├── exonInfo.tab
    ├── geneInfo.tab
    ├── Genome
    ├── genomeParameters.txt
    ├── mtgene.list
    ├── SA
    ├── SAindex
    ├── sjdbInfo.txt
    ├── sjdbList.fromGTF.out.tab
    ├── sjdbList.out.tab
    └── transcriptInfo.tab
```

**ref.json Example:**

The `ref.json` file records the main information of the database.

```json
{
    "chrmt": "chrM",
    "genome": "/opt/database/Homo_sapiens/fasta/genome.fa",
    "genomeDir": "/opt/database/Homo_sapiens/star",
    "gtf": "/opt/database/Homo_sapiens/genes/genes.gtf",
    "input_fasta_files": [
        "genome.fa"
    ],
    "input_gtf_files": [
        "genes.filter.gtf"
    ],
    "mtgenes": "/opt/database/Homo_sapiens/star/mtgene.list",
    "species": "Homo_sapiens",
    "version": "3.2"
}
```

 <code>Note</code>: Building the reference database can be time-consuming, depending on the genome size and computational resources. The main analysis pipeline is compatible with older database versions.

**Runtime Log Example:**

The following information will be printed during runtime:

```shell
2025-11-12 15:56:12 Creating new reference folder at /opt/database/Homo_sapiens
...done

 2025-11-12 15:56:12 Writing genome FASTA file into reference folder...
...done

 2025-11-12 15:56:14 Indexing genome FASTA file...
...done

 2025-11-12 15:56:15 Writing genes GTF file into reference folder...
...done

 2025-11-12 15:57:11 Generating STAR genome index...
...done

 2025-11-12 15:59:29 Writing Reference JSON file into reference folder...
...done
Analysis Complete
```

## Main Pipeline <a id="main-pipeline"></a>

The main pipeline can be used in two ways:

- **Single-sample analysis**: Run `dnbc4tools rna run` directly for a complete analysis of one sample.
- **Multi-sample batch processing**: Use `dnbc4tools rna multi` to generate one run script per sample, which is useful for preparing batch jobs.

### Single-Sample Analysis

The main RNA analysis pipeline processes cDNA and Oligo library data from a single sample. Key steps include:
1.  **Data Processing**: Performs quality control, alignment, and functional region annotation.
2.  **Cell Identification**: Merges beads to identify valid cells.
3.  **Matrix Generation**: Creates raw and filtered gene expression matrices.
4.  **Advanced Analysis**: Filters cells, performs dimensionality reduction, clustering, and annotation on the filtered matrix.
5.  **Report Generation**: Outputs an HTML report and other result files.

Two input methods are supported:

**Method 1: Directory (Recommended)**

```shell
$dnbc4tools rna run \
  --name sample \
  --fastqs /data \
  --genomeDir /opt/database/Homo_sapiens \
  --threads 30
```

Directory structure example:
```
/data/
├── cDNA/
│   ├── sample_cDNA_R1.fastq.gz
│   └── sample_cDNA_R2.fastq.gz
└── oligo/
    ├── sample_oligo_1_R1.fastq.gz
    ├── sample_oligo_1_R2.fastq.gz
    ├── sample_oligo_2_R1.fastq.gz
    └── sample_oligo_2_R2.fastq.gz
```

Directory requirements:

- The `--fastqs` directory must contain both `cDNA/` and `oligo/` subdirectories.
- Each subdirectory should contain the R1/R2 FASTQ pairs for the corresponding library.
- Automatic detection relies on R1/R2 markers in file names. The recommended naming patterns are `_R1`/`_R2` or `_R1_`/`_R2_`.
- Do not mix data from different samples or different libraries in the same input directory.

**Method 2: Individual Parameters**

```shell
$dnbc4tools rna run \
  --name sample \
  --cDNAfastq1 /data/cDNA/sample_cDNA_R1.fastq.gz \
  --cDNAfastq2 /data/cDNA/sample_cDNA_R2.fastq.gz \
  --oligofastq1 /data/oligo/sample_oligo_1_R1.fastq.gz,/data/oligo/sample_oligo_2_R1.fastq.gz \
  --oligofastq2 /data/oligo/sample_oligo_1_R2.fastq.gz,/data/oligo/sample_oligo_2_R2.fastq.gz \
  --genomeDir /opt/database/Homo_sapiens \
  --threads 30
```

After auto-detecting the reagent version and dark reaction, the software begins the analysis. Here is an example:

```shell
──────────────────────────── Parsed FASTQ Inputs — 2025-11-12 15:00:24 ─────────────────────────────
┌─────────────┬────────────────────────────────────────────────────────────────────────────────────┐
│ Type        │ Path                                                                               │
├─────────────┼────────────────────────────────────────────────────────────────────────────────────┤
│ cDNA Read 1 │ /data/cDNA/sample_cDNA_R1.fastq.gz                                                 │
│ cDNA Read 2 │ /data/cDNA/sample_cDNA_R2.fastq.gz                                                 │
│ oligo Read 1 │ /data/oligo/sample_oligo_1_R1.fastq.gz,/data/oligo/sample_oligo_2_R1.fastq.gz      │
│ oligo Read 2 │ /data/oligo/sample_oligo_1_R2.fastq.gz,/data/oligo/sample_oligo_2_R2.fastq.gz      │
└─────────────┴────────────────────────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────

──────────────────────────── Chemistry Detection — 2025-11-12 15:00:31 ─────────────────────────────
┌───────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Type                                          │ Result                                           │
├───────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ oligo Read 1                                   │ darkreaction                                     │
│ oligo Read 2                                   │ darkreaction                                     │
└───────────────────────────────────────────────┴──────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────

──────────────────────────── Chemistry Detection — 2025-11-12 15:00:31 ─────────────────────────────
┌─────────────────────────────────────────────┬────────────────────────────────────────────────────┐
│ Type                                        │ Result                                             │
├─────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│ cDNA Read 1                                  │ darkreaction                                       │
└─────────────────────────────────────────────┴────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────

 2025-11-12 15:00:31 Starting oligo library filtering...
...done

 2025-11-12 15:05:53 Starting cDNA library filtering...
...done

 2025-11-12 15:07:49 Performing read alignment and UMI counting...
...done

 2025-11-12 15:15:25 Calculating bead similarity and merging beads within droplets...
...done

 2025-11-12 15:15:41 Generating raw gene expression matrix...
...done

 2025-11-12 15:17:24 Generating cell-filtered gene expression matrix...
...done

 2025-11-12 15:17:43 Calculating sequencing saturation metrics...
...done

 2025-11-12 15:18:08 Generating position-sorted BAM file...
...done

 2025-11-12 15:24:46 Performing dimensionality reduction and clustering analysis...
...done

 2025-11-12 15:27:21 Generating analysis report and summary statistics...
...done

 2025-11-12 15:27:40 Analysis Finished. Elapsed Time: 0:27:16
```

When the message `Analysis Finished` appears, the analysis is successfully completed.

### Multi-Sample Batch Processing (Optional)

To simplify the analysis of multiple samples, you can use a configuration file to generate a shell script for each sample.

```shell
$dnbc4tools rna multi \
  --list sample.tsv \
  --genomeDir /opt/database/Homo_sapiens \
  --threads 30
```

The `sample.tsv` file is tab-separated (`\t`) and contains three columns:

<table>
  <thead>
    <tr>
      <th>Column</th>
      <th>Content</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Sample Name</td>
    </tr>
    <tr>
      <td>2</td>
      <td>cDNA Library Sequencing Data</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Oligo Library Sequencing Data</td>
    </tr>
  </tbody>
</table>

 <code>Note</code>: Multiple FASTQ files should be separated by commas, and R1/R2 files by semicolons.

```tsv
sample1	/data/cDNA1_R1.fq.gz;/data/cDNA1_R2.fq.gz	/data/oligo1_R1.fq.gz,/data/oligo4_R1.fq.gz;/data/oligo1_R2.fq.gz,/data/oligo4_R2.fq.gz
sample2	/data/cDNA2_R1.fq.gz;/data/cDNA2_R2.fq.gz	/data/oligo2_R1.fq.gz;/data/oligo2_R2.fq.gz
sample3	/data/cDNA3_R1.fq.gz;/data/cDNA3_R2.fq.gz	/data/oligo3_R1.fq.gz;/data/oligo3_R2.fq.gz
```

After execution, a shell script will be generated for each sample:

```shell
sample1.sh
sample2.sh
sample3.sh
```

Example content of `sample1.sh`:

```shell
$cat sample1.sh
/opt/software/dnbc4tools3.2/dnbc4tools rna run --name sample1 --cDNAfastq1 /data/cDNA1_R1.fq.gz --cDNAfastq2 /data/cDNA1_R2.fq.gz --oligofastq1 /data/oligo1_R1.fq.gz,/data/oligo4_R1.fq.gz --oligofastq2 /data/oligo1_R2.fq.gz,/data/oligo4_R2.fq.gz --genomeDir /database/scRNA/Mus_musculus/mm10 --threads 30
```

You can then execute these scripts to run the main analysis.

## Results Interpretation <a id="results-interpretation"></a>

Upon completion, `outs` (outputs) and `logs` directories will be generated. The `outs` directory is structured as follows:

```
.
├── analysis/
│   ├── cluster.csv
│   ├── marker.csv
│   └── QC_Cluster.h5ad
├── anno_decon_sorted.bam
├── anno_decon_sorted.bam.bai
├── filtered_feature_bc_matrix.h5ad
├── filtered_feature_bc_matrix/
│   ├── barcodes.tsv.gz
│   ├── features.tsv.gz
│   └── matrix.mtx.gz
├── metrics_summary.xls
├── raw_feature_bc_matrix/
│   ├── barcodes.tsv.gz
│   ├── features.tsv.gz
│   └── matrix.mtx.gz
├── *_scRNA_report.html
└── singlecell.csv
```

## Related Documentation

| Resource | Description |
| :--- | :--- |
| [Output File Usage](../io.en.md) | Understanding output file structure and formats |
| [Analysis Parameters](../parameter/scRNA.en.md) | Complete parameter reference and descriptions |
| [Output Descriptions](../outs/scRNA.en.md) | Detailed interpretation of analysis results |

## Frequently Asked Questions

This section will be expanded as common usage questions are collected. For the current version, use the run log, parameter reference, and output file documentation as the primary troubleshooting references.
