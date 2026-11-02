# Analysis workflows

Choose a workflow for input preparation, reference building, analysis and delivery.

| Experiment | Main steps | Guide |
| :--- | :--- | :--- |
| RNA | cDNA/oligo QC → alignment/counting → cell calling → clustering/report | [RNA](scRNA.md) |
| ATAC | Fragment processing → bead merging → peaks/matrix → cell QC/clustering | [ATAC](scATAC.md) |
| V(D)J | QC → assembly → annotation/filtering → clonotypes/report | [VDJ](scVDJ.md) |
| Ordinary multi-omics | CSV configuration → modality execution → output organization → combined report | [Multi](multi.md) |
| C6 multiplexed RNA | Shared library → probe assignment → independent sample calling/analysis | [C6](multi.md#c6-workflow) |

## Start an analysis

1. Prepare matched software and native tools using [Installation](../installation.md).
2. Check paired FASTQs, chemistry and reference, then follow [Quick Start](../quickstart.md).
3. Use the [Parameter Reference](../parameter/parameter.md) for overrides.
4. Check matrices, metrics and reports using [Outputs](../outs/outs.md).

Read the [Upgrade Guide](../migration.md) before migrating old results, or [Troubleshooting](../troubleshooting.md) for failed runs.
