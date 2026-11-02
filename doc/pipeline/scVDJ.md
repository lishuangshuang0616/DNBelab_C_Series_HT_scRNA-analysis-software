# DNBelab C Series HT scVDJ 分析流程

单细胞 VDJ 测序数据分析说明

## 概述 <a id="概述"></a>

本文档详细介绍了使用 dnbc4tools 进行单细胞 VDJ 测序数据分析的完整流程。

**工作流程**：5' 端转录组分析 → VDJ 文库处理 → 序列组装注释 → 细胞过滤 → 克隆型分析 → 分析报告

![scVDJ 分析流程概览](../images/scVDJ_pipeline.png)

> **使用说明**：`$dnbc4tools` 代表可执行程序路径，需替换为您的实际安装路径。本文示例使用换行符 `\` 分隔命令以提高可读性，实际分析时可写为单行。

## 文件准备 <a id="文件准备"></a>

### 5' 端转录组分析

转录组分析请参考 `dnbc4tools rna run`。5' 端转录组分析需在单细胞 RNA 主流程基础上添加参数 `--end5`。

为单个样本生成表达矩阵，以下是一个示例步骤或脚本模板：

```shell
$dnbc4tools rna run \
	--name sample_5rna \
	--cDNAfastq1 /data/sample_cDNA_R1.fastq.gz \
	--cDNAfastq2 /data/sample_cDNA_R2.fastq.gz \
	--oligofastq1 /data/sample_oligo1_1.fq.gz,/data/sample_oligo2_1.fq.gz \
	--oligofastq2 /data/sample_oligo1_2.fq.gz,/data/sample_oligo2_2.fq.gz \
	--genomeDir /opt/database/Homo_sapiens \
	--threads 30 \
	--end5
```

> **注意**：5' 端转录组分析是 VDJ 分析的前提，需要先完成此步骤才能进行后续分析。

### VDJ 分析所需文件

分析需要以下文件：

<table>
  <thead>
    <tr>
      <th>文件类型</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>FASTQ 文件</b></td>
      <td>VDJ 文库测序数据，包含 TCR 或 BCR 序列信息</td>
    </tr>
    <tr>
      <td><b>singlecell.csv 文件</b></td>
      <td>5' 端转录组分析结果中的细胞信息文件</td>
    </tr>
  </tbody>
</table>

分析需要 5' 端转录组分析结果目录中的 `singlecell.csv` 文件。该文件包含 `cell` 和 `barcode` 列的合并信息，以及 `is_cell_barcode` 列（1 表示细胞，0 表示非细胞），用于鉴定有效的细胞。

> **注意**：确保 `singlecell.csv` 文件路径正确，该文件是连接转录组与 VDJ 分析的关键。

参考示例文件内容：

```csv
cell,reads,gene,umi,is_cell_barcode,barcode
CELL1118_N3,1485813,5693,57580,1,AGATCGCCTACGATCACGAT;GGTGGAAGGTGAGAGAAGCG;GTAGTTCTAGGCTAAGTACT
CELL1651_N3,805447,4881,32131,1,ATCTCAAGCCCACCGTGTGT;CATCAATTAAGTGATCGCAT;CCTAACTGAGGAACGCTTAG
CELL4_N3,820269,5649,30326,1,AACACCTGATCGTTCAATAA;AATTCGAAGGTAGTCGGAAT;CACATGTTACATGTTCTATA
CELL906_N3,656624,4853,28142,1,ACGTCCGCGTGACCATGTGC;AGGAGCTCCATTGATCTTAA;CAATCCGGAGAACGTATCTG
CELL1577_N2,672637,4610,24822,1,ATATTCTCACGTAACGGATG;TAGGAACTCGGCTTAGATCT
CELL2064_N2,542608,2355,23324,1,CATAAGCACTCACCGCTAGT;GTCTCACAGTTGTTCACTAG
CELL1332_N6,580950,4702,22953,1,AGGTGTAAGCCTACCGGACC;CGCACTCACCTAACATTGTG;CTTGCCGCGCTATCAATGCA;GCCACTAGTCGACGCGGTTG;GTCAGCATGCTCTTCCACAG;TCGATATCCTCACTCTTAAC
CELL726_N4,585934,4617,22660,1,ACCTACGGCGTTACTATGTG;CGACGCTCTCGACAGTTAGG;CGGCAGAGTCTTGGCGCTTA;TCCGACCGTATCTTCATCTC
CELL4010_N1,555308,4268,22554,1,AGAGAGTCGCAGCAAGCGAC
```

## 主分析流程 <a id="主分析流程"></a>

VDJ 主分析流程结合了单细胞 VDJ 文库测序数据和对应样本的 5' 转录组分析结果，包含以下关键步骤：

1. 对数据进行过滤，利用 5' 转录组结果合并磁珠
2. 比对 VDJ 基因区域并提取对应的 reads
3. 进行从头组装并注释
4. 根据组装注释结果和 5' 转录组的细胞获取情况进行细胞过滤
5. 整合各步骤结果生成 HTML 网页报告并输出分析结果

### TCR 分析

为单个样本运行 TCR 分析，支持两种输入方式：

**方式1：目录方式（推荐）**

```shell
$dnbc4tools vdj run \
  --name sample_tcr \
  --fastqs /data/vdjt \
  --ref human \
  --chain TR \
  --beadstrans /sample_5rna/outs/singlecell.csv \
  --threads 10
```

目录结构示例：

```text
/data/vdjt/
├── sample_tcr_R1.fastq.gz
└── sample_tcr_R2.fastq.gz
```

**方式2：单独参数方式**

```shell
$dnbc4tools vdj run \
  --name sample_tcr \
  --fastq1 /data/vdjt/sample_tcr_R1.fastq.gz \
  --fastq2 /data/vdjt/sample_tcr_R2.fastq.gz \
  --ref human \
  --chain TR \
  --beadstrans /sample_5rna/outs/singlecell.csv \
  --threads 10
```

### BCR 分析

为单个样本运行 BCR 分析，支持两种输入方式：

**方式1：目录方式（推荐）**

```shell
$dnbc4tools vdj run \
  --name sample_bcr \
  --fastqs /data/vdjb \
  --ref human \
  --chain IG \
  --beadstrans /sample_5rna/outs/singlecell.csv \
  --threads 10
```

目录结构示例：

```text
/data/vdjb/
├── sample_bcr_R1.fastq.gz
└── sample_bcr_R2.fastq.gz
```

**方式2：单独参数方式**

```shell
$dnbc4tools vdj run \
  --name sample_bcr \
  --fastq1 /data/vdjb/sample_bcr_R1.fastq.gz \
  --fastq2 /data/vdjb/sample_bcr_R2.fastq.gz \
  --ref human \
  --chain IG \
  --beadstrans /sample_5rna/outs/singlecell.csv \
  --threads 10
```

输入目录要求：

- `--fastqs` 指向当前 VDJ 文库的 FASTQ 目录。
- R1/R2 配对文件需直接放在该目录下。
- 自动识别依赖文件名中的 R1/R2 标识。建议使用 `_R1`/`_R2` 或 `_R1_`/`_R2_` 命名。
- TCR 与 BCR 数据应分别运行，不要混放到同一输入目录中。

### 运行过程

在对暗反应自动检测后，软件开始运行分析，以下是一个示例：

```shell
──────────────────────────── Parsed FASTQ Inputs — 2025-11-12 15:13:16 ─────────────────────────────
┌───────┬──────────────────────────────────────────────────────────────────────────────────────────┐
│ Type  │ Path                                                                                     │
├───────┼──────────────────────────────────────────────────────────────────────────────────────────┤
│ Read 1 │ /data/vdjt/sample_tcr_R1.fastq.gz                                                        │
│ Read 2 │ /data/vdjt/sample_tcr_R2.fastq.gz                                                        │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────

──────────────────────────── Chemistry Detection — 2025-11-12 15:13:20 ─────────────────────────────
┌─────────────────────────────────┬────────────────────────────────────────────────────────────────┐
│ Type                            │ Result                                                         │
├─────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Read 1                           │ darkreaction                                                   │
└─────────────────────────────────┴────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────

 2025-11-12 15:13:20 Starting VDJ library filtering...
...done

 2025-11-12 15:15:46 Preparing input data for VDJ assembly...
...done

 2025-11-12 15:18:14 Performing VDJ sequence assembly and gene segment annotation...
...done

 2025-11-12 16:03:18 Performing cell calling for VDJ data...
...done

 2025-11-12 16:04:02 Generating VDJ clonotype analysis...
...done

 2025-11-12 16:05:02 Converting VDJ results from cellbarcode to cell ID...
...done

 2025-11-12 16:05:15 Generating analysis report and summary statistics...
...done

 2025-11-12 16:05:44 Analysis Finished. Elapsed Time: 0:52:24
```

成功的运行会以 `Analysis Finished` 结束。

## 结果解析 <a id="结果解析"></a>

分析完成后，将生成 `outs`（结果输出）和 `logs`（日志）目录，其中 `outs` 目录包括：

```
.
├── airr_annotations.tsv
├── all_contig_annotations.csv
├── all_contig.fasta
├── all_contig.fasta.fai
├── *_scVDJ_IG_report.html
├── clonotypes.csv
├── consensus_annotations.csv
├── consensus.fasta
├── consensus.fasta.fai
├── filtered_contig_annotations.csv
├── filtered_contig.fasta
├── filtered_contig.fasta.fai
└── metrics_summary.xls
```

## 相关文档

| 资源 | 描述 |
| :--- | :--- |
| [输出文件使用方法](../io.md) | 了解输出文件结构和格式 |
| [分析参数设置](../parameter/scVDJ.md) | 查看完整参数选项和说明 |
| [输出文件解释](../outs/scVDJ.md) | 详细解读分析结果文件 |

## 常见问题

本节将根据常见使用问题持续补充。当前版本请优先参考运行日志、参数说明和输出文件说明进行排查。
