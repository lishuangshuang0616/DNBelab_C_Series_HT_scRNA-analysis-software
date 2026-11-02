# Upgrading from 3.1 to 3.2

This manual describes the 3.2 source as of October 23, 2026. The formal package, download URL and checksums await release confirmation. The header menu opens the complete archived 3.1 manual; 3.2 is the default.

## Main changes

| Area | Behavior in 3.2 | Migration action |
| :--- | :--- | :--- |
| Multiplexed RNA | `[samples]` in `multi run` enables C6 probe-barcode assignment | Use `scRNAC6`; assign each probe to only one sample |
| RNA matrices | `raw_feature_bc_matrix`, `filtered_feature_bc_matrix`, plus H5 | Update scripts using `raw_matrix`, `filter_matrix` or `filter_feature.h5ad` |
| C6 summary | `outs/rna/singlecell.csv.gz` retains all six columns, background and zero-UMI rows | Enable gzip reading; ordinary RNA/ATAC still use CSV by default |
| C6 analysis | Independent analysis and reporting per sample | Global H5AD contains sparse counts without joint PCA, UMAP or clustering |
| C6 reports | Root Multi report and individual RNA reports | Use `per_sample_outs/<sample>/<sample>_scRNA_report.html` |
| ATAC defaults | `ordmag` calling, `frags_cutoff=0`, cutsite peak signal and matrix counting | Matrix values can change; calling and FRIP still use fragment counts |
| ATAC matrices | `raw_peak_bc_matrix`, `filtered_peak_bc_matrix`, plus H5 | Update former `raw_peak_matrix` and `filter_peak_matrix` paths |
| Batch scripts | `rna multi` / `atac multi` only generate scripts in the working directory | Run `.sh` files after successful generation; `--outdir` sets analysis output; existing scripts are not overwritten |
| Diagnostics | Preflight, run state, stage logs and structured errors | Start with the sample's `logs/`; see [Running & Troubleshooting](troubleshooting.md) |

## C6 inputs and outputs

See [Multi parameters](parameter/multi.md#c6-samples), [Multi workflow](pipeline/multi.md#c6-workflow) and [Multi outputs](outs/multi.md#c6-outputs). Adding `[samples]` does not convert an ordinary RNA library into a C6 library.

Positive-UMI C6 rows are ordered by descending UMI; zero-UMI rows follow in original group order. Join by cell/barcode identifiers. Use `is_cell_barcode` to distinguish called cells from background. Readers and constraint inputs accept complete legacy CSV and new `.csv.gz` files.

`high_occupancy_filter` is an experiment-wide `[rna]` setting, enabled by default. It must not appear as a `[samples]` column. Unassigned BAM is named `unassigned_alignments.bam`; report labels use Unassigned.

## ATAC counting semantics

`peak_signal=cutsite` sends already Tn5-adjusted endpoints to MACS2; `fragment` supplies full fragments. Peak calling defaults to all merged, deduplicated fragments rather than only bead-merge candidates.

The matrix counts left and right endpoints in peaks independently by default. Cell calling, FRIP and the TSS-region fragment fraction continue to use unique fragments. Cutsite matrix column sums cannot replace those statistics. `frags_cutoff=0` disables only the additional final fragment threshold; other filters remain active. `tss_cutoff=0` disables that proportion filter. TSS fraction and TSS enrichment are distinct. Low-targeting filtering is applied by default.

## Keep Python and native tools matched

Deploy the 3.2 Python layer with compatible `dnbc4rust` executables. Compressed C6 summaries require `c4_summary --gzip`; compressed RNA tables used by VDJ need a matching `vdj_pre_asm`. BAM memory scheduling and matrix interfaces also depend on updated tools. Replacing Python files alone does not deploy native changes.

See [Installation](installation.md). Changed matrix, counting and merging policies can affect results. Compare versions under new sample names or output directories and retain the 3.1 results.
