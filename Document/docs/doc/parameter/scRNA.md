# scRNA 分析参数

DNBelab C Series HT scRNA 参数配置说明

## 概述 <a id="概述"></a>

本文档说明 `dnbc4tools rna` 各子命令的参数含义、默认行为和常见使用方式，覆盖单样本分析 (`run`)、参考库构建 (`mkref`) 与多样本任务生成 (`multi`)。

**提示：** 参数说明以当前命令行帮助信息为基础，示例可直接作为模板调整后使用。

## 主分析流程 (run) <a id="v32-options"></a> <a id="主分析流程-run"></a>

### 用法 <a id="usage"></a>

```bash
dnbc4tools rna run \
  --name sample1 \
  --fastqs /data/rna \
  --genomeDir /reference/rna \
  --threads 16
```

<details markdown="block" class="cli-help">
<summary>查看完整命令行帮助</summary>

```shell
$ dnbc4tools rna run --help
dnbc4tools 3.2

Process a single-cell RNA-seq sample.

Usage: dnbc4tools rna run [OPTIONS]

options:
  --help                     show this help message and exit

Input Files:
  Choose one input method: either `--fastqs` (directory input) or all four individual FASTQ files.

  --fastqs <DIR>             Directory containing cDNA and oligo FASTQ subfolders (e.g.,
                             `cDNA/sample_cdna_R1.fastq.gz`, `oligo/sample_oligo_R1.fastq.gz`). Paired-end files are
                             detected from the directory structure.
  --cDNAfastq1 <FILE>        cDNA Read1 FASTQ list. Supports wildcard and comma-separated inputs (e.g.,
                             `sample1_R1.fastq.gz,sample2_R1.fastq.gz`).
  --cDNAfastq2 <FILE>        cDNA Read2 FASTQ list. Order must match `--cDNAfastq1` (e.g.,
                             `sample1_R2.fastq.gz,sample2_R2.fastq.gz`).
  --oligofastq1 <FILE>       Oligo Read1 FASTQ list for barcode merging. Supports wildcard and comma-separated inputs.
  --oligofastq2 <FILE>       Oligo Read2 FASTQ list. Order must match `--oligofastq1` (e.g.,
                             `sample1_oligo_R2.fastq.gz`).

Basic Settings:
  --name <STR>               Unique identifier for the sample. Used for naming output files and reports (e.g.,
                             `sample1`).
  --genomeDir <DIR>          Reference genome directory path containing STAR index files (e.g., `./genome_index`).
  --outdir <DIR>             Output directory path for results and reports [default: current directory] (e.g.,
                             `./output`).
  --threads <INT>            Number of CPU threads for parallel processing [default: all available cores] (e.g.,
                             `16`).

Filtering Settings:
  --calling_method <STR>     Cell detection method [default: emptydrops]. Supported values: `barcoderanks`,
                             `emptydrops`.
  --expectcells <INT>        Expected number of cells to guide detection (e.g., `3000`).
  --forcecells <INT>         Force pipeline to use exactly this number of cells, overriding expected cell detection
                             (e.g., `5000`).
  --minumi <INT>             Minimum UMI count per cell to retain [default: 1000].
  --consistent_cells <FILE>  Headered CSV for merge/cell-calling constraints. Supported schemas: `cell`;
                             `cell,barcode`; `cell,is_cell_barcode`; `cell,barcode,is_cell_barcode`. Other columns are
                             ignored.

Library Settings:
  --chemistry <STR>          Library chemistry version. Options: `scRNAv1HT`, `scRNAv2HT`, `scRNAv3HT`, `scRNA5Pv1`.
  --darkreaction <STR>       Dark cycle setting for cDNA and oligo libraries. Provide two comma-separated values in
                             the form `<cDNA>,<oligo>`. cDNA=`R1`/`unset`; oligo=`R1R2`/`R1`/`unset`.
  --customize <STR>          Custom read structure string. Format: `<type>,<read>:<start>-<end>` joined by `;`. cDNA
                             (e.g., `"cb,R1:7-16;cb,R1:23-32;umi,R1:38-47;R1,R2:1-100"`). Oligo (e.g.,
                             `"cb,R1:7-16;cb,R1:23-32;R1,R2:1-10;R1,R2:17-26;R1,R2:33-42"`). For RNA, provide
                             `--customize` twice when both cDNA and oligo are customized: first cDNA, then oligo.

Analysis Settings:
  --no_introns               Exclude intronic reads from the expression matrix to increase specificity.
  --end5                     Enable 5'-end scRNA-seq analysis for 5' gene-expression profiling.
  --no_bam                   Skip BAM file generation to save time and disk space.
  --sample_read_pairs <INT>  Subsample this number of cDNA read pairs for analysis (e.g., `1000000`).
  --star_parameters <STR>    Extra STAR filtering, alignment, seeding or scoring arguments. Wrap them in quotes (e.g.,
                             `"--outFilterMismatchNmax 10 --outFilterMultimapNmax 1"`). Unknown or ineffective options
                             are rejected.
```

</details>

### 必需参数

**成功分析必须指定的基本参数**

#### `--name` (必需)

为本次分析提供一个唯一的样本名称。

<ul>
  <li><strong>功能：</strong> 该名称将用作所有输出文件和HTML报告的前缀。</li>
  <li><strong>显示：</strong> 在最终的网页报告中，此名称将作为样本ID显示。</li>
</ul>

**默认值：** 无

**示例：**

```text
--name sample_001
```

#### `--genomeDir` (必需)

指定参考基因组目录的路径。

<ul>
  <li><strong>要求：</strong> 目录必须包含由 <code>mkref</code> 命令生成的索引和注释资源。</li>
  <li><strong>内容：</strong> 包含基因组序列、STAR 比对索引等。</li>
</ul>

**默认值：** 无

**示例：**

```text
--genomeDir /path/to/genome/database
```

### 输入文件参数

**选择一种输入方式：基于目录或单独指定文件**

#### `--fastqs` (方式1)

指定包含所有 FASTQ 文件的目录路径。

<ul>
  <li><strong>功能：</strong> 流程会自动检测此目录下（包含 cDNA 和 oligo两个子目录）的配对文件。</li>
  <li><strong>目录要求（RNA）：</strong> <code>--fastqs</code> 指向的目录下必须包含 <code>cDNA/</code> 和 <code>oligo/</code> 两个子目录，且每个子目录内都应放置对应文库的 R1/R2 配对文件。</li>
  <li><strong>命名规则：</strong> 自动检测依赖文件名中的 R1/R2 标识，支持 <code>_R1_</code>、<code>_R1</code>、<code>_1</code>、<code>_read1</code> 与对应的 <code>_R2_</code>、<code>_R2</code>、<code>_2</code>、<code>_read2</code>；支持 <code>.fastq.gz</code>、<code>.fq.gz</code>、<code>.fastq</code>、<code>.fq</code>。</li>
  <li><strong>注意：</strong> 这是一个便捷选项，不能与 <code>--cDNAfastq1</code> / <code>--cDNAfastq2</code> / <code>--oligofastq1</code> / <code>--oligofastq2</code> 同时使用。</li>
</ul>

**推荐目录结构：**

```text
fastq_directory/
├── cDNA/
│   ├── sample_cDNA_L01_R1.fastq.gz
│   └── sample_cDNA_L01_R2.fastq.gz
└── oligo/
    ├── sample_oligo_L01_R1.fastq.gz
    └── sample_oligo_L01_R2.fastq.gz
```

**默认值：** 无

**示例：**

```text
--fastqs ./fastq_directory
```

#### `--cDNAfastq1` (方式2A)

单独指定一个或多个 cDNA Read 1 FASTQ 文件。

<ul>
  <li><strong>支持：</strong> 可以使用通配符 (<code>*</code>) 匹配文件，使用逗号分隔来指定多个文件。</li>
  <li><strong>要求：</strong> 必须与 <code>--cDNAfastq2</code> 参数配对使用，且文件顺序必须完全匹配。</li>
</ul>

**默认值：** 无

**示例：**

```text
--cDNAfastq1 sample_cDNA_L01_R1.fastq.gz,sample_cDNA_L02_R1.fastq.gz
```

#### `--cDNAfastq2` (方式2B)

单独指定一个或多个 cDNA Read 2 FASTQ 文件。

<ul>
  <li><strong>支持：</strong> 可以使用通配符 (<code>*</code>) 匹配文件，使用逗号分隔来指定多个文件。</li>
  <li><strong>要求：</strong> 必须与 <code>--cDNAfastq1</code> 参数配对使用，且文件顺序必须完全匹配。</li>
</ul>

**默认值：** 无

**示例：**

```text
--cDNAfastq2 sample_cDNA_L01_R2.fastq.gz,sample_cDNA_L02_R2.fastq.gz
```

#### `--oligofastq1` (方式2C)

单独指定一个或多个 oligo Read 1 FASTQ 文件。

<ul>
  <li><strong>支持：</strong> 可以使用通配符 (<code>*</code>) 匹配文件，使用逗号分隔来指定多个文件。</li>
  <li><strong>要求：</strong> 必须与 <code>--oligofastq2</code> 参数配对使用，且文件顺序必须完全匹配。</li>
</ul>

**默认值：** 无

**示例：**

```text
--oligofastq1 sample_oligo_L01_R1.fastq.gz
```

#### `--oligofastq2` (方式2D)

单独指定一个或多个 oligo Read 2 FASTQ 文件。

<ul>
  <li><strong>支持：</strong> 可以使用通配符 (<code>*</code>) 匹配文件，使用逗号分隔来指定多个文件。</li>
  <li><strong>要求：</strong> 必须与 <code>--oligofastq1</code> 参数配对使用，且文件顺序必须完全匹配。</li>
</ul>

**默认值：** 无

**示例：**

```text
--oligofastq2 sample_oligo_L01_R2.fastq.gz
```

**输入方式选择：**

<ul>
  <li><strong>方式1：</strong> 使用 <code>--fastqs</code> 指定包含 cDNA 和 oligo 子文件夹的目录。</li>
  <li><strong>方式2：</strong> 使用 <code>--cDNAfastq1</code>, <code>--cDNAfastq2</code>, <code>--oligofastq1</code>, <code>--oligofastq2</code> 分别指定 R1 和 R2 文件。</li>
</ul>

**重要提示：** 同一组输入文件必须来自同一文库，测序模式和暗反应设置需保持一致；不同文库的数据不能合并分析。

### 基本设置参数

#### `--outdir` (可选)

指定所有分析结果和报告的输出目录。

<ul>
  <li><strong>功能：</strong> 所有分析结果将保存在此目录中，流程会自动创建以样本名命名的结构化子目录。</li>
</ul>

**默认值：** `./` (当前目录)

**示例：**

```text
--outdir ./output_results
```

#### `--threads` (可选)

设置分析过程中可使用的 CPU 线程数。

<ul>
  <li><strong>功能：</strong> 增加线程数可提高分析速度。</li>
  <li><strong>建议：</strong> 根据可用的 CPU 核心数进行调整，以获得最佳性能。</li>
</ul>

**默认值：** `使用所有可用的 CPU 核心`

**示例：**

```text
--threads 32
```

### 过滤设置参数

#### `--calling_method` (可选)

设定细胞识别方法，用于区分真实细胞和空滴。

<details markdown="block" open>
  <summary><strong>方法对比分析</strong></summary>



##### barcoderanks

    <ul>
      <li><strong>原理：</strong> 基于总 UMI 计数的经验性阈值，通过 UMI 排序曲线的“拐点”识别细胞。</li>
      <li><strong>适用场景：</strong> 快速初步分析，或在细胞与背景区分明显的场景。</li>
    </ul>





##### emptydrops (默认)

    <ul>
      <li><strong>原理：</strong> 基于表达谱的统计检验，判断细胞表达谱是否区别于背景 RNA。</li>
      <li><strong>适用场景：</strong> 标准分析（推荐），能精确识别低 RNA 含量的细胞并控制假阳性。</li>
    </ul>


</details>

**默认值：** `emptydrops`

**示例：**

```text
# 切换为barcoderanks方法进行细胞识别
dnbc4tools rna run --name sample1 --fastqs ./fq --genomeDir ./ref --calling_method barcoderanks
```

#### `--expectcells` (可选)

省略或填写 `auto` 时自动估计；需要固定数量时使用只接受正整数的 `--forcecells`。

设定预期的细胞回收数量。

<ul>
  <li><strong>功能：</strong> 为emptydrops算法提供初步筛选的指导信息。</li>
  <li><strong>建议：</strong> 默认推荐使用<code>auto</code>模式，该模式会根据UMI分布特征自动估算细胞数量。若已知有效细胞数量，也可手动设置为该数量的50%作为初步筛选依据。</li>
</ul>

**默认值：** `auto`

**示例：**

```text
# 预期回收3000个细胞
dnbc4tools rna run --name sample1 --fastqs ./fq --genomeDir ./ref --expectcells 3000
```

#### `--forcecells` (可选)

强制流程使用确切的细胞数量，此参数会覆盖软件的自动细胞检测结果。

<ul>
  <li><strong>功能：</strong> 当需要分析一个预先知道数量的细胞群体时使用。</li>
  <li><strong>优先级：</strong> 这是最高优先级的过滤参数。</li>
</ul>

**默认值：** 无

**示例：**

```text
# 强制输出5000个细胞进行分析
dnbc4tools rna run --name sample1 --fastqs ./fq --genomeDir ./ref --forcecells 5000
```

#### `--minumi` (可选)

设定用于保留细胞的最低UMI数量。

<ul>
  <li><strong>功能：</strong> 这是核心的细胞质量控制参数。低于此阈值的细胞被认为数据质量不佳，将从后续分析中排除。</li>
  <li><strong>建议：</strong> 初次分析可使用默认值，然后根据网页报告中<em>UMI计数分布图</em>来确定更合适的阈值。</li>
</ul>

**默认值：** `1000`

**示例：**

```text
# 将细胞过滤的UMI阈值降低到500
dnbc4tools rna run --name sample1 --fastqs ./fq --genomeDir ./ref --minumi 500
```

#### `--consistent_cells` (可选)

支持带表头的 `.csv` / `.csv.gz`，包括完整的旧版六列汇总表。

提供用于细胞合并/细胞调用约束的CSV文件（需包含表头）。

<ul>
  <li><strong>功能：</strong> 在细胞条形码合并和最终细胞判定阶段引入外部约束，提升跨数据批次的一致性。</li>
  <li><strong>支持表头结构：</strong> <code>cell</code>、<code>cell,barcode</code>、<code>cell,is_cell_barcode</code>、<code>cell,barcode,is_cell_barcode</code>。</li>
  <li><strong>说明：</strong> 其他额外列会被忽略，不影响流程执行。</li>
  <li><strong>注意：</strong> 如果同时包含 <code>cell</code> 和 <code>barcode</code>，那么 oligo 数据的分析结果将不会对最终合并存在作用，可使用任何其他非该样本的 oligo 数据不会影响分析结果。</li>
</ul>

**默认值：** 无

**示例：**

```text
--consistent_cells ./constraints/consistent_cells.csv
```

**细胞识别分析建议**

细胞识别是单细胞分析的关键步骤，正确的参数设置和结果解读直接影响后续分析质量。

<details markdown="block" open>
<summary><strong>展开诊断与策略</strong></summary>

**细胞数量异常**

<ul>
  <li><strong>细胞数量过低：</strong> 常见于 <code>--minumi</code> 过高或背景污染偏高。可先降低 <code>--minumi</code> 并复查 UMI rank 曲线。</li>
  <li><strong>细胞数量过高：</strong> 常见于阈值过宽。可提高 <code>--minumi</code>，或用 <code>--forcecells</code> 约束目标细胞数。</li>
  <li><strong>UMI 分布无明显拐点：</strong> 建议优先检查文库与测序质量，再进行参数微调。</li>
</ul>

**曲线形态判断**

<ul>
  <li><strong>平缓下降：</strong> 细胞与背景分离不明显，建议采用更保守细胞数。</li>
  <li><strong>多个拐点：</strong> 可能存在多群体或双联体，建议结合下游 doublet 去除。</li>
  <li><strong>陡峭下降：</strong> 通常是较理想信号，默认参数通常即可。</li>
</ul>

**最佳实践：** 首次运行建议用默认参数，随后基于报告中的 UMI 分布和质控图做二次调参。

</details>

### 文库设置参数

#### `--chemistry` (可选)

配置scRNA试剂盒的化学反应版本，决定条形码和 UMI 的序列结构。

<ul>
  <li><strong>功能：</strong> 指导软件正确解析条形码和 UMI 的序列结构。</li>
  <li><strong>支持版本：</strong> <code>scRNAv1HT</code>, <code>scRNAv2HT</code>, <code>scRNAv3HT</code>, <code>scRNA5Pv1</code>。</li>
  <li><strong>自动检测 (auto)：</strong> 推荐默认使用；仅在自动识别失败时手动指定。</li>
</ul>

**默认值：** `auto`

**示例：**

```text
# 场景: 已知文库为scRNAv3HT无暗反应设置且自动分析失败
dnbc4tools rna run --name sample2 --fastqs ./fq --genomeDir ./ref --chemistry scRNAv3HT --darkreaction unset,unset
```

**重要提示：**不正确的设置可能导致细胞条形码识别失败。仅在了解文库结构或自动检测失败时手动指定。手动指定时建议配合 `--darkreaction` 一起设置。

#### `--darkreaction` (可选)

自动检测时单独使用 `auto`；手工格式为 `<cDNA>,<oligo>`，cDNA 支持 `R1/unset`，oligo 支持 `R1/R1R2/unset`。显式 chemistry 与暗反应须成对设置。

配置cDNA 和 oligo文库的暗循环（dark cycle）设置。

<ul>
  <li><strong>功能：</strong> 指导软件正确解析由测序化学产生的暗反应周期。</li>
  <li><strong>配置格式：</strong> <code>&lt;cDNA设置&gt;,&lt;oligo设置&gt;</code>。</li>
  <li><strong>手工取值：</strong> cDNA 为 R1/unset，oligo 为 R1/R1R2/unset；auto 单独使用。</li>
  <li><strong>自动检测 (auto)：</strong> 推荐默认使用；仅在自动识别失败时手动指定。</li>
</ul>

**默认值：** `auto`

**示例：**

```text
# 示例1: cDNA文库R1有暗循环, oligo文库双端有暗循环
--darkreaction R1,R1R2
```

```text
# 示例2: 两个文库都仅R1有暗循环
--darkreaction R1,R1
```

```text
# 示例3: 两个文库都无暗循环
--darkreaction unset,unset
```

**重要提示：**不正确的设置可能导致细胞条形码识别失败。仅在了解文库结构或自动检测失败时手动指定。手动指定时建议配合 `--chemistry` 一起设置。

#### `--customize` (高级)

为非标准文库精确定义条形码（barcode）、UMI和有效序列（read）的提取结构。此参数为高级功能，会覆盖 `--chemistry` 和 `--darkreaction` 的设置。

<ul>
  <li><strong>语法格式：</strong> <code>"&lt;type&gt;,&lt;read&gt;:&lt;start&gt;-&lt;end&gt;"</code>，多个段落以分号 (<code>;</code>) 分隔。</li>
  <li><strong>参数类型 (type)：</strong> <code>cb</code>（细胞条形码）、<code>umi</code>（UMI）、<code>R1</code>（Read 1 有效序列）、<code>R2</code>（Read 2 有效序列，仅双端测序）。</li>
  <li><strong>双重配置：</strong> 需要分别为 cDNA 和 oligo 文库指定两次 <code>--customize</code> 参数。</li>
  <li><strong>注意事项：</strong> 整个参数字符串必须用引号包裹；坐标为 1-based，且不能超过读长。</li>
</ul>

**示例：**

```text
# 以cDNA文库为例，结构: Barcode 1(1-10bp) + Barcode 2(11-20bp) + UMI(21-30bp) in R1; 序列(1-100bp) in R2
--customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R2:1-100"
```

```text
# 以cDNA文库为例，结构: Barcode 1(7-16bp) + Barcode 2(23-32bp) + UMI(38-47bp) in R1; 序列(1-100bp) in R2
--customize "cb,R1:7-16;cb,R1:23-32;umi,R1:38-47;R1,R2:1-100"
```

```text
# 以cDNA文库为例，5端转录本同时利用双端数据
--customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R1:31-120;R2,R2:1-150"
```

```text
# 示例: 为cDNA 和 oligo文库分别自定义序列结构
--customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R2:1-100" --customize "cb,R1:1-10;cb,R1:11-20;R1,R2:1-30"
```

**风险提示：**错误的自定义配置可能导致数据丢失或分析失败，建议仅在标准配置无法满足需求时使用。

### 分析设置参数

#### `--no_introns` (标志)

启用此参数以在分析过程中过滤掉来自内含子区域的reads。

<ul>
  <li><strong>功能：</strong> 仅保留来自外显子区域的reads进行表达量化，避免未成熟转录本干扰。</li>
</ul>

**默认值：** 不设置此参数则包含内含子区域的reads

#### `--end5` (标志)

启用5' 端单细胞转录组数据分析模式。

<ul>
  <li><strong>功能：</strong> 专门针对5' 端捕获的mRNA 进行分析。</li>
  <li><strong>注意：</strong> 仅在使用5' 端scRNA试剂盒时使用此参数。</li>
</ul>

**默认值：** 不设置此参数

#### `--no_bam` (标志)

启用此参数以跳过BAM 文件的生成。

<ul>
  <li><strong>功能：</strong> 减少运行时间和磁盘空间占用。</li>
  <li><strong>注意：</strong> 无法进行需要BAM 文件的下游分析。</li>
</ul>

**默认值：** 不设置此参数则生成BAM 文件

#### `--sample_read_pairs` (可选)

从输入的cDNA FASTQ 文件中提取指定数量的读段对进行分析。

<ul>
  <li><strong>功能：</strong> 用于在完整分析前对大数据集进行快速测试，或在资源有限时进行降采样分析。</li>
</ul>

**默认值：** 无 (使用全部数据)

**示例：**

```text
--sample_read_pairs 100000000
```

**分析建议**

首次分析时建议使用默认参数，获得结果报告后再根据需要调整参数。

#### `--star_parameters`

额外的 STAR 比对、过滤、seeding 或 scoring 参数。未知、由流程管理或不生效的参数会被拒绝。

```bash
--star_parameters "--outFilterMismatchNmax 10 --outFilterMultimapNmax 1"
```

<details markdown="block">
<summary>高级设置：BAM 资源</summary>

BAM 默认按线程、文件句柄和估算可用内存自动调度，通常无需手工设置。必要时可使用以下隐藏参数：

| 参数 | 含义 |
| :--- | :--- |
| `--bam-workers` | 并发 chunk worker 上限 |
| `--bam-compression-threads` | 每个 chunk 的压缩线程数 |
| `--bam-queue-depth` | 每个 writer 的队列深度 |
| `--bam-max-memory-gb` | 估算内存预算，单位 GiB，不是 RSS 上限 |
| `--bam-compression-level` | 0–9，省略沿用 HTSlib 默认值 |
| `--bam-limit-memory` | 连一个 worker 都无法满足估算预算时拒绝运行 |

`--no_bam` 会跳过 BAM。具体调度行为见 [Multi 参数](multi.md#bam-resources)。

</details>

## 参考数据库构建 (mkref) <a id="参考数据库构建-mkref"></a>

### 用法

```bash
dnbc4tools rna mkref \
  --fasta genome.fa --ingtf genes.gtf \
  --species human --genomeDir /reference/rna --threads 16
```

<details markdown="block" class="cli-help">
<summary>查看完整命令行帮助</summary>

```shell
$ dnbc4tools rna mkref --help
dnbc4tools 3.2

Build an RNA reference database.

Usage: dnbc4tools rna mkref [OPTIONS]

options:
  --help              show this help message and exit

Input Files:
  Input genome FASTA files and gene-annotation GTF files. For mixed-species analysis, separate multiple files with
  commas.

  --fasta <FILE>      Reference-genome FASTA file path(s). Separate multiple files with commas (e.g.,
                      `genome1.fa,genome2.fa`).
  --ingtf <FILE>      Gene-annotation GTF file path(s). Separate multiple files with commas (e.g.,
                      `anno1.gtf,anno2.gtf`).

Basic Settings:
  --genomeDir <DIR>   Output directory path for generated reference files [default: current directory] (e.g.,
                      `./ref`).
  --species <STR>     Species identifier(s). Use commas for mixed-species analysis [default: undefined] (e.g.,
                      `human,mouse`).
  --threads <INT>     Number of CPU threads for parallel processing [default: 10] (e.g., `16`).

Advanced Settings:
  --chrM <STR>        Mitochondrial chromosome identifier in the reference genome (e.g., `MT`).
  --limitram <INT>    Maximum RAM, in GB, allowed for index generation (e.g., `64`). Also affects memory usage and
                      alignment speed during mapping.
  --extra-args <STR>  Additional validated STAR genomeGenerate parameters (e.g., `"--sjdbOverhang 100
                      --genomeSAsparseD 2"`). Preflight rejects alignment-only, unknown and mkref-managed parameters.
  --noindex           Skip the STAR index-generation step.
```

</details>

### 必需参数

#### `--fasta` (必需)

提供参考基因组序列文件。

<ul>
  <li><strong>要求：</strong> 标准FASTA格式，建议使用primary组装版本。</li>
</ul>

**默认值：** 无

**示例：**

```text
--fasta Homo_sapiens.GRCh38.dna.primary_assembly.fa
```

#### `--ingtf` (必需)

提供基因结构注释文件。

<ul>
  <li><strong>功能：</strong> 用于基因表达量化和注释。</li>
  <li><strong>要求：</strong> 标准 GTF 格式。</li>
  <li><strong>必需特征：</strong> 必须包含 <code>gene</code>/<code>transcript</code>、<code>exon</code> 类型注释。</li>
  <li><strong>必需属性：</strong> 必须包含 <code>gene_id</code>/<code>gene_name</code>、<code>transcript_id</code>/<code>transcript_name</code>。</li>
  <li><strong>染色体名称：</strong> 必须与 FASTA 基因组文件中的染色体名称一致。</li>
  <li><strong>坐标：</strong> 起始和终止坐标必须合理。</li>
</ul>

**默认值：** 无

**示例：**

```text
--ingtf Homo_sapiens.GRCh38.108.gtf
```

**双物种分析配置**

如需进行双物种分析，`--fasta` 和 `--ingtf` 均支持使用逗号分隔提供两个物种文件。

<ul>
  <li><strong>示例：</strong> <code>--fasta human.fa,mouse.fa --ingtf human.gtf,mouse.gtf</code></li>
  <li><strong>重要提示：</strong> FASTA、GTF 与 <code>--species</code> 的顺序必须严格一一对应。</li>
</ul>

### 设置参数

#### `--genomeDir` (可选)

指定生成的参考数据库的输出目录。

<ul>
  <li><strong>功能：</strong> 所有生成的参考文件（索引、注释等）都将存储在此目录中。</li>
</ul>

<details markdown="block" open>
<summary><strong>目录结构预览</strong></summary>
<pre>
genomeDir/
├── fasta/
│   └── genome.fa          # 处理后的基因组序列文件
├── genes/
│   └── genes.gtf          # 处理后的基因注释文件
├── star/
│   ├── SA                 # STAR 索引文件
│   ├── SAindex            # STAR 索引核心文件
│   ├── chrLength.txt      # 染色体长度信息
│   ├── chrName.txt        # 染色体名称信息
│   ├── chrNameLength.txt  # 染色体名称和长度
│   ├── chrStart.txt       # 染色体起始位置
│   ├── Genome             # 基因组序列压缩文件
│   ├── genomeParameters.txt # 基因组参数配置
│   ├── Log.out            # STAR 索引构建日志
│   ├── sjdbInfo.txt       # 剪切位点数据库信息
│   ├── sjdbList.fromGTF.out.tab # GTF提取的剪切位点
│   ├── sjdbList.out.tab   # 所有剪切位点列表
│   └── mtgene.list        # 线粒体基因列表
└── ref.json               # 数据库配置和元信息文件
</pre>
</details>

**默认值：** `./` (当前目录)

**示例：**

```text
dnbc4tools rna mkref --fasta genome.fa --ingtf genes.gtf --genomeDir /database/scRNA/GRCh38
```

#### `--species` (可选)

物种标识不得包含路径分隔符、空白或保留的 `_and_`。

为参考数据库指定一个或多个物种名称。

<ul>
  <li><strong>功能：</strong> 该名称会记录在配置文件中，用于后续分析中的物种识别、基因注释和细胞注释。</li>
</ul>

<details markdown="block" open>
<summary><strong>双物种分析配置</strong></summary>
<ul>
  <li><strong>命名格式：</strong> 使用逗号分隔多个物种名称 (例如: <code>hg38,mm10</code>)。</li>
  <li><strong>顺序要求：</strong> 必须与 <code>--fasta</code> 和 <code>--ingtf</code> 文件顺序严格一致。</li>
  <li><strong>自动处理：</strong> 流程会自动为基因添加物种前缀 (如 <code>hg38_GENE1</code>)，并在结果中分离统计信息。</li>
</ul>
</details>

<details markdown="block" open>
<summary><strong>细胞注释支持</strong></summary>

为特定物种提供此参数，可启用下游的自动细胞类型注释功能。

<ul>
  <li><strong>支持：</strong> <code>Homo_sapiens</code> (或 <code>hg38</code>), <code>Mus_musculus</code> (或 <code>mm10</code>)。</li>
  <li><strong>不支持：</strong> 其他物种不支持细胞注释。</li>
</ul>
</details>

**默认值：** `undefined`

**示例：**

```text
# 单物种
--species Homo_sapiens
```

```text
# 双物种 (人+鼠)
--species hg38,mm10
```

#### `--threads` (可选)

设置STAR 索引构建过程中可使用的 CPU 线程数。

<ul>
  <li><strong>性能影响：</strong> 增加线程数通常可缩短索引构建时间，实际效果受计算资源和磁盘 I/O 影响。</li>
  <li><strong>资源平衡：</strong> 需要注意平衡线程数与可用内存（RAM）的关系，过多的线程可能会导致内存不足。</li>
</ul>

**默认值：** `10`

**示例：**

```text
--threads 16
```

### 高级设置参数

#### `--chrM` (可选)

指定线粒体染色体的名称。

<ul>
  <li><strong>功能：</strong> 用于展示细胞质量情况。线粒体基因表达过高通常表示细胞应激或死亡状态。</li>
  <li><strong>自动检测：</strong> 默认会从常见名称（如 <code>chrM</code>, <code>MT</code>）中自动识别。</li>
</ul>

**默认值：** `auto`

**示例：**

```text
# 如果线粒体染色体名称为"mitochondrion"
dnbc4tools rna mkref --fasta genome.fa --ingtf genes.gtf --chrM mitochondrion
```

#### `--limitram` (可选)

限制STAR基因组索引生成过程中的最大内存使用量（以GB为单位）。

<ul>
  <li><strong>功能：</strong> 该参数控制STAR构建基因组索引时的内存占用，索引的内存配置会直接影响后续 <code>rna run</code> 分析时的内存使用量和运行速度。</li>
  <li><strong>影响：</strong> 较大的内存限制可以生成更高性能的索引，从而加快 RNA 分析速度，但会增加内存消耗；较小的内存限制会降低索引性能，可能导致分析速度变慢。</li>
  <li><strong>建议：</strong> 根据系统可用内存合理设置，避免内存不足导致索引构建失败。</li>
</ul>

**默认值：** 无

**示例：**

```text
--limitram 64
```

#### `--extra-args` (高级)

直接向STAR 索引生成传递额外的命令行参数。

<ul>
  <li><strong>功能：</strong> 用于特殊需求和性能优化。</li>
  <li><strong>注意：</strong> 不当的参数设置可能导致索引构建失败或后续分析问题。</li>
</ul>

**默认值：** 无

**示例：**

```text
--extra-args "--sjdbOverhang 99 --runThreadN 20"
```

#### `--extra-args`

经校验的 STAR `genomeGenerate` 参数；不能传入仅用于比对或由流程管理的参数。

```bash
--extra-args "--sjdbOverhang 100 --genomeSAsparseD 2"
```

#### `--noindex` (标志)

如果设置此参数，将只生成配置文件而不构建基因组索引。

<ul>
  <li><strong>功能：</strong> 当索引文件已存在时，使用此参数可以跳过耗时的索引构建步骤。</li>
</ul>

**默认值：** 不设置

**示例：**

```text
# 仅生成配置文件，不构建索引
dnbc4tools rna mkref --fasta genome.fa --ingtf genes.gtf --noindex
```

**数据库构建技术说明：**

<ul>
  <li>针对具有众多且不同染色体大小的基因组，数据库构建会自动确定 <code>genomeSAindexNbases</code> 和 <code>genomeChrBinNbits</code> 的优化值。</li>
  <li>数据库构建完成后，会在数据库目录中生成 <code>ref.json</code> 文件记录关键配置信息。</li>
  <li>双物种分析会自动为每个基因添加物种前缀（如 <code>hg38_GENE1</code>、<code>mm10_GENE2</code>），以区分不同物种基因。</li>
  <li>构建参数和版本信息会记录在 <code>ref.json</code> 中，确保分析可重现。</li>
</ul>

**单物种 ref.json 文件示例：**

```json
{
  "chrmt": "chrM",
  "genome": "/database/scRNA/Homo_sapiens/fasta/genome.fa",
  "genomeDir": "/database/scRNA/Homo_sapiens/star",
  "gtf": "/database/scRNA/Homo_sapiens/genes/genes.gtf",
  "input_fasta_files": [
    "genome.fa"
  ],
  "input_gtf_files": [
    "genes.gtf"
  ],
  "mtgenes": "/database/scRNA/Homo_sapiens/star/mtgene.list",
  "species": "Homo_sapiens",
  "version": "3.2"
}
```

**双物种 ref.json 文件示例：**

```json
{
  "chrmt": "hg38_chrM,mm10_chrM",
  "genome": "/database/scRNA/hg38_and_mm10/fasta/genome.fa",
  "genomeDir": "/database/scRNA/hg38_and_mm10/star",
  "gtf": "/database/scRNA/hg38_and_mm10/genes/genes.gtf",
  "input_fasta_files": [
    "hg38_genome.fa",
    "mm10_genome.fa"
  ],
  "input_gtf_files": [
    "hg38_genes.gtf",
    "mm10_genes.gtf"
  ],
  "mtgenes": "/database/scRNA/hg38_and_mm10/star/mtgene.list",
  "species": "hg38_and_mm10",
  "version": "3.2"
}
```

**性能优化建议：**

<ul>
  <li>常用基因组（如人类、小鼠）建议预先构建索引并在多个项目中复用。</li>
  <li>双物种索引构建耗时较长，建议在计算资源充足时执行。</li>
  <li>建议定期检查 Ensembl 等数据库更新，及时同步参考基因组与注释文件。</li>
</ul>

## 多样本操作 (multi) <a id="多样本操作-multi"></a>

此命令只生成脚本，不启动分析。清单用 TAB 分成三列：样本名、`cDNA_R1;cDNA_R2`、`oligo_R1;oligo_R2`；同端多 lane 用逗号连接。脚本写入当前目录，不覆盖已有同名文件；`--outdir` 只设置脚本内的分析输出目录。成功生成后再执行脚本。

### 用法

```bash
dnbc4tools rna multi --list samples.tsv --genomeDir /reference/rna --threads 16
```

<details markdown="block" class="cli-help">
<summary>查看完整命令行帮助</summary>

```shell
$ dnbc4tools rna multi --help
dnbc4tools 3.2

Process multiple RNA-seq samples.

Usage: dnbc4tools rna multi [OPTIONS]

options:
  --help             show this help message and exit

Input Files:
  --list <FILE>      Tab-separated sample list: sample name <TAB> cDNA R1;R2 <TAB> oligo R1;R2. Multiple FASTQ files
                     within one end are comma-separated. Generates one shell script per sample in the current working
                     directory; run the generated scripts to start analysis.

Basic Settings:
  --genomeDir <DIR>  Reference genome directory path containing required reference files.
  --outdir <DIR>     Analysis output directory written into each generated script [default: current directory] (e.g.,
                     `./output`). Scripts are written to the current working directory.
  --threads <INT>    Number of CPU threads written into each generated analysis script.

Analysis Settings:
  --end5             Enable 5'-end single-cell transcriptome analysis.
```

</details>

### 必需参数

#### `--list` (必需)

指定包含多个样本信息的列表文件路径。

<ul>
  <li><strong>文件格式：</strong> 使用制表符(<code>\t</code>)分隔的文本文件，建议UTF-8编码。</li>
  <li><strong>列结构：</strong>
      <ol>
          <li>样本名称</li>
          <li>cDNA 数据路径</li>
          <li>oligo 数据路径</li>
      </ol>
  </li>
</ul>

<details markdown="block" open>
<summary><strong>路径格式规则</strong></summary>
<ul>
  <li><strong>多个FASTQ 文件：</strong> 同一文库的多个FASTQ 文件路径使用逗号(<code>,</code>)分隔。</li>
  <li><strong>R1 和 R2 文件：</strong> 配对的 R1 和 R2 文件路径使用分号 (<code>;</code>) 分隔。</li>
  <li><strong>路径类型：</strong> 支持绝对路径和相对路径。</li>
</ul>
</details>

**默认值：** 无

<details markdown="block" open>
<summary><strong>示例：</strong></summary>

```text
# 示例1: SampleA, cDNA 和 oligo各有 1 对 R1/R2 文件
SampleA	/path/to/A_cDNA_R1.fq.gz;/path/to/A_cDNA_R2.fq.gz	/path/to/A_oligo_R1.fq.gz;/path/to/A_oligo_R2.fq.gz
```

```text
# 示例2: SampleB, cDNA 有 2 对 R1/R2 文件，oligo 有 1 对 R1/R2 文件
SampleB	/path/to/B_cDNA_L01_R1.fq.gz,/path/to/B_cDNA_L02_R1.fq.gz;/path/to/B_cDNA_L01_R2.fq.gz,/path/to/B_cDNA_L02_R2.fq.gz	/path/to/B_oligo_R1.fq.gz;/path/to/B_oligo_R2.fq.gz
```

</details>

**参数继承说明**

对于其他分析参数设置，请参考 [`dnbc4tools rna run`](#主分析流程-run) 命令的相应参数。所有样本应使用相同的参考数据库。

**执行行为说明**

`dnbc4tools rna multi` 会为每个样本生成对应的执行脚本（如 `sample1.sh`），便于批量提交与复用；默认不会自动串行执行所有样本分析。

## 相关文档

<table>
<thead>
<tr>
<th width="35%">资源</th>
<th width="65%">描述</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="../pipeline/scRNA.html">scRNA 流程文档</a></td>
<td>单细胞 RNA 分析流程指南</td>
</tr>
<tr>
<td><a href="../outs/scRNA.html">scRNA 输出文档</a></td>
<td>输出文件详细解读</td>
</tr>
</tbody>
</table>
