# Outputs and reports

Find output directories, field definitions and report metrics by module. Independent runs write to `<outdir>/<name>/outs/`; Multi organizes modalities beneath that directory.

| Module | Main artifacts | Guide |
| :--- | :--- | :--- |
| RNA | Expression matrices, H5/H5AD, cell table, clustering and RNA report | [RNA outputs](scRNA.md) |
| ATAC | Peak matrices, fragments, cell QC and ATAC report | [ATAC outputs](scATAC.md) |
| V(D)J | Contig sequences, annotations, clonotypes and VDJ report | [VDJ outputs](scVDJ.md) |
| Multi-omics | Combined report, modality directories (RNA / ATAC / VDJ) | [Multi outputs](multi.md) |
| C6 Multiplexed | Root combined matrices, `singlecell.csv.gz`, per-sample matrices and reports | [C6 outputs](c6.md) |

## When reading results

- C6 `singlecell.csv.gz` retains background and zero-UMI rows; select called cells with `is_cell_barcode`.
- Ordinary RNA/ATAC still deliver `singlecell.csv` by default.
- ATAC matrices count cutsites by default; column sums cannot replace fragment QC metrics.
- `.xls` metric summaries are tab-separated text and can be imported as text in spreadsheet software.
- BAM delivery depends on output switches; indexes may be BAI or CSI.

[Import in R / Python](../io.md) · [File changes after upgrading](../migration.md) · [Troubleshooting](../troubleshooting.md)
