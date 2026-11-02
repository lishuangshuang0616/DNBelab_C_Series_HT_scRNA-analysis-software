# DNBelab C Series HT Multi-omics Analysis Pipeline

Single-Cell Multi-omics Integrated Analysis Guide

## Overview <a id="overview"></a>

The Multi-omics workflow orchestrates RNA / ATAC / VDJ sub-pipelines, enabling multi-omics joint analysis through a single configuration file and generating integrated reports for cross-omics inspection.

**Workflow**: Configuration → Module Dispatch → Parallel Analysis → Status Aggregation → Integrated Report

 <strong>Usage Notes</strong>: <code>$dnbc4tools</code> represents the executable path and should be replaced with your actual installation path. Examples use line continuation characters <code>\</code> for readability; commands can also be written on a single line.

**Key Features**:

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Unified Orchestration</b></td>
      <td>One entry command dispatches multiple omics modules (RNA / ATAC / VDJ)</td>
    </tr>
    <tr>
      <td><b>Status Tracking</b></td>
      <td>Module-level status management (success / failed / skipped / reused)</td>
    </tr>
    <tr>
      <td><b>Integrated Report</b></td>
      <td>Generates integrated HTML report supporting cross-omics browsing and comparison</td>
    </tr>
    <tr>
      <td><b>Flexible Configuration</b></td>
      <td>Supports arbitrary module combinations (single / dual / all modules)</td>
    </tr>
  </tbody>
</table>

## Input Configuration <a id="input-configuration"></a>

### Configuration File Structure

`multi run` uses a CSV configuration file to define module parameters and input data. Typical sections include:

<table>
  <thead>
    <tr>
      <th>Section</th>
      <th>Purpose</th>
      <th>Key Parameters</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>[rna]</code></td>
      <td>RNA analysis module configuration</td>
      <td><code>genomeDir</code>, <code>expectcells</code>, <code>no_bam</code>...</td>
    </tr>
    <tr>
      <td><code>[atac]</code></td>
      <td>ATAC analysis module configuration</td>
      <td><code>genomeDir</code>, <code>frags_cutoff</code>, <code>need_bam</code>...</td>
    </tr>
    <tr>
      <td><code>[vdj-t]</code></td>
      <td>T-cell VDJ analysis configuration</td>
      <td><code>ref</code>, <code>beadstrans</code>...</td>
    </tr>
    <tr>
      <td><code>[vdj-b]</code></td>
      <td>B-cell VDJ analysis configuration</td>
      <td><code>ref</code>, <code>beadstrans</code>...</td>
    </tr>
    <tr>
      <td><code>[libraries]</code></td>
      <td>Input data mapping (required)</td>
      <td><code>fastqs</code>, <code>feature_types</code></td>
    </tr>
  </tbody>
</table>

 <strong>Detailed Configuration</strong>: Please refer to the <a href="../parameter/multi.en.md">Multi Parameter Documentation</a> for complete CSV configuration specifications and parameter mappings.

**`[libraries]` input directory requirements:**

<ul>
  <li><code>rna</code>: <code>fastqs</code> should point to the RNA FASTQ root directory, which must contain <code>cDNA/</code> and <code>oligo/</code> subdirectories.</li>
  <li><code>atac</code>: <code>fastqs</code> should point to the FASTQ directory for the current ATAC library, with R1/R2 files placed directly under that directory.</li>
  <li><code>vdj-t</code> / <code>vdj-b</code>: <code>fastqs</code> should point to the FASTQ directory for the current VDJ library. TCR and BCR data should be configured separately.</li>
  <li>Automatic detection relies on R1/R2 markers in file names. The recommended naming patterns are <code>_R1</code>/<code>_R2</code> or <code>_R1_</code>/<code>_R2_</code>.</li>
</ul>

### Minimal Configuration Example

<details markdown="block" open>
<summary> Configuration Example</summary>

```csv
[rna]
genomeDir,/database/scRNA/Human
end5,true
[vdj-t]
ref,human

[libraries]
fastqs,feature_types
/rawdata/rna/demo,rna
/rawdata/tcr/demo,vdj-t
```

</details>

### Running Command

```shell
$dnbc4tools multi run \
  --csv sample.csv \
  --name demo \
  --outdir /data/result \
  --threads 20
```

**Parameter Description**:

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>--csv</code></td>
      <td><b>Yes</b></td>
      <td>Path to CSV configuration file</td>
    </tr>
    <tr>
      <td><code>--name</code></td>
      <td><b>Yes</b></td>
      <td>Sample name for output directory naming</td>
    </tr>
    <tr>
      <td><code>--outdir</code></td>
      <td>No</td>
      <td>Output directory, defaults to current directory <code>./</code></td>
    </tr>
    <tr>
      <td><code>--threads</code></td>
      <td>No</td>
      <td>Number of CPU threads, uses software default if not specified</td>
    </tr>
  </tbody>
</table>

### Pre-Run Checklist

 <strong>Please verify the following before running</strong>:

<ol>
  <li><code>--csv</code> and <code>--name</code> parameters are properly provided</li>
  <li>At least one omics module is enabled in the CSV file (corresponding section present)</li>
  <li>Input paths in <code>[libraries]</code> exist and correctly match <code>feature_types</code></li>
  <li>Required reference database parameters (e.g., <code>genomeDir</code>, <code>ref</code>) are complete with valid paths</li>
</ol>

## Main Pipeline <a id="main-pipeline"></a>

### Execution Flow

<table>
  <thead>
    <tr>
      <th>Stage</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>1. Configuration Parsing</b></td>
      <td>Reads CSV file, validates section integrity and parameter validity</td>
    </tr>
    <tr>
      <td><b>2. Task Decomposition</b></td>
      <td>Builds RNA / ATAC / VDJ sub-task queues based on enabled modules</td>
    </tr>
    <tr>
      <td><b>3. Sub-Pipeline Execution</b></td>
      <td>Sequentially invokes corresponding module commands, records runtime status</td>
    </tr>
    <tr>
      <td><b>4. Status Aggregation</b></td>
      <td>Aggregates return codes, runtime, skip/reuse status from each module</td>
    </tr>
    <tr>
      <td><b>5. Report Generation</b></td>
      <td>Generates multi-omics HTML integrated report combining core results from all modules</td>
    </tr>
  </tbody>
</table>

### Execution Highlights

<strong>Core Principles</strong>:
<ul>
  <li>Multi handles "<b>orchestration and aggregation</b>"; module algorithms remain in each single-omics sub-pipeline</li>
  <li>A module failure <b>will not</b> invalidate other completed modules but will be reflected in the final status summary</li>
</ul>

### Typical Runtime Log

```shell
Warning: ATAC joint analysis is currently unsupported. Libraries will be analyzed independently and summarized in a single report.

───────────────────────── Running checking libraries — 2026-04-08 13:39:42 ─────────────────────────
 RNA Library check complete
 VDJ-T Library check complete
 VDJ-B Library check complete
 ATAC Library check complete

──────────────────────────── Running RNA pipeline — 2026-04-08 13:40:10 ────────────────────────────

──────────────────────────── Parsed FASTQ Inputs — 2026-04-08 13:40:10 ─────────────────────────────
┌─────────────┬────────────────────────────────────────────────────────────────────────────────────┐
│ Type        │ Path                                                                               │
├─────────────┼────────────────────────────────────────────────────────────────────────────────────┤
│ cDNA Read 1 │ /data/cDNA/sample_cDNA_R1.fastq.gz                                                 │
│ cDNA Read 2 │ /data/cDNA/sample_cDNA_R2.fastq.gz                                                 │
│ oligo Read 1 │ /data/oligo/sample_oligo_1_R1.fastq.gz,/data/oligo/sample_oligo_2_R1.fastq.gz      │
│ oligo Read 2 │ /data/oligo/sample_oligo_1_R2.fastq.gz,/data/oligo/sample_oligo_2_R2.fastq.gz      │
└─────────────┴────────────────────────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────

──────────────────────────── Chemistry Detection — 2026-04-08 13:40:24 ─────────────────────────────
┌───────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Type                                          │ Result                                           │
├───────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ oligo Read 1                                   │ darkreaction                                     │
│ oligo Read 2                                   │ darkreaction                                     │
└───────────────────────────────────────────────┴──────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────

──────────────────────────── Chemistry Detection — 2026-04-08 13:40:24 ─────────────────────────────
┌─────────────────────────────────────────────┬────────────────────────────────────────────────────┐
│ Type                                        │ Result                                             │
├─────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│ cDNA Read 1                                  │ darkreaction                                       │
└─────────────────────────────────────────────┴────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────

 2026-04-08 13:40:24 Starting oligo library filtering...

 ...
```

## C6 multiplexed RNA workflow <a id="c6-workflow"></a>

A `[samples]` section activates the `scRNAC6` workflow in 3.2. Biological samples share cDNA/oligo FASTQs and a reference and are distinguished by probe barcodes. See the [C6 configuration](../parameter/multi.md#c6-samples).

1. Validate libraries, samples and unique probe assignments; detect dark cycles and perform FASTQ QC and barcode correction.
2. Align RNA and count UMIs. Sum RNA UMIs across probe suffixes for each 30 bp bead prefix; beads with at least 100 RNA UMIs become merge targets. Oligo supplies linkage evidence rather than the target threshold.
3. Score bead similarity with the robust model, retain probe suffixes, call cells per sample, then apply experiment-wide high-occupancy filtering (enabled by default).
4. Export combined raw/filtered matrices and complete `singlecell.csv.gz`; split sample matrices and run dimensional reduction, clustering, markers and available annotations independently.
5. Deliver the root Multi report, individual RNA reports and matrices. When enabled, split BAMs per sample and retain Unassigned and shared oligo BAMs.

The global `filtered_feature_bc_matrix.h5ad` contains sparse counts and gene/barcode metadata for all called cells. It has no joint PCA, UMAP, clustering or marker analysis. Start a separate combined analysis from that matrix if needed. The global `<run>_scRNA_report.html` is no longer delivered; complete RNA reports are in per-sample directories.

C6 RNA is orchestrated in the current process; other configured modalities retain their own child workflows. Ordinary Multi library sections and RNA/ATAC/VDJ output organization remain applicable below.

### Cell tables, reports and recovery

The six-column C6 summary retains background and zero-UMI rows and is streamed through gzip. Positive-UMI rows descend by UMI; zero-UMI rows retain group order. Use `is_cell_barcode` to select called cells. Report readers use validated small caches or bounded chunks rather than inferring memory needs from compressed file size.

Empty and failed samples have separate states. Zero cells do not imply successful clustering. Default `sample_failure_policy=skip` retains other successful samples; use `fail` to stop on failure. See [Running & Troubleshooting](../troubleshooting.md) for logs, checkpoints and integrity diagnostics.

See [C6 outputs](../outs/multi.md#c6-outputs) for file paths and QC denominators.

## Results <a id="results"></a>

### Output Directory Structure

After completion, results are organized under `<outdir>/<name>/`:

```text
<outdir>/<name>/
├── outs/                                    # Organized output results
│   ├── <sample>_multi_report.html           # Multi-omics integrated report
│   ├── rna/                                 # RNA results (if enabled)
│   ├── atac/                                # ATAC results (if enabled)
│   ├── vdj-t/                               # VDJ-T results (if enabled)
│   └── vdj-b/                               # VDJ-B results (if enabled)
├── logs/                                    # Logs and runtime status
│   ├── run_manifest.json                    # Module runtime status summary
│   └── *.log                                # Module runtime logs
├── RNA_ANALYSIS_WORKFLOW_PROCESSING/        # Module workflow directories (if enabled)
├── ATAC_ANALYSIS_WORKFLOW_PROCESSING/
├── VDJ-T_ANALYSIS_WORKFLOW_PROCESSING/
└── VDJ-B_ANALYSIS_WORKFLOW_PROCESSING/
```

### Key Output Files

<table>
  <thead>
    <tr>
      <th>File/Directory</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>outs/&lt;sample&gt;_multi_report.html</code></td>
      <td>Multi-omics integrated report displaying core QC and analysis charts from all modules</td>
    </tr>
    <tr>
      <td><code>outs/rna/</code></td>
      <td>RNA module standard outputs (matrix, statistics, module report, etc.)</td>
    </tr>
    <tr>
      <td><code>outs/atac/</code></td>
      <td>ATAC module standard outputs (fragment files, peaks, module report, etc.)</td>
    </tr>
    <tr>
      <td><code>outs/vdj-t/</code> / <code>outs/vdj-b/</code></td>
      <td>VDJ module standard outputs (clonotypes, annotations, module report, etc.)</td>
    </tr>
    <tr>
      <td><code>logs/run_manifest.json</code></td>
      <td>Module runtime status summary including return codes, runtime, and reuse status</td>
    </tr>
  </tbody>
</table>

 <strong>Detailed Output Description</strong>: Please refer to the <a href="../outs/multi.en.md">Multi Output Documentation</a> for detailed interpretation of the integrated report.

## Related Documentation

| Resource | Description |
| :--- | :--- |
| [Parameter Settings](../parameter/multi.en.md) | Complete parameter reference and descriptions |
| [Output Descriptions](../outs/multi.en.md) | Detailed interpretation of analysis results |
| [scRNA Pipeline](scRNA.en.md) | Single-cell RNA analysis workflow guide |
| [scATAC Pipeline](scATAC.en.md) | Single-cell ATAC analysis workflow guide |
| [scVDJ Pipeline](scVDJ.en.md) | Single-cell VDJ analysis workflow guide |

## Frequently Asked Questions

This section will be expanded as common usage questions are collected. For the current version, use the run log, parameter reference, and output file documentation as the primary troubleshooting references.
