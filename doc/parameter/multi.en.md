# Multi analysis parameters

`dnbc4tools multi run` executes analysis from a sectioned CSV. Ordinary multi-omics and C6 multiplexed RNA share this entry point but have different inputs and output organization.

| Task | Configuration | Output organization |
| :--- | :--- | :--- |
| Ordinary RNA / ATAC / VDJ combination | Modality sections and `[libraries]` | One directory per modality |
| C6 multiplexed RNA | Add `[samples]` to the RNA configuration | Probe-barcode assignment within a pooled library |

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
| `--threads` | No | Total CPU thread budget |

<details markdown="block" class="cli-help">
<summary>Full CLI help</summary>

```shell
$ dnbc4tools multi run --help
dnbc4tools 3.2

Process an integrated multi-omics sample.
Coordinate RNA, ATAC, and V(D)J workflows within a single run.
Generate a unified multi-omics report.

Usage: dnbc4tools multi run [OPTIONS]

options:
  --help           show this help message and exit

Basic Settings:
  --name <STR>     Unique identifier for the sample.
  --csv <FILE>     CSV file containing pipeline configuration settings. With [samples], RNA chemistry is scRNAC6.
  --outdir <DIR>   Output directory path for analysis results.
  --threads <INT>  Number of CPU threads to use.
```

</details>

`rna multi` and `atac multi` only generate per-sample scripts. `multi run` executes analysis.

## CSV configuration rules <a id="csv-config-specification"></a>

Modality sections use `key,value` rows. `[libraries]` and `[samples]` are tables with headers.

| Section | Purpose |
| :--- | :--- |
| `[rna]` | RNA reference, chemistry and cell calling |
| `[atac]` | ATAC reference, peak calling and filters |
| `[vdj-t]` / `[vdj-b]` | TCR / BCR reference and assembly |
| `[libraries]` | Required mapping of FASTQ directories to modalities |
| `[samples]` | C6 samples and probe assignments; omit for ordinary libraries |

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

## C6 multiplexed RNA configuration <a id="c6-samples"></a>

For experiments pooling biological samples in one **scRNAC6** library. Probe assignments must match the experiment; adding `[samples]` does not turn an ordinary RNA library into C6.

### Minimal configuration

```csv
[rna]
genomeDir,/database/scRNA/Human
chemistry,scRNAC6
darkreaction,auto
no_bam,true

[libraries]
fastqs,feature_types
/rawdata/c6_run,rna

[samples]
sample_id,probe_barcode_ids
S1,BC01
S2,BC02;BC03
```

Save as `c6.csv` and run:

```bash
dnbc4tools multi run --name c6_run --csv c6.csv --outdir ./results --threads 16
```

S2 uses two probes in this example. C6 chemistry is fixed to `scRNAC6`; omission or legacy `auto` normalizes to that name. `darkreaction=auto` detects dark cycles only.

### Sample table and overrides

| Column | Rule |
| :--- | :--- |
| `sample_id` | Required and unique; starts with a letter/digit and contains only letters, digits, `.`, `_`, `-`; `unassigned` and `non_multiplexed` are reserved |
| `probe_barcode_ids` | Required valid built-in BC IDs or custom DNA sequences; use `;` or `\|` for multiple probes; no duplicate assignment |
| `expectcells` / `forcecells` / `minumi` | Optional positive-integer overrides; blank inherits `[rna]`; these columns do not accept `auto` |

For sample-specific settings, extend the table:

```csv
[samples]
sample_id,probe_barcode_ids,expectcells,forcecells,minumi
S1,BC01,3000,,1000
S2,BC02;BC03,3000,,1000
```

### Experiment-wide settings

| `[rna]` option | Default behavior |
| :--- | :--- |
| `high_occupancy_filter` | `true`, applied across the experiment; `false` still runs normal calling; not a samples column |
| `sample_failure_policy` | `skip` records failures and continues; `fail` stops on sample failure |
| `darkreaction` | `auto`; manual cDNA=`R1/unset`, oligo=`R1/R2/R1R2/unset`; do not mix auto and manual values |

See [C6 outputs](../outs/multi.md#c6-outputs) for sample reports, file paths and metric denominators.

## Modality parameter mapping <a id="module-parameter-mapping"></a>

| Section | Common settings | Full reference |
| :--- | :--- | :--- |
| `[rna]` | `genomeDir`, `chemistry`, `darkreaction`, `expectcells`, `forcecells`, `minumi`, `consistent_cells`, `calling_method`, `no_introns`, `end5`, `no_bam`, `star_parameters`, `sample_read_pairs` | [RNA](scRNA.md) |
| `[atac]` | `genomeDir`, `darkreaction`, `forcecells`, `frags_cutoff`, `tss_cutoff`, `jaccard_cutoff`, `merge_cutoff`, `peak_signal`, `need_bam`, `sample_read_pairs` | [ATAC](scATAC.md) |
| `[vdj-t]` / `[vdj-b]` | `ref`, `beadstrans`, `darkreaction`, `customize`, `keep_all_cells`, `r2_only`, `enrichment_primers`, `sample_read_pairs` | [VDJ](scVDJ.md) |

Ordinary RNA requires explicit chemistry and dark cycles together. C6 has fixed chemistry and can detect dark cycles independently. Repeat `customize` as required for libraries; keep one definition for other scalar options.

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

Automatic mode reduces concurrency; if one worker still exceeds the estimate, it uses one worker with a warning. If memory detection is unavailable, it uses CPU/file-descriptor scheduling. These options have no effect with `no_bam=true`. See [Multi outputs](../outs/multi.md#c6-outputs) for delivery paths and metrics.

</details>

## Related documentation

[Workflow](../pipeline/multi.md) · [Outputs and reports](../outs/multi.md) · [Upgrade Guide](../migration.md) · [Running & Troubleshooting](../troubleshooting.md)
