# scVDJ Analysis Output

Single-Cell V(D)J Sequencing Output File Guide

## Overview <a id="overview"></a>

After single-cell V(D)J analysis is complete, a standardized set of files and subdirectories is generated in the specified output directory for immune receptor repertoire analysis.

> **Tip**: V(D)J analysis requires 5' end RNA sequencing data, and all output files adhere to the AIRR standard and are compatible with mainstream immunoinformatics tools.

> **Prerequisite**: 5' end single-cell RNA sequencing analysis must be completed first.

## Output Directory Structure <a id="output-directory-structure"></a>

```
.
├── airr_annotations.tsv                    # Annotation file in AIRR standard format
├── all_contig_annotations.csv              # Annotation information for all assembled sequences
├── all_contig.fasta                        # FASTA file of all assembled sequences
├── all_contig.fasta.fai                    # Index file for all assembled sequences
├── clonotypes.csv                          # Clonotype analysis results
├── consensus_annotations.csv               # Annotation information for consensus sequences
├── consensus.fasta                         # FASTA file of consensus sequences
├── consensus.fasta.fai                     # Index file for consensus sequences
├── filtered_contig_annotations.csv         # Annotation information for filtered assembled sequences
├── filtered_contig.fasta                   # FASTA file of filtered assembled sequences
├── filtered_contig.fasta.fai               # Index file for filtered assembled sequences
├── metrics_summary.xls                     # Summary of analysis quality metrics
└── *_scVDJ_TR(IG)_report.html              # Analysis report in HTML format
```
## Detailed File Description <a id="detailed-file-description"></a>

### V(D)J Assembly and Annotation Files <a id="vdj-assembly-and-annotation-files"></a>

**Core Content**: Results of V(D)J contig sequence assembly, precise annotation, and quality assessment, covering the complete information of TCR and BCR rearranged sequences.

#### V(D)J Transcript Structure and Composition

**Diagram of a Typical V(D)J Transcript Structure:**

<img src="../images/vdj_transcript.png" alt="V(D)J Transcript Structure Diagram" width="650">

**Explanation of Important Terms:**

<table>
<thead>
<tr>
<th width="20%">Region</th>
<th width="30%">Abbreviation</th>
<th width="50%">Biological Function</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Untranslated Region</strong></td>
<td>UTR</td>
<td>Regulates mRNA stability and translation efficiency.</td>
</tr>
<tr>
<td><strong>Framework Region</strong></td>
<td>FWR</td>
<td>Maintains the conserved structural framework of the fold.</td>
</tr>
<tr>
<td><strong>CDR</strong></td>
<td>CDR</td>
<td>The key variable region that directly contacts the antigen.</td>
</tr>
</tbody>
</table>

> **Technical Advantage**: The V(D)J analysis pipeline can accurately identify and provide the amino acid and nucleotide sequences of the framework (FWR) and complementarity determining (CDR) regions.

#### Explanation of Important Annotation Standards

##### Full-Length Sequence Determination Criteria (Full Length)

A contig sequence is identified as a **full-length sequence** if it meets the following strict conditions simultaneously:

- The contig sequence perfectly matches the 5' start region of an annotated V gene.
- The contig sequence extends completely to the 3' end region of a J gene.

##### Productive Sequence Determination Criteria (Productive)

A contig sequence is identified as a **productive sequence** (i.e., functionally active) if it meets all of the following conditions simultaneously:

- Meets all the requirements for a full-length sequence as described above.
- Contains a valid start codon (ATG) at the correct position.
- No premature stop codons are present within the V-J spanning region.
- The start codon of the V gene and the stop codon of the J gene are in the same reading frame.
- A complete CDR3 variable region is successfully identified.
- The length of the V-J spanning region is within the biologically plausible range for the respective gene.

##### High-Confidence Sequence Determination (High Confidence)

**Expected Receptor Configurations for Different Cell Types:**

<table>
<thead>
<tr>
<th width="25%">Cell Type</th>
<th width="45%">Standard Receptor Configuration</th>
<th width="30%">Biological Significance</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>T Cell</strong></td>
<td>1 productive TRA chain + 1 productive TRB chain</td>
<td>Normal TCR α/β heterodimer</td>
</tr>
<tr>
<td><strong>B Cell</strong></td>
<td>1 productive heavy chain + 1 productive light chain (κ or λ)</td>
<td>Normal BCR heavy/light chain pairing</td>
</tr>
</tbody>
</table>

**Principles for Marking Low-Confidence Sequences:**

**Common Causes for Anomalous Receptor Signals:**

<table>
<thead>
<tr>
<th width="25%">Anomaly Type</th>
<th width="75%">Cause Analysis</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Ambient Contamination</strong></td>
<td>Non-specific capture of free-floating mRNA (e.g., from apoptotic cells).</td>
</tr>
<tr>
<td><strong>Doublet Events</strong></td>
<td>Droplets containing multiple cells.</td>
</tr>
<tr>
<td><strong>Technical Artifacts</strong></td>
<td>Artificial sequences from PCR chimeras or incorrect primer binding.</td>
</tr>
</tbody>
</table>

** Basis for Determining Low-Confidence Sequences:**

- Abnormal receptor configuration patterns that are biologically highly improbable.
- Suspicious sequences with significantly low UMI support.
- A number of extra productive chains that clearly exceeds expectations.

#### airr_annotations.tsv

Contains annotated and consensus sequences of V(D)J rearrangements in the AIRR standard format.

*   **Purpose**:
    *   **Standardized Data Exchange**: Serves as an exchange format compliant with AIRR community standards, facilitating integration with other immune repertoire analysis tools.
    *   **In-depth Annotation**: Provides detailed V, D, J gene call information, CIGAR strings, sequence alignment results, and the nucleotide and amino acid sequences of the CDR3 region.

*   **Content and Format**:
    *   The file is in the AIRR standard TSV format.
    *   The fields included in the file are shown in the table below:

        <table>
        <thead>
        <tr>
        <th width="25%">Field Name</th>
        <th width="75%">Detailed Description</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><code>cell_id</code></td>
        <td>A unique identifier for the cell to which this rearrangement belongs, used for linking single-cell data.</td>
        </tr>
        <tr>
        <td><code>clone_id</code></td>
        <td>A clonotype ID that identifies the specific clonal group to which this rearrangement belongs, used for clonotype analysis.</td>
        </tr>
        <tr>
        <td><code>sequence_id</code></td>
        <td>The unique name or identifier of the contig (rearranged sequence).</td>
        </tr>
        <tr>
        <td><code>sequence</code></td>
        <td>The complete nucleotide sequence of the V(D)J rearrangement, including all variable, diversity, and joining regions.</td>
        </tr>
        <tr>
        <td><code>sequence_aa</code></td>
        <td>The amino acid sequence translated from the rearranged region, reflecting the functional protein product.</td>
        </tr>
        <tr>
        <td><code>productive</code></td>
        <td>Indicates whether the rearrangement is productive (biologically functional), requiring conditions like in-frame translation and no stop codons.</td>
        </tr>
        <tr>
        <td><code>rev_comp</code></td>
        <td>Indicates if the sequence is a reverse complement (default: false), used for sequence orientation marking.</td>
        </tr>
        <tr>
        <td><code>v_call</code></td>
        <td>The name of the identified V (variable) gene segment.</td>
        </tr>
        <tr>
        <td><code>v_cigar</code></td>
        <td>The CIGAR string for the V gene alignment, recording detailed alignment information (matches, insertions, deletions, etc.).</td>
        </tr>
        <tr>
        <td><code>d_call</code></td>
        <td>The name of the identified D (diversity) gene segment (only for heavy and beta chains).</td>
        </tr>
        <tr>
        <td><code>d_cigar</code></td>
        <td>The CIGAR string for the D gene alignment, detailing the alignment results of the diversity region.</td>
        </tr>
        <tr>
        <td><code>j_call</code></td>
        <td>The name of the identified J (joining) gene segment, a key element for completing V(D)J recombination.</td>
        </tr>
        <tr>
        <td><code>j_cigar</code></td>
        <td>The CIGAR string for the J gene alignment, recording precise alignment information of the joining region.</td>
        </tr>
        <tr>
        <td><code>c_call</code></td>
        <td>The name of the identified C (constant) gene segment, which determines the functional type of the antibody/receptor.</td>
        </tr>
        <tr>
        <td><code>c_cigar</code></td>
        <td>The CIGAR string for the C gene alignment, recording the alignment details of the constant region.</td>
        </tr>
        <tr>
        <td><code>sequence_alignment</code></td>
        <td>Detailed alignment result of the V(D)J rearranged region against the reference germline sequence, showing mutations and variations.</td>
        </tr>
        <tr>
        <td><code>germline_alignment</code></td>
        <td>Inferred full-length germline sequence alignment result, used for somatic hypermutation analysis.</td>
        </tr>
        <tr>
        <td><code>junction</code></td>
        <td>The nucleotide sequence of the V(D)J rearrangement's junction (CDR3 region), which determines antigen-binding specificity.</td>
        </tr>
        <tr>
        <td><code>junction_aa</code></td>
        <td>The amino acid sequence of the junction (CDR3 amino acids), the key domain for antigen recognition.</td>
        </tr>
        <tr>
        <td><code>junction_length</code></td>
        <td>The length of the CDR3 nucleotide sequence (in bp), which affects antigen-binding affinity and specificity.</td>
        </tr>
        <tr>
        <td><code>junction_aa_length</code></td>
        <td>The length of the CDR3 amino acid sequence (in aa), which determines the spatial structure of the antigen-binding loop.</td>
        </tr>
        <tr>
        <td><code>v_sequence_start</code></td>
        <td>The start position of the V region in the rearranged sequence (1-based coordinate system).</td>
        </tr>
        <tr>
        <td><code>v_sequence_end</code></td>
        <td>The end position of the V region in the rearranged sequence (1-based coordinate system).</td>
        </tr>
        <tr>
        <td><code>d_sequence_start</code></td>
        <td>The start position of the D region in the rearranged sequence (1-based coordinate system).</td>
        </tr>
        <tr>
        <td><code>d_sequence_end</code></td>
        <td>The end position of the D region in the rearranged sequence (1-based coordinate system).</td>
        </tr>
        <tr>
        <td><code>j_sequence_start</code></td>
        <td>The start position of the J region in the rearranged sequence (1-based coordinate system).</td>
        </tr>
        <tr>
        <td><code>j_sequence_end</code></td>
        <td>The end position of the J region in the rearranged sequence (1-based coordinate system).</td>
        </tr>
        <tr>
        <td><code>c_sequence_start</code></td>
        <td>The start position of the C region in the rearranged sequence (1-based coordinate system).</td>
        </tr>
        <tr>
        <td><code>c_sequence_end</code></td>
        <td>The end position of the C region in the rearranged sequence (1-based coordinate system).</td>
        </tr>
        <tr>
        <td><code>consensus_count</code></td>
        <td>The total number of reads supporting this rearrangement, reflecting sequencing depth and sequence reliability.</td>
        </tr>
        <tr>
        <td><code>duplicate_count</code></td>
        <td>The number of unique UMI molecules supporting this rearrangement, used for deduplication and quantitative analysis.</td>
        </tr>
        <tr>
        <td><code>is_cell</code></td>
        <td>Indicates whether this rearrangement originates from a real cell (TRUE: cell; FALSE: background/empty droplet).</td>
        </tr>
        </tbody>
        </table>

#### all_contig_annotations.csv

Contains detailed annotation information for all contig sequences (from both cellular and background barcodes).

*   **Purpose**:
    *   **Data Review**: Provides all assembled contig data, including low-quality or background signals, for quality control review.
    *   **Complete Annotation**: Offers full annotation of V(D)J gene segments and CDR/FWR regions.

*   **Content and Format**:
    *   The file is in CSV text format.
    *   The fields included in the file are shown in the table below:

        <table>
        <thead>
        <tr>
        <th width="25%">Field Name</th>
        <th width="75%">Description</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><code>sample</code></td>
        <td>Sample name of the V(D)J library.</td>
        </tr>
        <tr>
        <td><code>barcode</code></td>
        <td>The cell ID (or barcode) corresponding to this contig.</td>
        </tr>
        <tr>
        <td><code>is_cell</code></td>
        <td>A boolean value indicating if this cell ID was identified as a cell (TRUE for cell, FALSE for background).</td>
        </tr>
        <tr>
        <td><code>contig_id</code></td>
        <td>A unique identifier for this contig.</td>
        </tr>
        <tr>
        <td><code>high_confidence</code></td>
        <td>A boolean value indicating if this contig was marked as high confidence (not likely to be a chimera or other artifact).</td>
        </tr>
        <tr>
        <td><code>length</code></td>
        <td>The nucleotide length of the contig sequence (bp).</td>
        </tr>
        <tr>
        <td><code>chain</code></td>
        <td>The chain type associated with this contig: TRA, TRB, IGK, IGL, or IGH.</td>
        </tr>
        <tr>
        <td><code>v_gene</code></td>
        <td>Top-scoring V gene segment call (e.g., TRAV1-1).</td>
        </tr>
        <tr>
        <td><code>d_gene</code></td>
        <td>Top-scoring D gene segment call (e.g., TRBD1), when applicable.</td>
        </tr>
        <tr>
        <td><code>j_gene</code></td>
        <td>Top-scoring J gene segment call (e.g., TRAJ1-1).</td>
        </tr>
        <tr>
        <td><code>full_length</code></td>
        <td>Boolean flag indicating whether the contig is called full length.</td>
        </tr>
        <tr>
        <td><code>productive</code></td>
        <td>Boolean flag indicating whether the contig is called productive.</td>
        </tr>
        <tr>
        <td><code>fwr1</code></td>
        <td>Predicted FWR1 amino acid sequence.</td>
        </tr>
        <tr>
        <td><code>fwr1_nt</code></td>
        <td>Predicted FWR1 nucleotide sequence.</td>
        </tr>
        <tr>
        <td><code>cdr1</code></td>
        <td>Predicted CDR1 amino acid sequence.</td>
        </tr>
        <tr>
        <td><code>cdr1_nt</code></td>
        <td>Predicted CDR1 nucleotide sequence.</td>
        </tr>
        <tr>
        <td><code>fwr2</code></td>
        <td>Predicted FWR2 amino acid sequence.</td>
        </tr>
        <tr>
        <td><code>fwr2_nt</code></td>
        <td>Predicted FWR2 nucleotide sequence.</td>
        </tr>
        <tr>
        <td><code>cdr2</code></td>
        <td>Predicted CDR2 amino acid sequence.</td>
        </tr>
        <tr>
        <td><code>cdr2_nt</code></td>
        <td>Predicted CDR2 nucleotide sequence.</td>
        </tr>
        <tr>
        <td><code>fwr3</code></td>
        <td>Predicted FWR3 amino acid sequence.</td>
        </tr>
        <tr>
        <td><code>fwr3_nt</code></td>
        <td>Predicted FWR3 nucleotide sequence.</td>
        </tr>
        <tr>
        <td><code>cdr3</code></td>
        <td>Predicted CDR3 amino acid sequence.</td>
        </tr>
        <tr>
        <td><code>cdr3_nt</code></td>
        <td>Predicted CDR3 nucleotide sequence.</td>
        </tr>
        <tr>
        <td><code>fwr4</code></td>
        <td>Predicted FWR4 amino acid sequence.</td>
        </tr>
        <tr>
        <td><code>fwr4_nt</code></td>
        <td>Predicted FWR4 nucleotide sequence.</td>
        </tr>
        <tr>
        <td><code>reads</code></td>
        <td>Number of reads aligned to this contig.</td>
        </tr>
        <tr>
        <td><code>umis</code></td>
        <td>Number of distinct UMIs aligned to this contig.</td>
        </tr>
        <tr>
        <td><code>raw_clonotype_id</code></td>
        <td>Clonotype ID assigned to this cell barcode.</td>
        </tr>
        <tr>
        <td><code>raw_consensus_id</code></td>
        <td>Consensus sequence ID assigned to this contig.</td>
        </tr>
        <tr>
        <td><code>exact_subclonotype_id</code></td>
        <td>Exact subclonotype ID assigned to this cell barcode.</td>
        </tr>
        </tbody>
        </table>

#### all_contig.fasta

Contains the nucleotide sequences of all assembled contigs.

*   **Purpose**:
    *   **Sequence Database**: Serves as a sequence database for all contigs, which can be used for igBLAST alignment or other sequence analyses.
    *   **Data Integrity**: Provides the most original assembly results.
*   **Content and Format**:
    *   Standard FASTA format, where each sequence corresponds to a contig, and the sequence identifier is the unique name of the contig.

#### filtered_contig_annotations.csv

A high-quality subset of `all_contig_annotations.csv`, containing only the annotation results for high-confidence contigs derived from cells.

*   **Purpose**:
    *   **Core Downstream Analysis**: This is the **recommended input file** for defining clonotypes and for most downstream analyses.
    *   **High-Quality Data**: Contains only contigs identified as from real cells and with high confidence, ensuring the accuracy of the analysis results.

*   **Content and Format**:
    *   The file format is identical to `all_contig_annotations.csv`.

#### filtered_contig.fasta

A high-quality subset of `all_contig.fasta`, containing only high-quality contig sequences that have passed quality filtering and cell calling.

*   **Purpose**:
    *   **Trusted Sequence Set**: Provides a high-confidence set of rearranged sequences for subsequent functional analysis or experimental validation.
*   **Content and Format**:
    *   Standard FASTA format, with the sequence identifier being the contig ID.

### Clonotype Analysis Files <a id="clonotype-analysis-files"></a>

**Core Content**: Precise identification, frequency statistics, and CDR3-sequence diversity analysis of TCR and BCR clonotypes.

#### clonotypes.csv

A statistical analysis file for clonotypes, providing detailed descriptive information for each unique clonotype.

*   **Purpose**:
    *   **Clonotype Abundance Analysis**: Statistics on the cell count (frequency) and proportion of each clonotype, used to assess the degree of clonal expansion.
    *   **Immune Diversity Assessment**: Analysis of clonotype distribution to study the diversity of the immune repertoire.
    *   **CDR3 Sequence Analysis**: Provides the precise amino acid and nucleotide sequences of the CDR3 for each clonotype.

*   **Content and Format**:
    *   The file is in CSV format.
    *   The fields included in the file are shown in the table below:

        <table>
        <thead>
        <tr>
        <th width="25%">Field Name</th>
        <th width="75%">Detailed Description</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><code>clonotype_id</code></td>
        <td>A unique identifier for the clonotype assigned to this consensus sequence, used to link and track all related cells of a specific clonal group.</td>
        </tr>
        <tr>
        <td><code>frequency</code></td>
        <td>The absolute number of cells observed with this clonotype, reflecting the degree of clonal expansion and the strength of the immune response.</td>
        </tr>
        <tr>
        <td><code>proportion</code></td>
        <td>The relative proportion of cells of this clonotype within the total cell population, used to assess clonal dominance and diversity distribution.</td>
        </tr>
        <tr>
        <td><code>cdr3s_aa</code></td>
        <td>A semicolon-separated list of chain:sequence pairs, formatted as "chain_name:CDR3_amino_acid_sequence".</td>
        </tr>
        <tr>
        <td><code>cdr3s_nt</code></td>
        <td>A semicolon-separated list of chain:sequence pairs, formatted as "chain_name:CDR3_nucleotide_sequence".</td>
        </tr>
        </tbody>
        </table>

#### consensus_annotations.csv

Provides detailed annotation information for each clonotype consensus sequence.

*   **Purpose**:
    *   **Representative Sequence Annotation**: Provides complete V(D)J gene and CDR/FWR region annotation for one representative sequence per clonotype.
    *   **Clonotype-level Analysis**: Supports sequence feature analysis at the clonotype level.
*   **Content and Format**:
    *   The file is in CSV format.
    *   The fields included are shown in the table below:
    <table>
    <thead>
    <tr>
    <th width="25%">Field Name</th>
    <th width="75%">Description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
    <td><code>clonotype_id</code></td>
    <td>Clonotype ID assigned to this consensus sequence, corresponding to the clonotype identifier in <code>clonotypes.csv</code>.</td>
    </tr>
    <tr>
    <td><code>consensus_id</code></td>
    <td>Unique identifier for the consensus sequence, used to link sequence records in FASTA files.</td>
    </tr>
    <tr>
    <td><code>sample</code></td>
    <td>Sample name of the V(D)J library.</td>
    </tr>
    <tr>
    <td><code>length</code></td>
    <td>Nucleotide length of the consensus sequence.</td>
    </tr>
    <tr>
    <td><code>chain</code></td>
    <td>Chain type associated with this consensus sequence: TRA, TRB, IGK, IGL, or IGH.</td>
    </tr>
    <tr>
    <td><code>v_gene</code></td>
    <td>Top-scoring V gene call.</td>
    </tr>
    <tr>
    <td><code>d_gene</code></td>
    <td>Top-scoring D gene call (if applicable).</td>
    </tr>
    <tr>
    <td><code>j_gene</code></td>
    <td>Top-scoring J gene call.</td>
    </tr>
    <tr>
    <td><code>c_gene</code></td>
    <td>Top-scoring C gene call.</td>
    </tr>
    <tr>
    <td><code>full_length</code></td>
    <td>Boolean flag indicating whether this consensus sequence is full length.</td>
    </tr>
    <tr>
    <td><code>productive</code></td>
    <td>Boolean flag indicating whether this consensus sequence is productive.</td>
    </tr>
    <tr>
    <td><code>cdr3</code></td>
    <td>Predicted CDR3 amino acid sequence.</td>
    </tr>
    <tr>
    <td><code>cdr3_nt</code></td>
    <td>Predicted CDR3 nucleotide sequence.</td>
    </tr>
    <tr>
    <td><code>reads</code></td>
    <td>Total number of reads supporting this consensus sequence.</td>
    </tr>
    <tr>
    <td><code>umis</code></td>
    <td>Number of distinct UMIs supporting this consensus sequence.</td>
    </tr>
    </tbody>
    </table>

#### consensus.fasta

A FASTA file containing the consensus sequence for each clonotype.

*   **Purpose**:
    *   **Representative Sequence Library**: Provides a representative sequence for each clonotype, which can be used for functional prediction or comparison with other datasets.
    *   **High-Quality Sequence**: The consensus sequence is generated by a clonotype grouping algorithm and is ideally a full-length sequence (from the 5’ UTR start to the C-gene primer binding site).

*   **Content and Format**:
    *   Standard FASTA format, with the sequence identifier being the `consensus_id`.

### Analysis Metrics Summary <a id="analysis-metrics-summary"></a>

**Core Content**: A comprehensive evaluation and summary of statistical metrics for V(D)J assembly quality, providing complete data quality control information.

#### metrics_summary.xls

A summary table of key analysis metrics in Excel format, providing a structured assessment of the overall experiment quality.

*   **Purpose**:
    *   **Quality Assessment**: Quickly evaluate core metrics such as sequencing quality, cell identification, gene mapping, and assembly effectiveness.
    *   **Results Overview**: Provides a summary view of the analysis results without inspecting all files.

*   **Content and Format**:
    *   Includes five main categories of key metrics:

        <table>
        <thead>
        <tr>
        <th width="25%">Metric Category</th>
        <th width="75%">Content Included</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td><strong>Basic Statistics</strong></td>
        <td>Total reads, valid barcode ratio, UMI quality, Q30 base quality, etc.</td>
        </tr>
        <tr>
        <td><strong>Cell Identification</strong></td>
        <td>Estimated number of cells, fraction of reads in cells, mean reads per cell, etc.</td>
        </tr>
        <tr>
        <td><strong>Gene Mapping</strong></td>
        <td>V(D)J gene mapping ratio, chain-specific mapping statistics, gene usage analysis.</td>
        </tr>
        <tr>
        <td><strong>Assembly Quality</strong></td>
        <td>Full-length sequence ratio, productive sequence ratio, CDR3 identification Success.</td>
        </tr>
        <tr>
        <td><strong>Clonotype Analysis</strong></td>
        <td>Clonotype diversity, pairing success rate, major clonotype frequencies.</td>
        </tr>
        </tbody>
        </table>

    *   Built-in recommended quality control standards for user convenience:
        <details markdown="block" open>
        <summary><strong>Recommended Quality Thresholds:</strong></summary>
        <ul>
        <li><strong>Valid Barcode Rate</strong>: >70%</li>
        <li><strong>Q30 Base Quality</strong>: >75% (for barcodes and UMIs)</li>
        <li><strong>V(D)J Gene Mapping Rate</strong>: >30%</li>
        <li><strong>Productive Pairing Rate</strong>: >20%</li>
        <li><strong>Mean Reads per Cell</strong>: >5,000</li>
        </ul>
        </details>

#### *_scVDJ_TR(IG)_report.html

An interactive HTML report for reviewing analysis results.

*   **Purpose**:
    *   **Results Visualization**: Intuitively displays key results such as QC, rearrangement analysis, and clonotype analysis in the form of interactive charts.
    *   **Results Interpretation**: Provides the biological significance and technical explanation of each metric.
    *   **Easy Sharing**: A single HTML file that is easy to circulate and share.

*   **Content and Format**:
    *   Can be opened in any modern browser without an internet connection.

## Web Report Interpretation <a id="web-report-interpretation"></a>

**Overview**: The HTML web report provides visual summaries and metric explanations for single-cell V(D)J sequencing results, including key performance indicators for experimental quality and immune receptor analysis.

The HTML web report is the main entry point for reviewing single-cell V(D)J sequencing results. It covers cell calling, sequencing quality, V(D)J enrichment, productive pairing, and clonotype abundance, and helps users identify metrics that require further review.

> **Usage Notes**: Review metrics in the order presented in the report.

> **Note**: The following standards are for reference only. Actual quality assessment should consider tissue type, cell state, experimental objectives, and sample-specific context.

### Main Report Content and Structure

<img src="../images/html_scvdj1.png" alt="scVDJ Web Report" width="500">

### Detailed Explanation of Core Analysis Metrics

#### V(D)J Analysis Metrics <a id="vdj-analysis-metrics"></a>

**Core Function**: Cell identification, quality assessment, and immune receptor assembly statistics.

**Quality Control Standards:**

<table>
<thead>
<tr>
<th width="25%">Metric Name</th>
<th width="30%">Recommended</th>
<th width="30%">Acceptable</th>
<th width="15%">Needs Improvement</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Mean reads per cell</strong></td>
<td>≥ 10,000</td>
<td>5,000–10,000</td>
<td>< 5,000</td>
</tr>
<tr>
<td><strong>Fraction of Reads in Cells</strong></td>
<td>≥ 50%</td>
<td>20–50%</td>
<td>< 20%</td>
</tr>
</tbody>
</table>

**Detailed Metric Explanations:**

<table>
<thead>
<tr>
<th width="30%">Metric Name</th>
<th width="70%">Detailed Explanation and Technical Requirements</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Estimated number of cells</strong></td>
<td>Estimated number of barcodes associated with cells expressing target V(D)J transcripts. Interpret this value together with loaded cell number, target B/T-cell proportion, sample integrity, enrichment efficiency, and sequencing depth.</td>
</tr>
<tr>
<td><strong>Mean reads per cell</strong></td>
<td>Ratio of total sequencing read pairs to estimated valid cells. A depth of ≥ 5,000 read pairs per cell is recommended; insufficient depth may reduce cell calling accuracy, contig assembly completeness, and clonotype identification stability.</td>
</tr>
<tr>
<td><strong>Fraction of Reads in Cells</strong></td>
<td>Ratio of reads with cell-associated barcodes to total valid-barcode reads. Higher values usually indicate better cell capture and lower background; low values may suggest poor sample quality, inappropriate cell concentration, library issues, or elevated background reads.</td>
</tr>
<tr>
<td><strong>Median UMIs per cell</strong></td>
<td>Median UMI count assigned to specific receptor chains such as IGH, TRA, TRB, IGK, and IGL. Used to assess receptor transcript capture and expression strength per cell.</td>
</tr>
<tr>
<td><strong>Productive contig metrics</strong></td>
<td>Statistics for cells with productive V-J spanning rearrangements. These metrics indicate the fraction of cells suitable for functional TCR/BCR analysis and clonotype interpretation.</td>
</tr>
</tbody>
</table>

#### Sequencing Metrics <a id="sequencing-metrics"></a>

**Core Function**: Basic quality assessment of sequencing data.

**Quality Control Standards:**

<table>
<thead>
<tr>
<th width="25%">Metric Name</th>
<th width="30%">Recommended</th>
<th width="30%">Acceptable</th>
<th width="15%">Needs Improvement</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Valid barcodes</strong></td>
<td>≥ 80%</td>
<td>70–80%</td>
<td>< 70%</td>
</tr>
<tr>
<td><strong>Valid UMIs</strong></td>
<td>≥ 80%</td>
<td>70–80%</td>
<td>< 70%</td>
</tr>
<tr>
<td><strong>Q30 Base Quality</strong></td>
<td>≥ 85%</td>
<td>75–85%</td>
<td>< 75%</td>
</tr>
</tbody>
</table>

**Detailed Metric Explanations:**

<table>
<thead>
<tr>
<th width="30%">Metric Name</th>
<th width="70%">Detailed Explanation and Significance</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Valid barcodes</strong></td>
<td>Proportion of reads whose cell barcode matches the whitelist. This metric assesses barcode recognition stability and whether reads can be assigned to cells correctly.</td>
</tr>
<tr>
<td><strong>Valid UMIs</strong></td>
<td>Proportion of UMIs without `N` bases and not homopolymers. This metric assesses whether UMI sequences can support reliable molecular deduplication and counting.</td>
</tr>
<tr>
<td><strong>Q30 Base Quality</strong></td>
<td>Proportion of bases with quality score Q30 or higher. Q30 corresponds to a sequencing error rate below 0.1% and supports accurate barcode recognition, UMI counting, and V(D)J sequence assembly.</td>
</tr>
</tbody>
</table>

#### Enrichment Metrics <a id="enrichment-metrics"></a>

**Core Function**: Evaluation of V(D)J gene enrichment efficiency, reflecting the capture performance of immune receptor sequences.

**Quality Control Standards:**

> **Note**: The following standards are for reference only. Actual quality assessment should consider tissue type, cell state, and experimental objectives.

<table>
<thead>
<tr>
<th width="25%">Metric Category</th>
<th width="25%">Recommended</th>
<th width="25%">Acceptable</th>
<th width="25%">Needs Improvement</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Reads mapped to any V(D)J gene</strong></td>
<td>≥ 50%</td>
<td>30–50%</td>
<td>< 30%</td>
</tr>
</tbody>
</table>

**Detailed Metric Explanations:**

<table>
<thead>
<tr>
<th width="30%">Metric Name</th>
<th width="70%">Detailed Explanation and Significance</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Reads mapped to any V(D)J gene</strong><br><em>Fraction of reads mapped to V(D)J genes</em></td>
<td>
<ul>
<li><strong>Definition</strong>: Fraction of reads with valid barcodes that partially or fully map to any germline V(D)J gene segment.</li>
<li><strong>Interpretation (&lt;30%)</strong>: May indicate low B/T-cell proportion, degraded sample quality, insufficient enrichment efficiency, or reference mismatch.</li>
</ul>
</td>
</tr>
<tr>
<td><strong>Reads mapped to TRA/TRB/IGH/IGK/IGL</strong><br><em>Chain-specific mapping fractions</em></td>
<td>
<ul>
<li><strong>TRA vs TRB</strong>: TRA expression is often lower than TRB; this ratio helps assess whether TCR chain capture is consistent with expectations.</li>
<li><strong>IGH vs IGK/IGL</strong>: Heavy and light chain mapping fractions jointly reflect BCR chain usage and relative expression abundance.</li>
<li><strong>Calculation baseline</strong>: All enrichment fractions use total valid-barcode reads as denominator.</li>
</ul>
</td>
</tr>
</tbody>
</table>

#### V(D)J Annotation Metrics <a id="vdj-annotation-metrics"></a>

**Core Function**: Productive rearrangement pairing analysis to evaluate functional immune receptor expression.

**Quality Control Standards:**

<table>
<thead>
<tr>
<th width="25%">Metric Name</th>
<th width="25%">Recommended</th>
<th width="25%">Acceptable</th>
<th width="25%">Needs Improvement</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Cells with productive V-J spanning pair</strong></td>
<td>≥ 40%</td>
<td>20–40%</td>
<td>< 20%</td>
</tr>
</tbody>
</table>

**Detailed Metric Explanations:**

<table>
<thead>
<tr>
<th width="30%">Metric Name</th>
<th width="70%">Detailed Explanation and Technical Requirements</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Number of Cells with Productive V-J Spanning Pair</strong></td>
<td>Absolute number of cells with at least one productive paired receptor (TRA/TRB or heavy/light chain pair). This metric indicates the number of cells available for functional TCR/BCR pairing analysis.</td>
</tr>
<tr>
<td><strong>Cells with productive V-J spanning pair</strong></td>
<td>
Percentage of cell-associated barcodes with at least one complete receptor pair where both chains are productive. This metric indicates the fraction of cells suitable for reliable clonotype analysis and functional receptor interpretation. Productive contigs require a full V-to-J span, valid start codon, complete in-frame CDR3, and no premature stop codon.
</td>
</tr>
<tr>
<td><strong>Cells with productive V-J spanning (IGK, IGH) pair</strong></td>
<td>BCR-specific metric showing the fraction of cells with productive IGK/IGH pairing. It depends on the proportion of kappa-chain expressing B-cell subpopulations and should be interpreted together with IGL/IGH pairing.</td>
</tr>
<tr>
<td><strong>Cells with productive V-J spanning (IGL, IGH) pair</strong></td>
<td>BCR-specific metric showing the fraction of cells with productive IGL/IGH pairing. It complements the IGK/IGH metric and helps characterize B-cell light-chain usage.</td>
</tr>
<tr>
<td><strong>Cells with productive V-J spanning (TRA, TRB) pair</strong></td>
<td>TCR-specific metric showing the fraction of cells with productive TRA/TRB pairing. Higher values generally indicate more cells available for functional alpha-beta TCR analysis.</td>
</tr>
</tbody>
</table>

#### Visualization Chart 1 <a id="visualization-chart-1"></a>

**Core Function**: Multi-dimensional visualization for V(D)J cell QC, UMI analysis, and receptor expression assessment.

##### V(D)J Barcode Rank Plot

**Chart Function:** Visualizes per-cell UMI distribution (productive contigs only), showing cell-calling quality and background level.

<img src="../images/html_scvdj3.jpg" alt="V(D)J Barcode Rank Plot" width="400">

**How to Interpret:**

<ul>
  <li><strong>Axes</strong>: X-axis (Barcode Rank) shows cell barcodes ranked by total UMI counts (log scale); Y-axis (UMI Counts) shows total UMIs per cell (log scale).</li>
  <li><strong>Visual encoding</strong>: Blue line indicates called valid cells; gray line indicates background/noise; blue gradient zone indicates a transitional mixed region.</li>
  <li><strong>Quality assessment</strong>: A steeper drop typically indicates clearer separation between called cells and background. In BCR datasets, a subgroup with very high UMIs may appear and often represents plasma cells or plasmablasts with high immunoglobulin expression.</li>
</ul>

#### Visualization Chart 2 <a id="visualization-chart-2"></a>

**Core Function**: Visualization of clonotype abundance and immune receptor diversity.

##### Clonotype Abundance Analysis

**Chart Function:** Shows the relative abundance distribution of clonotypes and helps assess whether the immune response is dominated by a small number of expanded clones.

<img src="../images/html_scvdj2.png" alt="scVDJ clonotype analysis charts" width="500">

**How to Interpret:**

<ul>
  <li><strong>Top panel (Top 10 Clonotypes)</strong>: Bar chart of cell percentages for the top 10 clonotypes. More concentrated proportions usually indicate stronger clonal expansion.</li>
  <li><strong>Bottom table (Detail table)</strong>: Detailed information for the top 10 clonotypes, including clonotype ID, CDR3 amino acid/nucleotide sequences, absolute frequency, and relative proportion.</li>
</ul>

## Related Documentation

| Document | Description |
| :--- | :--- |
| [scVDJ Pipeline](../pipeline/scVDJ.md) | Detailed scVDJ analysis workflow |
| [scVDJ Parameters](../parameter/scVDJ.md) | Command parameter reference |
| [Output Files](./outs.md) | Return to output documentation index |
