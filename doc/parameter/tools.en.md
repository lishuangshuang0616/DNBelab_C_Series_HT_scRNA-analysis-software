# Tools Parameters

DNBelab C Series HT Auxiliary Tools Parameter Reference

The public subcommand of `dnbc4tools tools` is `mkgtf`. The following `bam2fastq`, `chromsplit`, and `fqsubC4` are standalone auxiliary tools located in the software `misc` directory, not subcommands of `dnbc4tools tools`.

## GTF Processing (mkgtf) <a id="gtf-文件操作-mkgtf"></a>

> **Core Function**
>
> GTF annotation processing tool supporting gene type statistics, rule-based filtering, format validation, and automated repair for single-cell transcriptomic reference pipelines.

### Usage <a id="usage-mkgtf"></a>

```bash
dnbc4tools tools mkgtf --ingtf genes.gtf --output genes.filtered.gtf
```

### Full Command-Line Help

```shell
$ dnbc4tools tools mkgtf --help
dnbc4tools 3.2

Filter and process GTF annotation files.

Usage: dnbc4tools tools mkgtf [OPTIONS]

options:
  --help           show this help message and exit

Basic Settings:
  --action <STR>   Operation type: 'mkgtf' (filter by gene types), 'stats' (count statistics), 'check' (validate
                   format) [default: mkgtf] (e.g., `stats`).
  --ingtf <FILE>   Path to input GTF annotation file (required) (e.g., `genes.gtf`).
  --output <FILE>  Path to output file (required unless --action stats). If omitted for "stats", statistics are
                   printed to stdout.

Analysis Settings:
  --include <STR>  Comma-separated list of gene types to include. Supports wildcards (e.g., 'IG_*' will match
                   'IG_V_gene', 'IG_C_gene'). [default: protein_coding,lncRNA,lincRNA,antisense,IG_*,TR_*].
  --type <STR>     Attribute name for gene type classification (e.g., gene_biotype, gene_type).
  --feature <STR>  Feature type to process from GTF. Use 'transcript' if no 'gene' entries exist [default: gene].

Usage Examples:
  Statistics:   dnbc4tools tools mkgtf --action stats --ingtf genes.gtf
  Filtering:    dnbc4tools tools mkgtf --ingtf genes.gtf --output filtered.gtf --include 'protein_coding,lncRNA'
  Validation:   dnbc4tools tools mkgtf --action check --ingtf genes.gtf --output corrected.gtf
```

### Parameter Reference Tables

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--ingtf` | File path | **Required** | Path to the input standard GTF annotation file (GFF/GFF3 not supported) |
| `--output` | File path | Conditional | Path to output file (required for `mkgtf` and `check`; prints to stdout for `stats`) |
| `--action` | Choice | `mkgtf` | Operation mode: `mkgtf` (filter by type), `stats` (count distribution), `check` (validate & fix) |
| `--include` | String | Default set | Comma-separated gene biotypes to retain (supports wildcards `*`, e.g., `IG_*`) |
| `--type` | String | `auto` | Attribute key in GTF defining gene type classification (e.g., `gene_biotype`, `gene_type`) |
| `--feature` | String | `gene` | Target feature level in GTF (usually `gene`; fallback to `transcript` if absent) |

---

### Operating Modes Deep Dive

#### 1. Filtering Mode (`--action mkgtf`)

Extracts trusted biotypes from full annotations containing pseudogenes or non-coding fragments, reducing non-unique mapping:

```bash
dnbc4tools tools mkgtf \
  --action mkgtf \
  --ingtf Homo_sapiens.GRCh38.108.gtf \
  --output Homo_sapiens.filtered.gtf \
  --include "protein_coding,lncRNA,IG_*,TR_*"
```

- **Wildcard Matching**: Pattern `IG_*` matches `IG_V_gene`, `IG_C_gene`, `IG_J_gene`, etc.
- **Default Inclusion Set**: `protein_coding,lncRNA,lincRNA,antisense,IG_*,TR_*`.

#### 2. Summary Mode (`--action stats`)

Tallies gene counts across all biotypes to evaluate source annotation structure and determine correct attribute tags:

```bash
dnbc4tools tools mkgtf --action stats --ingtf genes.gtf
```

#### 3. Validation & Repair Mode (`--action check`)

Validates GTF integrity and automatically reconstructs missing parent features (e.g., inferring missing `gene` rows from existing `transcript` entries):

```bash
dnbc4tools tools mkgtf --action check --ingtf raw_genes.gtf --output corrected.gtf
```

---

## BAM to FASTQ (bam2fastq) <a id="bam-转-fastq-bam2fastq"></a>

> **Conversion Utility (Located in Software `misc` Directory)**
>
> Converts C4 cDNA and C4/C6 oligo BAM files back into FASTQ format. Features coordinate/name-sorted input handling, automatic single/paired-end detection, C4 vs. C6 double-UMI layout recognition, multi-threaded parallel compression, and genomic locus extraction.

### Usage <a id="usage-bam2fastq"></a>

```shell
$ bam2fastq --help
A BAM to FASTQ converter for C4 cDNA and C4/C6 oligo data (DNBelab C4 / DNBC4tools)

Usage: bam2fastq [OPTIONS] <BAM> <OUTPUT>

Arguments:
  <BAM>     Path to the input BAM file
  <OUTPUT>  Output directory for FASTQ files

Options:
  -t, --threads <THREADS>            Number of CPU threads for parallel processing [default: auto, all available cores]
  -r, --locus <REGION>               Process a zero-based, half-open region, e.g. chr1:1000-2000
  -n, --reads-per-fastq <READS>      Maximum reads per output FASTQ file
      --max-memory <MEMORY>          Working-memory target in MiB; defaults to half available system memory
      --no-compress                  Disable gzip compression (outputs .fastq instead of .fastq.gz)
      --library-type <TYPE>          Detect from BAM metadata/tags; override with cDNA or oligo [default: auto]
      --oligo-layout <LAYOUT>        Detect oligo layout; override with c4 or c6 [default: auto]
      --relaxed                      Skip unmatched/duplicate mate records with summary counts [default: true]
      --auto-detect                  Detect cDNA paired-end status from sampled flags [default: true]
      --bx-list <FILE>               Filter cDNA by a barcode list; requires BX-sorted BAM and .bam.bxi index
      --traceback                    Show detailed error context and traceback [default: false]
  -h, --help                         Print help
  -V, --version                      Print version
```

### Parameter Reference Tables

| Argument / Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `<BAM>` | File path | **Required (Positional)** | Path to input BAM (coordinate-sorted or name-sorted cDNA BAM, or `c4_oligo` BAM) |
| `<OUTPUT>` | Directory path | **Required (Positional)** | Directory where output FASTQ files will be written |
| `-t, --threads` | Integer / `auto` | `auto` | Number of CPU threads for parallel processing (default: all available cores) |
| `-r, --locus` | String | None | Process a zero-based, half-open region, e.g. `chr1:1000-2000` (requires `.bai` index) |
| `-n, --reads-per-fastq` | Integer | None (single file) | Maximum reads per output FASTQ chunk file; splits output when exceeded |
| `--max-memory` | Integer (MiB) | Auto | Working-memory target in MiB (defaults to half available system memory; not an RSS ceiling) |
| `--no-compress` | Flag | Disabled | Disable gzip compression (outputs `.fastq` directly for fastest writing speed) |
| `--library-type` | Choice | `auto` | Detect from BAM metadata/tags; override with `cDNA` or `oligo` |
| `--oligo-layout` | Choice | `auto` | Detect oligo layout; override with `c4` or `c6` |
| `--relaxed` | Boolean | `true` | Skip unmatched/duplicate mate records with summary counts; `false` requires complete pairs |
| `--auto-detect` | Boolean | `true` | Detect cDNA paired-end status from sampled flags; `false` selects single-ended conversion |
| `--bx-list` | File path | None | Filter cDNA by a barcode list (requires BX-sorted BAM and `.bam.bxi` index) |
| `--traceback` | Flag | Disabled | Show detailed error context and traceback |

### Practical Examples

```shell
# Basic conversion (auto-detects paired-end/single-end and library type, uses all available cores)
bam2fastq sample.bam ./output/

# Custom thread budget
bam2fastq -t 20 sample.bam ./output/

# Extract specific genomic region (requires .bai index)
bam2fastq -t 8 -r chr1:1000000-2000000 sample.bam ./output_chr1/

# Disable compression for fastest write speed
bam2fastq -t 8 --no-compress sample.bam ./output/

# Chunk output into 50M reads per file
bam2fastq -t 20 -n 50000000 sample.bam ./output/

# Convert Oligo BAM (auto-detects C4 single-UMI vs C6 double-UMI layout)
bam2fastq -t 20 oligo.records.bam ./output_oligo/
```

---

## Chromosome Splitting (chromsplit) <a id="染色体分割-chromsplit"></a>

> **Core Function**
>
> Splits large scaffold/chromosome sequences at N-stretches or intergenic regions based on optional GTF annotations to prevent fragment length from exceeding tool limits (e.g., $2^{29}-1$ bp).

### Usage

```shell
$ chromsplit --help
Split large genome sequences into smaller fragments at N-stretches or intergenic regions

Usage: chromsplit [OPTIONS] --fasta <FA> --prefix <PREFIX>

Options:
  --fasta <FA>               Input genome sequence file in FASTA format
  --gtf <GTF>                Optional GTF/GFF annotation file for the genome
  --prefix <PREFIX>          Prefix for output files (.fa and .cutsite.tsv will be appended)
  --min_length <MIN_LENGTH>  Minimum length of output scaffold fragments [default: 300000000]
  --max_length <MAX_LENGTH>  Maximum length of output scaffold fragments [default: 500000000]
  --cut_site <CUT_SITE>      Optional cut site file containing predefined split positions
  --help                     Print help
  --version                  Print version
```

### Parameter Reference Tables

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--fasta` | File path | **Required** | Input genome FASTA sequence file |
| `--prefix` | String | **Required** | Prefix for output files (generates `<prefix>.fa` and `<prefix>.cutsite.tsv`) |
| `--gtf` | File path | None | Optional GTF annotation to guide splitting across intergenic intervals |
| `--min_length` | Integer (bp) | `300000000` | Minimum fragment length in base pairs |
| `--max_length` | Integer (bp) | `500000000` | Maximum fragment length in base pairs |
| `--cut_site` | File path | None | File containing custom pre-defined coordinate break points |

### Practical Examples

```shell
# Split genome using GTF to protect gene structure
chromsplit --fasta large_genome.fasta --gtf genes.gtf --prefix genome_split

# Custom fragment bounds (200Mb to 400Mb)
chromsplit --fasta large_genome.fasta --prefix custom_split --min_length 200000000 --max_length 400000000
```

---

## FASTQ Substring Slicing (fqsubC4) <a id="fastq-切割-fqsubc4"></a>

> **Core Function**
>
> High-performance FASTQ substring slicer. Extracts exact 1-based base coordinate intervals to unify barcode architectures across historical sequencing batches.

### Usage

```shell
$ fqsubC4 --help
Extracts regions from FASTQ sequences

Usage: fqsubC4 [OPTIONS] --input <FILE> --output <FILE> --regions <REGIONS>

Options:
  --input <FILE>       Path to input FASTQ file (supports both uncompressed and gzipped formats)
  --output <FILE>      Path to output FASTQ file (automatically compressed if ending in .gz)
  --regions <REGIONS>  Comma-separated regions in format start:end (e.g., 7:16,23:32,38:47)
  --threads <THREADS>  Number of threads to use for parallel processing [default: 8]
  --help               Print help
  --version            Print version
```

### Parameter Reference Tables

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--input` | File path | **Required** | Input FASTQ file (supports `.fq`, `.fastq`, `.fq.gz`, `.fastq.gz`) |
| `--output` | File path | **Required** | Output FASTQ path (automatically compressed if ending in `.gz`) |
| `--regions` | String | **Required** | Comma-separated 1-based intervals in `start:end` format |
| `--threads` | Integer | `8` | Number of CPU threads for parallel I/O and processing |

### Practical Examples

```shell
# Extract two barcode intervals from Read 1 and output compressed FASTQ
fqsubC4 \
  --input sample_raw_R1.fq.gz \
  --output extracted_R1.fq.gz \
  --regions "7:16,23:32" \
  --threads 8
```
