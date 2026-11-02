# 快速开始指南

**dnbc4tools 快速开始操作说明**

[RNA-seq](#single-cell-rna-analysis) • [ATAC-seq](#single-cell-atac-analysis) • [VDJ-seq](#single-cell-vdj-analysis) • [多组学](#integrated-multi-omics-analysis)

## 选择运行方式

| 任务 | 命令入口 |
| :--- | :--- |
| 普通 RNA / ATAC / VDJ 单样本 | `rna run` / `atac run` / `vdj run` |
| 多组学联合运行 | `multi run --csv config.csv` |
| C6 probe barcode 多样本 | `multi run --csv c6.csv`，配置含 `[samples]`，RNA chemistry 为 `scRNAC6` |
| 多份独立 RNA / ATAC 任务 | `rna multi` / `atac multi` 生成脚本，之后逐个执行 |

C6 可直接使用 [Multi 参数中的完整示例](parameter/multi.md#c6-samples)。先阅读[升级指南](migration.md)，尤其注意新矩阵目录、C6 gzip 汇总及 ATAC 默认 cutsite 计数。正式 3.2 下载信息待发布确认。

## 使用前准备

> **开始前请确认：**
> - 已完成 dnbc4tools 安装，参见[安装指南](./installation.md)。
> - 命令中的 `$dnbc4tools` 需替换为实际安装路径（如 `/opt/software/dnbc4tools3.2/dnbc4tools`）。
> - 反斜杠 `\` 仅用于多行展示以提高可读性，实际运行可写为单行。

<a id="file-naming-conventions"></a>

> **`--fastqs` 自动识别命名规则**
>
> 当使用 `--fastqs` 目录输入方式时，流程会根据文件名自动识别双端文件，支持以下模式。若使用 `--fastq1/--fastq2` 或 RNA 的 `--cDNAfastq1/2`、`--oligofastq1/2` 逐项指定文件，则不要求文件名必须符合这些模式，但 R1/R2 文件顺序必须一一对应。
> - **支持扩展名：** `.fastq.gz`、`.fq.gz`、`.fastq`、`.fq`
> - **R1 模式：** `_R1_`、`_R1`、`_1`、`_read1`
> - **R2 模式：** `_R2_`、`_R2`、`_2`、`_read2`
>
> 示例：`sample_R1.fastq.gz`、`sample_1.fastq.gz`、`sample_R1_001.fastq.gz` 均会被识别为 R1 文件。

## 单细胞 RNA 分析 <a id="single-cell-rna-analysis"></a>

> 单细胞分辨率的基因表达分析

### 第一步： 构建参考数据库

**人（Human, GRCh38）**
```bash
# 下载参考文件
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/GRCh38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/gencode.v32.primary_assembly.annotation.gtf.gz

# 解压文件
gzip -d GRCh38.primary_assembly.genome.fa.gz
gzip -d gencode.v32.primary_assembly.annotation.gtf.gz

# 构建参考库
$dnbc4tools tools mkgtf --ingtf gencode.v32.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools rna mkref --ingtf genes.filtered.gtf --fasta GRCh38.primary_assembly.genome.fa --threads 10 --species Homo_sapiens
```

**小鼠（Mouse, GRCm38）**
```bash
# 下载参考文件
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/GRCm38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/gencode.vM23.primary_assembly.annotation.gtf.gz

# 解压文件
gzip -d GRCm38.primary_assembly.genome.fa.gz
gzip -d gencode.vM23.primary_assembly.annotation.gtf.gz

# 构建参考库
$dnbc4tools tools mkgtf --ingtf gencode.vM23.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools rna mkref --ingtf genes.filtered.gtf --fasta GRCm38.primary_assembly.genome.fa --threads 10 --species Mus_musculus
```

**人-鼠双物种参考库**
```bash
# 按以上步骤准备两个参考库后，继续执行：
$dnbc4tools rna mkref \
    --fasta GRCh38.primary_assembly.genome.fa,GRCm38.primary_assembly.genome.fa \
    --ingtf hg38/genes.filtered.gtf,mm10/genes.filtered.gtf \
    --species hg38,mm10 \
    --threads 10
```

### 第二步： 运行分析

**目录输入方式 (`--fastqs`)**
```bash
$dnbc4tools rna run \
    --fastqs /test/data/rna_fastqs \
    --genomeDir /database/scRNA/Mus_musculus/mm10 \
    --name test \
    --threads 30
```

推荐目录结构：
- `/test/data/rna_fastqs/cDNA/*_R1*.fastq.gz`, `*_R2*.fastq.gz`
- `/test/data/rna_fastqs/oligo/*_R1*.fastq.gz`, `*_R2*.fastq.gz`

使用 `--fastqs` 时，支持的自动识别模式见[`--fastqs` 自动识别命名规则](#file-naming-conventions)。

**文件输入方式（--cDNAfastq1/2 --oligofastq1/2）**
```bash
$dnbc4tools rna run \
    --cDNAfastq1 /test/data/rna_fastqs/cDNA/test_R1.fastq.gz \
    --cDNAfastq2 /test/data/rna_fastqs/cDNA/test_R2.fastq.gz \
    --oligofastq1 /test/data/rna_fastqs/oligo/test_1_1.fq.gz,/test/data/rna_fastqs/oligo/test_2_1.fq.gz \
    --oligofastq2 /test/data/rna_fastqs/oligo/test_1_2.fq.gz,/test/data/rna_fastqs/oligo/test_2_2.fq.gz \
    --genomeDir /database/scRNA/Mus_musculus/mm10 \
    --name test \
    --threads 30
```

## 单细胞 ATAC 分析 <a id="single-cell-atac-analysis"></a>

> 单细胞分辨率的染色质开放性分析

### 第一步： 构建参考数据库

**人（Human, GRCh38）**
```bash
# 下载参考文件
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/GRCh38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_32/gencode.v32.primary_assembly.annotation.gtf.gz

# 解压文件
gzip -d GRCh38.primary_assembly.genome.fa.gz
gzip -d gencode.v32.primary_assembly.annotation.gtf.gz

# 构建参考库
$dnbc4tools tools mkgtf --ingtf gencode.v32.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools atac mkref --fasta GRCh38.primary_assembly.genome.fa --ingtf genes.filtered.gtf --species Homo_sapiens --prefix chr
```

**小鼠（Mouse, GRCm38）**
```bash
# 下载参考文件
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/GRCm38.primary_assembly.genome.fa.gz
wget http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_mouse/release_M23/gencode.vM23.primary_assembly.annotation.gtf.gz

# 解压文件
gzip -d GRCm38.primary_assembly.genome.fa.gz
gzip -d gencode.vM23.primary_assembly.annotation.gtf.gz

# 构建参考库
$dnbc4tools tools mkgtf --ingtf gencode.vM23.primary_assembly.annotation.gtf --output genes.filtered.gtf
$dnbc4tools atac mkref --fasta GRCm38.primary_assembly.genome.fa --ingtf genes.filtered.gtf --species Mus_musculus --prefix chr
```

### 第二步： 运行分析

**目录输入方式 (`--fastqs`)**
```bash
$dnbc4tools atac run \
    --fastqs /test/data \
    --genomeDir /database/scATAC/Mus_musculus/mm10 \
    --name test \
    --threads 10
```
推荐目录结构：
- `/test/data/*_R1*.fastq.gz`, `*_R2*.fastq.gz`

使用 `--fastqs` 时，支持的自动识别模式见[`--fastqs` 自动识别命名规则](#file-naming-conventions)。

**文件输入方式（--fastq1/2）**
```bash
$dnbc4tools atac run \
    --fastq1 /test/data/test1_R1.fastq.gz,/test/data/test2_R1.fastq.gz \
    --fastq2 /test/data/test1_R2.fastq.gz,/test/data/test2_R2.fastq.gz \
    --genomeDir /database/scATAC/Mus_musculus/mm10 \
    --name test \
    --threads 10
```

## 单细胞 VDJ 分析 <a id="single-cell-vdj-analysis"></a>

> 免疫受体组库分析（需先完成 5' RNA 分析）

> **前置条件**：先完成 5' scRNA 分析以建立细胞与微珠对应关系。

### 第一步： 5' RNA 分析

**5' scRNA-seq 分析**

> **注意**：5' scRNA-seq 数据需增加 `--end5` 参数以指定文库类型。

```bash
$dnbc4tools rna run \
    --fastqs /test/rna/data \
    --genomeDir /database/scRNA/Homo_sapiens \
    --name test \
    --threads 30 \
    --end5
```

### 第二步： VDJ 分析

**目录输入方式 (`--fastqs`)**
```bash
$dnbc4tools vdj run \
    --fastqs /test/data \
    --beadstrans /scRNA/test1/outs/singlecell.csv \
    --ref human \
    --name test_human_tcr \
    --threads 20 \
    --chain TR
```
推荐目录结构：
<ul>
  <li><code>/test/data/*_R1*.fastq.gz</code>, <code>*_R2*.fastq.gz</code></li>
</ul>

使用 <code>--fastqs</code> 时，支持的自动识别模式见[`--fastqs` 自动识别命名规则](#file-naming-conventions)。

**文件输入方式（--fastq1/2）**

**TCR 分析（人）**
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data/test1_R1.fastq.gz,/test/data/test2_R1.fastq.gz \
    --fastq2 /test/data/test1_R2.fastq.gz,/test/data/test2_R2.fastq.gz \
    --beadstrans /scRNA/test1/outs/singlecell.csv \
    --ref human \
    --name test_human_tcr \
    --threads 20 \
    --chain TR
```

**TCR 分析（小鼠）**
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data_tcrmouse/test3_R1.fastq.gz,/test/data_tcrmouse/test4_R1.fastq.gz \
    --fastq2 /test/data_tcrmouse/test3_R2.fastq.gz,/test/data_tcrmouse/test4_R2.fastq.gz \
    --beadstrans /scRNA/test2/outs/singlecell.csv \
    --ref mouse \
    --name test_mouse_tcr \
    --threads 20 \
    --chain TR
```

**BCR 分析（人）**
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data_bcrhuman/test5_R1.fastq.gz,/test/data_bcrhuman/test6_R1.fastq.gz \
    --fastq2 /test/data_bcrhuman/test5_R2.fastq.gz,/test/data_bcrhuman/test6_R2.fastq.gz \
    --beadstrans /scRNA/test1/outs/singlecell.csv \
    --ref human \
    --name test_human_bcr \
    --threads 20 \
    --chain IG
```

**BCR 分析（小鼠）**
```bash
$dnbc4tools vdj run \
    --fastq1 /test/data_bcrmouse/test7_R1.fastq.gz,/test/data_bcrmouse/test8_R1.fastq.gz \
    --fastq2 /test/data_bcrmouse/test7_R2.fastq.gz,/test/data_bcrmouse/test8_R2.fastq.gz \
    --beadstrans /scRNA/test2/outs/singlecell.csv \
    --ref mouse \
    --name test_mouse_bcr \
    --threads 20 \
    --chain IG
```

## 多组学分析 <a id="integrated-multi-omics-analysis"></a>

> 在同一流程中运行 RNA/ATAC/VDJ，并输出统一报告

### 第一步： 准备配置文件

> **配置说明**：在 `[libraries]` 中，`fastqs` 应填写各组学文库对应的 FASTQ 目录路径；流程会在每个目录中自动识别 R1/R2 文件。启用 VDJ 模块时，`[rna]` 分段需设置 `end5,true`。

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

推荐目录结构：
- **RNA**：`/test/data/rna/cDNA/` 和 `/test/data/rna/oligo/`
- **ATAC**：成对 FASTQ 文件放在 `/test/data/atac/`
- **VDJ-T**：成对 FASTQ 文件放在 `/test/data/vdj-t/`
- **VDJ-B**：成对 FASTQ 文件放在 `/test/data/vdj-b/`


### 第二步： 运行多组学流程

```bash
$dnbc4tools multi run \
    --name test_multi \
    --csv ./multi_config.csv \
    --threads 20
```

## 命令速查 <a id="command-reference"></a>

### 核心命令汇总

| 流程 | 命令 | 用途 |
| :--- | :--- | :--- |
| **RNA 分析** | `dnbc4tools rna run` | RNA 全流程分析 |
| **ATAC 分析** | `dnbc4tools atac run` | ATAC 全流程分析 |
| **VDJ 分析** | `dnbc4tools vdj run` | TCR/BCR 组库分析 |
| **参考库构建** | `dnbc4tools rna mkref` | 构建 RNA 参考库 |
| **参考库构建** | `dnbc4tools atac mkref` | 构建 ATAC 参考库 |
| **多组学** | `dnbc4tools multi run` | RNA/ATAC/VDJ 联合分析与统一报告 |
| **GTF 处理** | `dnbc4tools tools mkgtf` | 过滤并处理 GTF 文件 |

## 相关文档

| 文档 | 说明 |
| :--- | :--- |
| [流程文档](./pipeline/pipeline.md) | 各分析流程说明 |
| [参数说明](./parameter/parameter.md) | 命令与配置项参考 |
| [输出说明](./outs/outs.md) | 结果文件与报告解读 |
| [GitHub Issues](https://github.com/MGI-tech-bioinformatics/DNBelab_C_Series_HT_scRNA-analysis-software/issues) | 提交问题或功能建议 |
