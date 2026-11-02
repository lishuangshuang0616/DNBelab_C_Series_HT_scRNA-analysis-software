# scVDJ 分析参数

DNBelab C Series HT scVDJ 参数配置说明

## 主分析流程 (run) <a id="主分析流程-run"></a>

### 用法 <a id="usage"></a>

```bash
dnbc4tools vdj run \
  --name sample1 --fastqs /data/tcr \
  --ref human --chain TR \
  --beadstrans /results/rna/outs/singlecell.csv \
  --threads 16
```

<details markdown="block" class="cli-help">
<summary>查看完整命令行帮助</summary>

```shell
$ dnbc4tools vdj run --help
dnbc4tools 3.2

Process a single-cell V(D)J sample.

Usage: dnbc4tools vdj run [OPTIONS]

options:
  --help                       show this help message and exit

Input Files:
  Choose one input method: either `--fastqs` (directory input) or individual FASTQ files (`--fastq1` and
  `--fastq2`).

  --fastqs <DIR>               Input directory path containing paired-end FASTQ files (e.g., `./fastq_dir`).
  --fastq1 <FILE>              Read 1 FASTQ file path(s). Wildcards and comma-separated lists are supported (e.g.,
                               `sample1_L01_R1.fastq.gz,sample1_L02_R1.fastq.gz`).
  --fastq2 <FILE>              Read 2 FASTQ file path(s). Must match the order provided to `--fastq1` (e.g.,
                               `sample1_L01_R2.fastq.gz,sample1_L02_R2.fastq.gz`).

Basic Settings:
  --name <STR>                 Unique identifier for the sample. Used for naming output files and reports (e.g.,
                               `sample1`).
  --ref <STR>                  Reference database: `human`/`mouse`, or a custom reference directory path containing
                               `reference.json` (e.g., `human` or `./custom_vdj_ref`).
  --chain <STR>                VDJ receptor type: `IG` (BCR) or `TR` (TCR) (e.g., `TR`).
  --outdir <DIR>               Output directory path for results and reports [default: current directory] (e.g.,
                               `./output`).
  --threads <INT>              Number of CPU threads for parallel processing [default: all available cores].
  --beadstrans <FILE>          RNA-analysis `singlecell.csv` file path for cell filtering and bead merging info (e.g.,
                               `./singlecell.csv`).

Library Settings:
  --darkreaction <STR>         Dark cycle setting for VDJ library. Supported values: `R1`, `unset` (e.g., `R1`).
  --customize <STR>            Custom read structure string. Format: `<type>,<read>:<start>-<end>` joined by `;`.
                               (e.g., `"cb,R1:7-16;cb,R1:23-32;umi,R1:38-47;R1,R1:61-150;R2,R2:1-150"`).
  --enrichment_primers <FILE>  Custom inner enrichment primers file path (one primer sequence per line) (e.g.,
                               `./inner_primers.txt`).

Analysis Settings:
  --keep_all_cells             Retain all cells in analysis without RNA-based filtering.
  --r2_only                    Use only Read 2 sequences for VDJ assembly.
  --sample_read_pairs <INT>    Subsample the specified number of read pairs from input FASTQ file(s) (e.g.,
                               `1000000`).
```

</details>

### 必需参数

> **成功分析必须指定的基本参数**

#### `--name` (必需)

为本次分析提供一个唯一的样本名称。

<ul>
  <li><strong>功能：</strong> 该名称将用作所有输出文件和HTML报告的前缀。</li>
  <li><strong>显示：</strong> 在最终的网页报告中，此名称将作为样本ID显示。</li>
</ul>

**默认值：** 无

**示例：**

```text
--name sample_VDJ_001
```

#### `--ref` (必需)

指定VDJ 分析使用的参考数据库。

<ul>
    <li><strong>功能：</strong> 指定VDJ 分析使用的参考数据库。</li>
    <li><strong>内置支持：</strong> 软件自带人类(<code>human</code>)和小鼠(<code>mouse</code>)的参考数据库。</li>
    <li><strong>自定义支持：</strong> 可提供包含<code>reference.json</code>的自定义参考目录路径。</li>
</ul>

**默认值：** 无

**示例：**

```text
# 使用内置的人类参考数据库
--ref human
```

```text
# 使用自定义参考数据库
--ref ./custom_vdj_ref
```

#### `--chain` (必需)

指定分析的免疫受体类型。

<ul>
    <li><strong>核心功能：</strong> 指定分析的免疫受体类型，直接影响V(D)J基因段的识别和重组分析。</li>
    <li><strong><code>TR</code>:</strong> T-cell Receptor (T细胞受体)，用于T细胞研究。</li>
    <li><strong><code>IG</code>:</strong> Immunoglobulin (免疫球蛋白)，用于B细胞研究。</li>
</ul>

**默认值：** 无

**示例：**

```text
# 分析T细胞受体
--chain TR
```

```text
# 分析B细胞受体
--chain IG
```

### 输入文件参数

**选择一种输入方式：基于目录或单独指定文件**

#### `--fastqs` (方式1)

指定包含所有 FASTQ 文件的目录路径。

<ul>
  <li><strong>功能：</strong> 流程会自动检测此目录下的配对文件（R1/R2）。</li>
  <li><strong>目录要求（VDJ）：</strong> <code>--fastqs</code> 指向一个仅包含当前 VDJ 文库 FASTQ 的目录，目录内直接放置 R1/R2 文件。</li>
  <li><strong>命名规则：</strong> 自动检测依赖文件名中的 R1/R2 标识，支持 <code>_R1_</code>、<code>_R1</code>、<code>_1</code>、<code>_read1</code> 与对应的 <code>_R2_</code>、<code>_R2</code>、<code>_2</code>、<code>_read2</code>；支持 <code>.fastq.gz</code>、<code>.fq.gz</code>、<code>.fastq</code>、<code>.fq</code>。</li>
  <li><strong>注意：</strong> 这是一个便捷选项，不能与 <code>--fastq1</code> / <code>--fastq2</code> 同时使用。</li>
</ul>

**推荐目录结构：**

```text
VDJ_fastq_dir/
├── sample_VDJ_L01_R1.fastq.gz
├── sample_VDJ_L01_R2.fastq.gz
├── sample_VDJ_L02_R1.fastq.gz
└── sample_VDJ_L02_R2.fastq.gz
```

**默认值：** 无

**示例：**

```text
--fastqs ./VDJ_fastq_dir
```

#### `--fastq1` (方式2A)

单独指定一个或多个 VDJ 文库的 Read 1 FASTQ 文件。

<ul>
  <li><strong>支持：</strong> 可以使用通配符 (<code>*</code>) 匹配文件，使用逗号分隔来指定多个文件。</li>
  <li><strong>要求：</strong> 必须与 <code>--fastq2</code> 参数配对使用，且文件顺序必须完全匹配。</li>
</ul>

**默认值：** 无

**示例：**

```text
--fastq1 sample1_L01_R1.fastq.gz,sample1_L02_R1.fastq.gz
```

#### `--fastq2` (方式2B)

单独指定一个或多个 VDJ 文库的 Read 2 FASTQ 文件。

<ul>
  <li><strong>支持：</strong> 可以使用通配符 (<code>*</code>) 匹配文件，使用逗号分隔来指定多个文件。</li>
  <li><strong>要求：</strong> 必须与 <code>--fastq1</code> 参数配对使用，且文件顺序必须完全匹配。</li>
</ul>

**默认值：** 无

**示例：**

```text
--fastq2 sample1_L01_R2.fastq.gz,sample1_L02_R2.fastq.gz
```

**输入方式选择：**

<ul>
  <li><strong>方式1：</strong> 使用 <code>--fastqs</code> 指定包含配对 FASTQ 文件的目录。</li>
  <li><strong>方式2：</strong> 使用 <code>--fastq1</code> 和 <code>--fastq2</code> 分别指定 R1 和 R2 文件。</li>
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
--outdir ./VDJ_analysis_output
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
--threads 16
```

#### `--beadstrans` (可选)

支持普通 RNA 的完整 `singlecell.csv` 与 C6 的 `singlecell.csv.gz`。压缩输入需要配套新版原生 VDJ 预处理工具。

提供来自scRNA 分析的`singlecell.csv`文件，用于细胞过滤和信息整合。

<ul>
  <li><strong>功能：</strong> 通过整合5' scRNA 分析结果，实现磁珠合并与细胞过滤，进而建立单细胞 RNA表达谱与VDJ 重组序列的精确对应关系。</li>
  <li><strong>要求：</strong> 使用此功能需提供同一样本的5' scRNA 分析输出文件 <code>singlecell.csv</code>。</li>
  <li><strong>注意：</strong> 若未指定此参数，将跳过磁珠合并步骤，并默认保留所有检测到的细胞（等同于启用<code>--keep_all_cells</code>）。</li>
</ul>

**默认值：** 无

**示例：**

```text
--beadstrans ./RNA_analysis_output/outs/singlecell.csv
```

### 文库设置参数

#### `--darkreaction` (可选)

支持 `auto`、`R1`、`unset`，不支持 `R1R2`。

配置VDJ 文库的暗循环（dark cycle）设置。

<ul>
  <li><strong>功能：</strong> 指导软件正确解析因测序化学产生的暗反应周期。</li>
  <li><strong>自动检测 (auto)：</strong> 默认设置。软件通过分析序列结构自动识别。<strong>建议首次分析时使用。</strong></li>
  <li><strong>手动设置：</strong> 可选值为 <code>R1</code> (Read 1 有暗循环) 或 <code>unset</code> (无暗循环)。</li>
</ul>

**默认值：** `auto`

**示例：**

```text
# Read 1存在暗循环
--darkreaction R1
```

**重要提示：**不正确的设置可能导致细胞条形码识别失败。仅在了解文库结构或自动检测失败时手动指定。

#### `--customize` (高级)

为非标准文库精确定义条形码（barcode）、UMI和有效序列（read）的提取结构。此参数为高级功能，会覆盖 `--darkreaction` 的设置。

<ul>
  <li><strong>语法格式：</strong> <code>"&lt;type&gt;,&lt;read&gt;:&lt;start&gt;-&lt;end&gt;"</code>，多个段落以分号(<code>;</code>)分隔。
    <ul>
      <li><strong>参数类型 (type)：</strong> <code>cb</code> (细胞条形码), <code>umi</code> (UMI), <code>R1</code>/<code>R2</code> (有效序列)。</li>
    </ul>
  </li>
  <li><strong>注意事项：</strong>
      <ul>
        <li>整个参数字符串必须用引号包裹。</li>
        <li>坐标为1-based，且不能超过读长。</li>
      </ul>
  </li>
</ul>

**示例：**

```text
# 标准VDJ 文库配置示例
--customize "cb,R1:1-10;cb,R1:11-20;umi,R1:21-30;R1,R1:31-120;R2,R2:1-150"
```

**风险提示：**错误的自定义配置可能导致数据丢失或分析失败，建议仅在标准配置无法满足需求时使用。

#### `--enrichment_primers` (可选)

指定用于VDJ区域特异性扩增的内部富集引物文件。

<ul>
  <li><strong>应用：</strong> 针对非人/鼠物种或使用自定义引物设计的VDJ 文库。</li>
  <li><strong>格式：</strong> 纯文本文件，每行包含一个引物序列。</li>
  <li><strong>要求：</strong> 使用自定义参考数据库时必须提供此参数。</li>
</ul>

**默认值：** 无

**文件内容示例：**

```text
GTCCTCGGTGGCCTCCACGTG
AGCACCTGGGGCCTCGGCCAC
CCTGGACTCCTGGGCCCCAG
```

### 分析设置参数

#### `--keep_all_cells` (标志)

启用此参数以保留所有检测到的细胞，不进行基于RNA数据的过滤。

<ul>
  <li><strong>功能：</strong> 当不提供 <code>--beadstrans</code> 参数时，此行为会自动启用。适用于独立的 VDJ 分析或需要最大化细胞回收的场景。</li>
</ul>

**默认值：** 不设置此参数（但若无`--beadstrans`则自动启用）

#### `--r2_only` (标志)

启用此参数以仅使用Read 2序列进行VDJ组装。

<ul>
  <li><strong>功能：</strong> 适用于Read 1仅包含条形码和UMI信息的文库设计。</li>
  <li><strong>注意：</strong> 软件无法自动检测此情况，需要根据文库设计手动指定。</li>
</ul>

**默认值：** 不设置此参数

#### `--sample_read_pairs` (可选)

从输入的 FASTQ 文件中提取指定数量的读段对进行分析。

<ul>
  <li><strong>功能：</strong> 用于在完整分析前对大数据集进行快速测试，或在资源有限时进行降采样分析。</li>
  <li><strong>注意：</strong> 子采样可能影响低频克隆型的检测，正式分析建议使用全部数据。</li>
</ul>

**默认值：** 无 (使用全部数据)

**示例：**

```text
--sample_read_pairs 10000000
```

## 相关文档

| 资源 | 描述 |
| :--- | :--- |
| [scVDJ 流程文档](../pipeline/scVDJ.md) | 单细胞 VDJ 分析流程指南 |
| [scVDJ 输出文档](../outs/scVDJ.md) | 输出文件详细解读 |
