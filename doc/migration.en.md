# Upgrading from 3.1 to 3.2

This document summarizes the major new features, algorithmic optimizations, and output file changes in DNBelab C Series™ HT Single-Cell Analysis Software (dnbc4tools) between versions 3.1 and 3.2. Use the version switcher in the header to view the archived 3.1 documentation.

---

## Major New Feature: C6 Multiplexed scRNA Analysis

Version 3.2 introduces native support for **C6 Multiplexed scRNA Analysis**, enabling pooled multiplexed sequencing and high-precision sample demultiplexing within a single library:

- **Automated Execution**: Declare sample names and associated Sample Barcodes in the `[samples]` section of the `multi run` configuration. The software automatically detects and runs the C6 multiplexed pipeline without requiring manual chemistry flags.
- **Comprehensive Pooled and Per-Sample Expression Matrices**:
    - Complete gene expression matrices are generated for both the pooled library (in the root output directory) and for each demultiplexed sample (under `per_sample_outs/<sample>/`), provided concurrently in MEX directory, standard H5, and H5AD formats;
    - Each sample delivers a dedicated interactive HTML QC and analysis report (`per_sample_outs/<sample>/<sample>_scRNA_report.html`).
- **Sample-Specific BAM Outputs**:
    - By default, generates dedicated aligned BAM files for each individual sample (`per_sample_outs/<sample>/<sample>_alignments.bam` with index), facilitating sample-specific IGV visualization and variant detection;
    - Reads not uniquely assignable to any sample barcode are collected in `unassigned_alignments.bam`.
- **Independent Dual-UMI Correction**: Independently corrects and deduplicates both UMI segments for C6 dual-UMI architectures, ensuring high demultiplexing and quantification accuracy.

---

## Algorithmic Updates & Metric Interpretation

### 1. Single-Cell RNA (scRNA)
- **Optimized Intra-Cell Multi-Gene Duplicate UMI Resolution**:
    - Version 3.1 already supported this filtering mechanism, but had boundary condition defects. Version 3.2 resolves these defects and optimizes conflict resolution: when a UMI within a cell maps to multiple genes, it is assigned to the dominant gene with strictly higher read counts; if read counts tie, the ambiguous molecule is completely removed to eliminate artificial multi-gene co-expression and improve quantification fidelity.
- **Bound Safeguards for Automatic Cell Calling**:
    - Version 3.1 lacked explicit upper and lower bounds for automatic cell number prediction. Version 3.2 introduces automatic prediction bound constraints, effectively preventing abnormal over-calling or extreme under-calling in low-quality or high-ambient RNA samples.
- **Optimized Read 2 Cell Barcode Filtering**:
    - Refines quality control and filtering for Read 2 cell barcodes, more effectively identifying and error-correcting barcodes to retain more valid reads.

### 2. Single-Cell ATAC (scATAC)
- **Cutsite-Based Quantification for Peaks and Matrices**:
    - **What is a cutsite?** In ATAC-seq, Tn5 transposase binds open chromatin and cleaves the DNA double helix while inserting sequencing adapters, introducing a characteristic 9-bp staggered cut. **Cutsite mode counts the actual Tn5 insertion cleavage endpoints after 9-bp offset adjustment**. Compared to counting whole spanned fragments, cutsite mode directly and sensitively reflects local chromatin accessibility events.
    - **Metric Semantics**: Peak calling and matrix counts default to cutsite quantification; key QC metrics—including FRIP (Fraction of Reads in Peaks), TSS enrichment fraction, and Cell Calling—remain strictly evaluated on deduplicated unique fragments.

### 3. Single-Cell V(D)J (scVDJ)
- Improved chain pairing and contig assembly algorithms enhance full-length clonotype recall.
- Enhanced multi-threaded sampling determinism guarantees reproducible results across identical inputs.

---

## Output Directory & File Format Changes

| Change Item | Version 3.1 | Version 3.2 | Migration Action |
| :--- | :--- | :--- | :--- |
| **C6 Delivery Model** | Pooled analysis only | **Independent per-sample delivery** of reports, matrices, and dedicated BAMs, plus pooled matrices (MEX / H5 / H5AD) | Inspect per-sample results in `per_sample_outs/<sample>/`; global matrices are in the root directory. |
| **C6 Summary Table** | Uncompressed CSV | `outs/rna/singlecell.csv.gz` | Support gzip decompression; valid cells can be extracted using `is_cell_barcode`. |
| **RNA Matrix Directories** | `raw_matrix/`<br>`filter_matrix/` | `raw_feature_bc_matrix/`<br>`filtered_feature_bc_matrix/` | Aligned with standard 10X directory naming; companion `.h5` files added for faster loading. |
| **ATAC Matrix Directories** | `raw_peak_matrix/`<br>`filter_peak_matrix/` | `raw_peak_bc_matrix/`<br>`filtered_peak_bc_matrix/` | Standardized directory naming; companion `.h5` files added. |
| **ATAC Text Matrix** | `matrix.mtx.gz` tab-separated | `matrix.mtx.gz` **single-space** separated | Update custom scripts to split on whitespace (`line.split()`) or use standard MatrixMarket readers. |
| **Batch Analysis Scripts** | Written to output directory | Generated **only in the current working directory** | Run scripts from the current directory; `--outdir` sets analysis output; existing scripts are not overwritten. |
