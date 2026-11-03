# Multi-Omics Analysis Parameters

`dnbc4tools multi run` executes unified multi-omics analysis (RNA, ATAC, and V(D)J) from a sectioned CSV configuration file.

> **Note**
> For high-throughput single-cell RNA analysis based on Sample Barcode multiplexing, please refer to the dedicated [C6 Parameters Guide](c6.md).

## Run command <a id="integrated-workflow-run"></a>

```bash
dnbc4tools multi run \
  --name demo \
  --csv config.csv \
  --outdir ./results \
  --threads 16
```

| Option | Required | Meaning |
| :--- | :--- | :--- |
| `--name` | Yes | Run name; results are written to `<outdir>/<name>/` |
| `--csv` | Yes | Sectioned CSV configuration |
| `--outdir` | No | Analysis root, default current directory |
| `--threads` | No | Number of CPU threads to use [default: all available cores] |

### Complete CLI Help

```shell
$ dnbc4tools multi run --help
dnbc4tools 3.2

Process an integrated multi-omics sample.
Coordinate RNA, ATAC, and V(D)J workflows within a single run.
Support C6 probe-barcoded RNA sample demultiplexing via [samples].
Generate a unified multi-omics report.

Usage: dnbc4tools multi run [OPTIONS]

options:
  --help           show this help message and exit

Basic Settings:
  --name <STR>     Unique identifier for the sample.
  --csv <FILE>     CSV file containing pipeline configuration settings. Add [samples] for C6 RNA sample
                   demultiplexing; RNA chemistry is fixed to scRNAC6 in this mode.
  --outdir <DIR>   Output directory path for analysis results.
  --threads <INT>  Number of CPU threads to use [default: all available cores].
```

`rna multi` and `atac multi` only generate per-sample scripts. `multi run` executes analysis.

## CSV configuration rules <a id="csv-config-specification"></a>

Modality sections use `key,value` rows. `[libraries]` is a table with headers.

| Section | Purpose |
| :--- | :--- |
| `[rna]` | RNA reference, chemistry and cell calling |
| `[atac]` | ATAC reference, peak calling and filters |
| `[vdj-t]` / `[vdj-b]` | TCR / BCR reference and assembly |
| `[libraries]` | Required mapping of FASTQ directories to modalities |

Use `true/false` for booleans. Quote comma-containing values, for example `darkreaction,"R1,R1R2"`. Global `[rna] expectcells` and `[atac] jaccard_cutoff` accept `auto`. Absolute input paths are recommended.

RNA input roots contain `cDNA/` and `oligo/`; ATAC and VDJ directories contain their paired FASTQs directly. See [FASTQ naming rules](../quickstart.md#file-naming-conventions).

## Ordinary multi-omics configuration <a id="configuration-examples"></a>

This minimal 5′ RNA + TCR configuration can be saved as `config.csv` and run with the command above.

```csv
[rna]
genomeDir,/database/scRNA/Human
end5,true
no_bam,true

[vdj-t]
ref,human

[libraries]
fastqs,feature_types
/rawdata/rna,rna
/rawdata/tcr,vdj-t
```

For BCR, replace `[vdj-t]` / `vdj-t` with `[vdj-b]` / `vdj-b`. Add an `[atac]` section and library row for ATAC. Remove the VDJ section and input row for RNA alone.

VDJ uses RNA cell information by default; set `beadstrans` for another cell table. Ordinary RNA + VDJ requires `end5,true`.

<a id="c6-samples"></a>

> **Note: C6 Multiplexed Configuration**
>
> The configuration rules and `[samples]` syntax for C6 multiplexed RNA experiments have been moved to their own dedicated chapter. Please refer to [C6 Parameters](c6.md).

## Modality parameter mapping <a id="module-parameter-mapping"></a>

| Section | Common settings | Full reference |
| :--- | :--- | :--- |
| `[rna]` | `genomeDir`, `chemistry`, `darkreaction`, `expectcells`, `forcecells`, `minumi`, `consistent_cells`, `calling_method`, `no_introns`, `end5`, `no_bam`, `star_parameters`, `sample_read_pairs` | [RNA](scRNA.md) |
| `[atac]` | `genomeDir`, `darkreaction`, `forcecells`, `frags_cutoff`, `tss_cutoff`, `jaccard_cutoff`, `merge_cutoff`, `peak_signal`, `need_bam`, `sample_read_pairs` | [ATAC](scATAC.md) |
| `[vdj-t]` / `[vdj-b]` | `ref`, `beadstrans`, `darkreaction`, `customize`, `keep_all_cells`, `r2_only`, `enrichment_primers`, `sample_read_pairs` | [VDJ](scVDJ.md) |

Ordinary RNA requires explicit chemistry and dark cycles together. Repeat `customize` as required for libraries; keep one definition for other scalar options.

### BAM resources <a id="bam-resources"></a>

Routine runs use automatic scheduling and need only a total CPU budget. Expand these overrides only when needed.

<details markdown="block">
<summary>BAM resource overrides</summary>

Routine runs need only a total thread budget. BAM concurrency is planned from CPU, file descriptors and estimated available memory. Optional `[rna]` overrides:

| Parameter | Meaning |
| :--- | :--- |
| `bam_workers` | Positive maximum number of concurrent chunk workers |
| `bam_compression_threads` | Compression threads per chunk; jointly constrained by total CPU budget |
| `bam_queue_depth` | Per-sample writer queue; defaults to twice the effective compression thread count |
| `bam_max_memory_gb` | Estimated memory budget in GiB; not an RSS cap |
| `bam_compression_level` | 0–9; omission retains the HTSlib default |
| `bam_limit_memory` | Default `false`; `true` fails if even one worker cannot fit the estimate |

Automatic mode reduces concurrency; if one worker still exceeds the estimate, it runs one worker with a warning. If memory detection is unavailable, it uses CPU/file-descriptor scheduling. These options have no effect with `no_bam=true`.

</details>

