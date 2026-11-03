# Multi-omics Analysis Output

Integrated Multi-omics Output File Guide

## Overview <a id="overview"></a>

The multi-omics workflow organizes key RNA / ATAC / VDJ results into one sample-level directory, enabling cross-omics browsing and comparison within a single report.

> **Tip**
>
> The combined report is intended for fast overview and cross-module inspection. For detailed interpretation, please refer to each single-omics output document.

## Output Directory Structure <a id="output-directory-structure"></a>

```text
<outdir>/<sample>/
└── outs/
    ├── <sample>_multi_report.html             # Combined multi-omics report
    ├── rna/                                   # RNA outputs (if enabled)
    ├── atac/                                  # ATAC outputs (if enabled)
    ├── vdj-t/                                 # VDJ-T outputs (if enabled)
    └── vdj-b/                                 # VDJ-B outputs (if enabled)
```

## Detailed File Description <a id="detailed-file-description"></a>

### `outs/<sample>_multi_report.html`

- **Content**: Integrated QC and analysis charts across RNA / ATAC / VDJ.
- **Purpose**: Cross-omics quality check and result overview on one page.

### `outs/rna`, `outs/atac`, `outs/vdj-t`, `outs/vdj-b`

- **Content**: Standard module outputs (matrices, metrics tables, module reports, etc.).
- **Purpose**: Module-specific downstream analysis or single-omics reuse.

<a id="c6-outputs"></a>

> **Note: C6 Multiplexed RNA Outputs**
>
> Deliverables, directory structure, and QC metrics for C6 multiplexed RNA analysis have been moved to their own dedicated chapter. Please refer to [C6 Outputs](c6.en.md).

## Web Report Interpretation <a id="web-report-interpretation"></a>

**Overview**: The combined multi-omics report provides integrated views of core QC and analysis charts from RNA / ATAC / VDJ modules.

### Summary and Navigation

<img src="../images/html_multi_summary.png" alt="multi summary page" width="760">

The `Summary` page defines two-level navigation:

- **Top omics tabs (level 1)**: `RNA`, `ATAC`, `VDJ-T`, `VDJ-B`.
- **Left functional tabs (level 2)**: `Summary`, `Cells`, `Library`.

Left-tab roles:

- `Summary`: Core overview metrics and run parameters for the current module.
- `Cells`: Cell-level QC, clustering, annotation, and clonotype views.
- `Library`: Library/sequencing-level quality metrics (Q30, mapping, enrichment).

### Configuration Parameters

<img src="../images/html_multi_parameter.png" alt="multi configuration parameters page" width="760">

This section is recommended for reproducibility checks and troubleshooting.

Page content includes:

- Module parameter blocks: `[rna]`, `[atac]`, `[vdj-t]`, `[vdj-b]`.
- Input data mapping: `fastqs` and `feature_types` relations in `[libraries]`.
- Input file paths: actual FASTQ paths in the `Input FASTQs` section.
- View switching: inspect parameter blocks by omics tabs.

### RNA Pages

#### `RNA > Cells`

<img src="../images/html_multi_scrna_cells.png" alt="multi RNA cells page" width="760">

Page content includes:

- `RNA Quality Metrics`: Cell-level quality statistics and distributions.
- `RNA Beads to Cells`: Barcode-rank curve and beads-per-cell distribution.
- `RNA Cluster Analysis`: Clustering results and UMAP visualization.
- `RNA Cell Annotation`: Cell-type annotation results.
- `Top Features by Cluster`: Feature-gene table by cluster.

#### `RNA > Library`

<img src="../images/html_multi_scrna_library.png" alt="multi RNA library page" width="760">

Page content includes:

- `Sequencing Metrics`: Reads, valid barcodes, valid UMIs, Q30, etc.
- `Mapping Metrics`: Alignment composition for all reads and filtered cells.
- `Saturation`: Sequencing saturation and gene discovery curves.

Reference:

- [scRNA output documentation](scRNA.en.md)

### ATAC Pages

#### `ATAC > Cells`

<img src="../images/html_multi_scatac_cells.png" alt="multi ATAC cells page" width="760">

Page content includes:

- `ATAC Quality Metrics`: Cell-level fragment and TSS-related metrics.
- `ATAC Beads to Cells`: Barcode-rank curve and beads-per-cell distribution.
- `ATAC Cluster Analysis`: ATAC clustering and low-dimensional visualization.
- `Targeting`: TSS enrichment profile and targeting-related charts.

#### `ATAC > Library`

<img src="../images/html_multi_scatac_library.png" alt="multi ATAC library page" width="760">

Page content includes:

- `ATAC Metrics`: Read pairs, valid barcodes, mapping, mitochondrial ratio, etc.
- `Cell Quality Metrics`: Duplication rate, Jaccard threshold, and related curves.

Reference:

- [scATAC output documentation](scATAC.en.md)

### VDJ Pages

#### `VDJ-T / VDJ-B > Cells`

<img src="../images/html_multi_scvdj_cells.png" alt="multi VDJ cells page" width="760">

Page content includes:

- `VDJ Quality Metrics`: Productive pairing and UMI/read support metrics.
- `V(D)J Annotation`: Chain and pairing annotation statistics.
- `VDJ Clonotypes`: Clonotype abundance plot and top-clonotype table.
- `VDJ Target`: Distribution of V(D)J cells in low-dimensional embedding.

#### `VDJ-T / VDJ-B > Library`

<img src="../images/html_multi_scvdj_library.png" alt="multi VDJ library page" width="760">

Page content includes:

- `Sequencing`: Reads, valid barcodes, valid UMIs, Q30, etc.
- `Enrichment`: Mapping proportions to V(D)J genes and chain types (TRA/TRB or IGH/IGK/IGL).

Reference:

- [scVDJ output documentation](scVDJ.en.md)

## Related Documentation

| Document | Description |
| :--- | :--- |
| [Multi Pipeline](../pipeline/multi.en.md) | Detailed multi-omics analysis workflow |
| [Multi Parameters](../parameter/multi.en.md) | Command parameter reference |
| [scRNA Outputs](scRNA.en.md) | scRNA module output documentation |
| [scATAC Outputs](scATAC.en.md) | scATAC module output documentation |
| [scVDJ Outputs](scVDJ.en.md) | scVDJ module output documentation |
| [Output Files](./outs.en.md) | Return to output documentation index |
