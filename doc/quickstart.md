# 快速开始指南

本指南提供 DNBelab C Series™ 单细胞分析套件（dnbc4tools）的端到端快速上手流程，涵盖环境准备、参考库构建、单组学分析、多组学统筹调度、C6 多样本单细胞 RNA 分析以及批量分析脚本生成。

---

## 选择运行方式 <a id="choose-workflow"></a>

根据您的实验设计与建库类型，选择对应的命令入口：

| 分析类型 | 命令入口 | 适用场景与说明 |
| :--- | :--- | :--- |
| [**单细胞 RNA 分析**](#single-cell-rna-analysis) | `dnbc4tools rna run` | 单样本标准转录组定量、EmptyDrops 细胞识别与聚类 |
| [**单细胞 ATAC 分析**](#single-cell-atac-analysis) | `dnbc4tools atac run` | 单样本染色质开放区分析、Peak Calling 与质控 |
| [**单细胞 V(D)J 分析**](#single-cell-vdj-analysis) | `dnbc4tools vdj run` | TCR / BCR 免疫组库从头组装、注释与全长克隆型分析 |
| [**多组学联合分析**](#integrated-multi-omics-analysis) | `dnbc4tools multi run --csv multi.csv` | RNA + ATAC + VDJ 多组学统筹调度与跨组学交互报告 |
| [**C6 多样本 RNA 分析**](#c6-multi-sample-analysis) | `dnbc4tools multi run --csv sample.config.csv` | 基于 Sample Barcode 混合建库解复用与逐样本专属分析交付 |
| [**批量分析脚本生成**](#batch-script-generation) | `dnbc4tools <rna/atac> multi` | 批量生成独立样本分析脚本，后续由调度系统排队执行 |

---

## 使用前准备 <a id="prerequisites"></a>

<div style="background-color: #e7f3fe; border-left: 6px solid #2196F3; padding: 15px; margin: 1.5em 0; border-radius: 4px;">
<strong>开始前请确认：</strong>
<ul style="margin-bottom: 0;">
  <li>已完成软件安装与功能验证，参见 <a href="./installation.md">软件安装指南</a>。</li>
  <li>以下示例命令中的 <code>$dnbc4tools</code> 需替换为实际安装路径（例如 <code>/opt/software/dnbc4tools3.2/dnbc4tools</code>）。</li>
  <li>反斜杠 <code>\</code> 仅用于多行排版以提升可读性，在终端中可写为单行执行。</li>
</ul>
</div>

### `--fastqs` 目录自动识别命名规则 <a id="file-naming-conventions"></a>

当使用 `--fastqs <dir>` 目录输入方式时，流程会自动扫描目录下所有匹配文件并按命名模式自动配对双端测序数据：

| 测序端 | 识别模式（Pattern） | 匹配示例 |
| :--- | :--- | :--- |
| **Read 1 (R1)** | 包含 `_R1_`、`_R1`、`_1` 或 `_read1` | `sample_R1.fastq.gz`、`sample_1.fq.gz`、`sample_R1_001.fastq.gz` |
| **Read 2 (R2)** | 包含 `_R2_`、`_R2`、`_2` 或 `_read2` | `sample_R2.fastq.gz`、`sample_2.fq.gz`、`sample_R2_001.fastq.gz` |

* **支持扩展名**：`.fastq.gz`、`.fq.gz`、`.fastq`、`.fq`
* **逐项指定文件不受命名限制**：若通过独立参数（如 `--fastq1/--fastq2`，或 RNA 的 `--cDNAfastq1/2`、`--oligofastq1/2`）逐项显式指定，文件名不受上述规则限制，但双端文件列表顺序须严格一一对应。

---

## 单细胞 RNA 分析 <a id="single-cell-rna-analysis"></a>

适用于常规单样本 3′ 或 5′ 单细胞转录组基因表达定量与聚类分析。

### 第一步：构建参考数据库

以常用物种的人、小鼠及双物种混合为例：

**人（Human, GRCh38）**
```bash
# 1. 下载 GENCODE 注释文件与基因组 FASTA
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/GRCh38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/gencode.v32.primary_assembly.annotation.gtf.gz

# 2. 解压文件
gzip -d GRCh38.primary_assembly.genome.fa.gz
gzip -d gencode.v32.primary_assembly.annotation.gtf.gz

# 3. 过滤 GTF 并构建 STAR 参考库
$dnbc4tools tools mkgtf --ingtf gencode.v32.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools rna mkref --ingtf genes.filtered.gtf --fasta GRCh38.primary_assembly.genome.fa --threads 10 --species Homo_sapiens
```

**小鼠（Mouse, GRCm38）**
```bash
# 1. 下载注释与基因组 FASTA
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/GRCm38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/gencode.vM23.primary_assembly.annotation.gtf.gz

# 2. 解压文件
gzip -d GRCm38.primary_assembly.genome.fa.gz
gzip -d gencode.vM23.primary_assembly.annotation.gtf.gz

# 3. 过滤 GTF 并构建 STAR 参考库
$dnbc4tools tools mkgtf --ingtf gencode.vM23.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools rna mkref --ingtf genes.filtered.gtf --fasta GRCm38.primary_assembly.genome.fa --threads 10 --species Mus_musculus
```

**人-鼠双物种参考库**
```bash
# 准备好两物种 FASTA 与 GTF 后联合构建
$dnbc4tools rna mkref \
    --fasta GRCh38.primary_assembly.genome.fa,GRCm38.primary_assembly.genome.fa \
    --ingtf hg38/genes.filtered.gtf,mm10/genes.filtered.gtf \
    --species hg38,mm10 \
    --threads 10
```

### 第二步：运行 RNA 分析

推荐将测序文件规整放置于包含 `cDNA/` 与 `oligo/` 子目录的路径下，流程将自动识别并配对双端数据：

```text
/test/data/rna_fastqs/          # --fastqs 所指定的根目录
├── cDNA/                       # 存放转录组 cDNA 测序数据
│   ├── sample_cDNA_R1.fastq.gz
│   └── sample_cDNA_R2.fastq.gz
└── oligo/                      # 存放微球/条形码 Oligo 测序数据
    ├── sample_oligo_R1.fastq.gz
    └── sample_oligo_R2.fastq.gz
```

**方式一：目录输入方式（推荐）**

```bash
$dnbc4tools rna run \
    --fastqs /test/data/rna_fastqs \
    --genomeDir /database/scRNA/Homo_sapiens \
    --name test_rna \
    --threads 30
```

**方式二：独立显式指定 FASTQ 文件**

当测序文件未按 `cDNA/` 与 `oligo/` 归类归档，或跨多个存储路径时，可使用独立参数逐项指定输入文件（多个文件支持逗号 `,` 分隔）：

```bash
$dnbc4tools rna run \
    --cDNAfastq1 /test/data/cDNA/sample_R1.fastq.gz \
    --cDNAfastq2 /test/data/cDNA/sample_R2.fastq.gz \
    --oligofastq1 /test/data/oligo/sample_oligo_R1.fastq.gz \
    --oligofastq2 /test/data/oligo/sample_oligo_R2.fastq.gz \
    --genomeDir /database/scRNA/Homo_sapiens \
    --name test_rna \
    --threads 30
```

---

## 单细胞 ATAC 分析 <a id="single-cell-atac-analysis"></a>

适用于单细胞染色质开放性分析、Peak Calling 与转录因子模体推断。

### 第一步：构建 ATAC 参考库

**人（Human, GRCh38）**
```bash
# 1. 下载 GENCODE 注释文件与基因组 FASTA
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/GRCh38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/gencode.v32.primary_assembly.annotation.gtf.gz

# 2. 解压文件
gzip -d GRCh38.primary_assembly.genome.fa.gz
gzip -d gencode.v32.primary_assembly.annotation.gtf.gz

# 3. 过滤 GTF 并构建 Chromap 参考库
$dnbc4tools tools mkgtf --ingtf gencode.v32.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools atac mkref --fasta GRCh38.primary_assembly.genome.fa --ingtf genes.filtered.gtf --species Homo_sapiens --prefix chr
```

**小鼠（Mouse, GRCm38）**
```bash
# 1. 下载注释与基因组 FASTA
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/GRCm38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/gencode.vM23.primary_assembly.annotation.gtf.gz

# 2. 解压文件
gzip -d GRCm38.primary_assembly.genome.fa.gz
gzip -d gencode.vM23.primary_assembly.annotation.gtf.gz

# 3. 过滤 GTF 并构建 Chromap 参考库
$dnbc4tools tools mkgtf --ingtf gencode.vM23.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools atac mkref --fasta GRCm38.primary_assembly.genome.fa --ingtf genes.filtered.gtf --species Mus_musculus --prefix chr
```

**人-鼠双物种参考库**
```bash
# 准备好两物种 FASTA 与过滤后的 GTF 后联合构建（双物种不支持 --prefix 参数）
$dnbc4tools atac mkref \
    --fasta GRCh38.primary_assembly.genome.fa,GRCm38.primary_assembly.genome.fa \
    --ingtf hg38/genes.filtered.gtf,mm10/genes.filtered.gtf \
    --species hg38,mm10
```

### 第二步：运行 ATAC 分析

测序数据支持放置于指定目录或显式指定成对 FASTQ：

```text
/test/data/atac_fastqs/          # --fastqs 所指定的根目录
├── sample_R1.fastq.gz
└── sample_R2.fastq.gz
```

**方式一：目录输入方式（推荐）**

```bash
$dnbc4tools atac run \
    --fastqs /test/data/atac_fastqs \
    --genomeDir /database/scATAC/Homo_sapiens \
    --name test_atac \
    --threads 10
```

**方式二：独立显式指定 FASTQ 文件**

```bash
$dnbc4tools atac run \
    --fastq1 /test/data/sample_R1.fastq.gz \
    --fastq2 /test/data/sample_R2.fastq.gz \
    --genomeDir /database/scATAC/Homo_sapiens \
    --name test_atac \
    --threads 10
```

---

## 单细胞 V(D)J 分析 <a id="single-cell-vdj-analysis"></a>

适用于全长 TCR / BCR 免疫受体组库从头组装、注释与全长克隆型分析。

<div style="background-color: #fffbe6; border-left: 6px solid #ffc107; padding: 15px; margin: 1.5em 0; border-radius: 4px;">
<strong>前置依赖：</strong> VDJ 分析需配套 5′ scRNA-seq 数据。必须先运行带有 <code>--end5</code> 参数的 RNA 流程，以生成细胞与微珠对应关系表 <code>singlecell.csv</code>。
</div>

### 第一步：运行 5′ RNA 分析

```bash
$dnbc4tools rna run \
    --fastqs /test/data/rna_5p_fastqs \
    --genomeDir /database/scRNA/Homo_sapiens \
    --name test_rna_5p \
    --threads 30 \
    --end5
```

### 第二步：运行 V(D)J 分析

测序文件可规整放置于指定目录或通过参数独立显式指定：

```text
/test/data/vdj_fastqs/          # --fastqs 所指定的根目录
├── sample_R1.fastq.gz
└── sample_R2.fastq.gz
```

**方式一：目录输入方式（推荐）**

*人 TCR 分析（Human TCR）*
```bash
$dnbc4tools vdj run \
    --fastqs /test/data/tcr_fastqs \
    --beadstrans ./test_rna_5p/outs/singlecell.csv \
    --ref human \
    --name test_human_tcr \
    --threads 20 \
    --chain TR
```

*人 BCR 分析（Human BCR）*
```bash
$dnbc4tools vdj run \
    --fastqs /test/data/bcr_fastqs \
    --beadstrans ./test_rna_5p/outs/singlecell.csv \
    --ref human \
    --name test_human_bcr \
    --threads 20 \
    --chain IG
```

**方式二：独立显式指定 FASTQ 文件**

当测序文件不在同一目录或有特殊路径时，可通过 `--fastq1` 与 `--fastq2` 逐项显式输入：

*人 TCR 分析（独立文件输入）*
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data/tcr/sample_R1.fastq.gz \
    --fastq2 /test/data/tcr/sample_R2.fastq.gz \
    --beadstrans ./test_rna_5p/outs/singlecell.csv \
    --ref human \
    --name test_human_tcr \
    --threads 20 \
    --chain TR
```

*人 BCR 分析（独立文件输入）*
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data/bcr/sample_R1.fastq.gz \
    --fastq2 /test/data/bcr/sample_R2.fastq.gz \
    --beadstrans ./test_rna_5p/outs/singlecell.csv \
    --ref human \
    --name test_human_bcr \
    --threads 20 \
    --chain IG
```

<details markdown="block">
<summary>点击展开：小鼠（Mouse）TCR 与 BCR 分析示例</summary>

**小鼠 TCR 分析**
```bash
$dnbc4tools vdj run \
    --fastqs /test/data/mouse_tcr_fastqs \
    --beadstrans ./test_mouse_rna_5p/outs/singlecell.csv \
    --ref mouse \
    --name test_mouse_tcr \
    --threads 20 \
    --chain TR
```

**小鼠 BCR 分析**
```bash
$dnbc4tools vdj run \
    --fastqs /test/data/mouse_bcr_fastqs \
    --beadstrans ./test_mouse_rna_5p/outs/singlecell.csv \
    --ref mouse \
    --name test_mouse_bcr \
    --threads 20 \
    --chain IG
```

</details>

---

## 多组学联合分析 <a id="integrated-multi-omics-analysis"></a>

适用于同一批生物学样本同时开展 RNA、ATAC 及 V(D)J 测序的联合统筹调度与跨组学交互报告生成。

### 第一步：准备多组学配置文件 (`multi_config.csv`)

```ini
[libraries]
fastqs,feature_types
/test/data/rna,rna
/test/data/atac,atac
/test/data/vdj-t,vdj-t
/test/data/vdj-b,vdj-b

[rna]
genomeDir,/database/scRNA/Homo_sapiens
end5,true

[atac]
genomeDir,/database/scATAC/Homo_sapiens

[vdj-t]
ref,human

[vdj-b]
ref,human
```

### 第二步：执行多组学统筹调度

```bash
$dnbc4tools multi run \
    --name test_multi \
    --csv ./multi_config.csv \
    --threads 20
```

运行完成后，在 `./test_multi/outs/` 下直接交付综合交互式报告 `test_multi_multi_report.html` 及各组学独立输出子目录。

---

## C6 多样本单细胞 RNA 分析 <a id="c6-multi-sample-analysis"></a>

适用于多个生物学样本在实验端基于 Sample Barcode 混合建库测序的高通量场景。生信分析阶段自动解复用并为每个样本独立交付完整结果。

### 第一步：准备 C6 配置文件 (`sample.config.csv`)

创建包含 `[rna]`、`[libraries]` 和 `[samples]` 分段的配置文件：

```csv
[rna]
genomeDir,/database/scRNA/Homo_sapiens
no_bam,true

[libraries]
fastqs,feature_types
/test/data/c6_pooled_data,rna

[samples]
sample_id,probe_barcode_ids
Sample_01,BC01
Sample_02,BC02;BC03
```

> **配置要点说明：**
> 
> * **`[samples]` 分段**：声明各生物学样本名称与对应的 Sample Barcode 编号。若单个样本包含多个条形码，使用英文分号 `;` 分隔（例如 `BC02;BC03`）。
> * **共享测序数据目录**：`/test/data/c6_pooled_data` 目录下需包含混合建库共享的 `cDNA/` 与 `oligo/` 子目录及测序数据。

### 第二步：执行 C6 分析流程

```bash
$dnbc4tools multi run \
    --name test_c6 \
    --csv ./sample.config.csv \
    --threads 40
```

### 第三步：核心交付结果

运行完成后，结果归档于 `./test_c6/outs/`：

* **批次总览报告**：`test_c6_multi_report.html`，集中展示各样本细胞数、饱和度与通量对比；
* **全局合并表达矩阵**：`rna/filtered_feature_bc_matrix/`（包含 MEX、H5 与 H5AD 格式）；
* **全局微球明细表**：`rna/singlecell.csv.gz`（流式压缩，包含真实细胞标记 `is_cell_barcode`）；
* **逐样本独立交付**：`rna/per_sample_outs/<sample>/`，包含各样本独立的表达矩阵、专属比对 BAM（`<sample>_alignments.bam`）及专属交互式 HTML 报告。

---

## 批量分析脚本生成 <a id="batch-script-generation"></a>

适用于需要批量处理大量独立单样本的场景。通过提供样本清单 TSV 文件，自动为每个样本生成独立的 Shell 执行脚本，后续可在终端或计算集群调度系统（如 Slurm、SGE）中排队运行。

### 第一步：准备样本清单文件

**RNA 样本清单 (`rna_samples.tsv`)**

制表符 `\t` 分隔 3 列：`样本名`、`cDNA_R1;cDNA_R2`、`oligo_R1;oligo_R2`（同端多个 FASTQ 文件用逗号 `,` 分隔）：

```text
Sample1	sample1_cDNA_R1.fq.gz;sample1_cDNA_R2.fq.gz	sample1_oligo_R1.fq.gz;sample1_oligo_R2.fq.gz
Sample2	sample2_cDNA_R1.fq.gz;sample2_cDNA_R2.fq.gz	sample2_oligo_R1.fq.gz;sample2_oligo_R2.fq.gz
```

**ATAC 样本清单 (`atac_samples.tsv`)**

制表符 `\t` 分隔 2 列：`样本名`、`FASTQ_R1;FASTQ_R2`（同端多个 FASTQ 文件用逗号 `,` 分隔）：

```text
Sample1	sample1_R1.fq.gz;sample1_R2.fq.gz
Sample2	sample2_R1.fq.gz;sample2_R2.fq.gz
```

### 第二步：生成分析脚本

```bash
# 批量生成 RNA 样本执行脚本
$dnbc4tools rna multi \
    --list ./rna_samples.tsv \
    --genomeDir /database/scRNA/Homo_sapiens \
    --threads 20

# 批量生成 ATAC 样本执行脚本
$dnbc4tools atac multi \
    --list ./atac_samples.tsv \
    --genomeDir /database/scATAC/Homo_sapiens \
    --threads 20
```

> **执行机制说明：**
> `multi` 命令仅在当前工作目录下为清单中的每个样本生成独立的 `.sh` 脚本（如 `run_Sample1.sh`），不自动启动计算。生成完毕后，可按需执行脚本（如 `sh run_Sample1.sh`）或批量提交至集群作业队列。

---

快速入门完成后，您可以根据分析需求查阅更深入的模块文档：

* 查阅各模块完整运行机制：[分析流程总览](./pipeline/pipeline.md)
* 探索高级参数与资源调优：[参数配置总览](./parameter/parameter.md)
* 查看各模块详细交付物结构：[输出结果总览](./outs/outs.md)
