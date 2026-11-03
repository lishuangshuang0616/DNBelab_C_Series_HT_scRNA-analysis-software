# 工具命令参数

DNBelab C Series HT 工具命令参数说明

当前 `dnbc4tools tools` 的公开子命令为 `mkgtf`。下文的 `bam2fastq`、`chromsplit`、`fqsubC4` 为独立辅助工具示例，是否可用取决于部署环境，不是 `dnbc4tools tools` 的子命令。

## GTF 文件操作 (mkgtf) <a id="gtf-文件操作-mkgtf"></a>

> **核心功能**
>
> GTF 文件操作工具，支持基因类型统计、按规则过滤和文件格式校验与修复。为单细胞转录组分析提供标准化的基因注释数据。

### 用法 <a id="usage-mkgtf"></a>

```bash
dnbc4tools tools mkgtf --ingtf genes.gtf --output genes.filtered.gtf
```

### 完整命令行帮助

```shell
$ dnbc4tools tools mkgtf --help
dnbc4tools 3.2

Filter and process GTF annotation files.

Usage: dnbc4tools tools mkgtf [OPTIONS]

options:
  --help           show this help message and exit

Basic Settings:
  --action <STR>   Operation type: 'mkgtf' (filter by gene types), 'stats' (count statistics), 'check' (validate
                   format) [default: mkgtf] (e.g., `stats`).
  --ingtf <FILE>   Path to input GTF annotation file (required) (e.g., `genes.gtf`).
  --output <FILE>  Path to output file (required unless --action stats). If omitted for "stats", statistics are
                   printed to stdout.

Analysis Settings:
  --include <STR>  Comma-separated list of gene types to include. Supports wildcards (e.g., 'IG_*' will match
                   'IG_V_gene', 'IG_C_gene'). [default: protein_coding,lncRNA,lincRNA,antisense,IG_*,TR_*].
  --type <STR>     Attribute name for gene type classification (e.g., gene_biotype, gene_type).
  --feature <STR>  Feature type to process from GTF. Use 'transcript' if no 'gene' entries exist [default: gene].

Usage Examples:
  Statistics:   dnbc4tools tools mkgtf --action stats --ingtf genes.gtf
  Filtering:    dnbc4tools tools mkgtf --ingtf genes.gtf --output filtered.gtf --include 'protein_coding,lncRNA'
  Validation:   dnbc4tools tools mkgtf --action check --ingtf genes.gtf --output corrected.gtf
```

### 参数速查表

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `--ingtf` | 文件路径 | **必需** | 输入的标准 GTF 注释文件路径（不支持 GFF/GFF3 格式） |
| `--output` | 文件路径 | 条件必需 | 处理结果输出文件路径（`--action mkgtf` 和 `check` 模式必需；`stats` 模式可省略并输出至标准输出） |
| `--action` | 选项 | `mkgtf` | 操作模式：`mkgtf`（按基因类型过滤）、`stats`（类型分布统计）、`check`（格式自检与修复） |
| `--include` | 字符串 | 预设类型集 | 仅在 `mkgtf` 模式下生效。要保留的基因生物学类型列表（逗号分隔，支持通配符 `*`） |
| `--type` | 字符串 | `auto` | GTF 属性中用于标识基因类型的键名（如 `gene_biotype`、`gene_type`） |
| `--feature` | 字符串 | `gene` | 从 GTF 中提取的目标层级（通常为 `gene`；若无 gene 行可设为 `transcript`） |
| `--conflict-policy` | 选项 | `error` | 在 `check` 模式下的父级冲突策略：`error`（遇 gene/transcript 冲突报错中断）或 `warn`（告警并原样保留） |

---

### 操作模式深度解析

#### 1. 过滤模式 (`--action mkgtf`)

从包含多种非编码或假基因注释的完整 GTF 中提取感兴趣的高信度基因集合，有效减少跨基因的多重比对，提高比对唯一性：

```bash
dnbc4tools tools mkgtf \
  --action mkgtf \
  --ingtf Homo_sapiens.GRCh38.108.gtf \
  --output Homo_sapiens.filtered.gtf \
  --include "protein_coding,lncRNA,IG_*,TR_*"
```

- **通配符支持**：如 `IG_*` 匹配 `IG_V_gene`、`IG_C_gene`、`IG_J_gene` 等所有免疫球蛋白基因类型。
- **默认保留集**：`protein_coding,lncRNA,lincRNA,antisense,IG_*,TR_*`。

#### 2. 统计模式 (`--action stats`)

统计 GTF 中各类基因生物学类型的数量分布，帮助评估注释源文件的组成与分类标签名称：

```bash
dnbc4tools tools mkgtf --action stats --ingtf genes.gtf
```

#### 3. 校验与修复模式 (`--action check`)

检查 GTF 文件规范性，自动修复缺失的父级特征（如缺少 `gene` 行但有 `transcript` 行时自动推导补齐）：

```bash
dnbc4tools tools mkgtf --action check --ingtf raw_genes.gtf --output corrected.gtf
```

---

## BAM 转 FASTQ (bam2fastq) <a id="bam-转-fastq-bam2fastq"></a>

> **转换工具**
>
> 专用于将单细胞 RNA 比对后的 BAM 文件无损反向转换提取为 FASTQ 文件，支持多线程加速与基因组区域截取。

### 用法 <a id="usage-bam2fastq"></a>

```shell
$ bam2fastq --help
BAM to FASTQ Converter for C4 Single Cell RNA seq Data

Usage: bam2fastq [OPTIONS] <BAM> <OUTPUT>

Arguments:
  <BAM>     Path to the input BAM file
  <OUTPUT>  Directory where FASTQ files will be written

Options:
  --threads <THREADS>        Number of CPU threads for parallel processing [default: 8]
  --locus <REGION>           Process reads from a specific genomic region (format: chr1:1000-2000)
  --reads-per-fastq <READS>  Maximum number of reads per FASTQ file. All reads go to a single file if not specified.
  --max-memory <MEMORY>      Maximum memory to use in MB. Auto-determined if not specified.
  --no-compress              Disable gzip compression for output FASTQ files
  --help                     Print help
  --version                  Print version
```

### 参数速查表

| 参数 / 选项 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `<BAM>` | 文件路径 | **必需 (位置参数)** | 输入的有效 BAM 文件路径（须已构建 `.bai` 索引；双端须按序列名排序） |
| `<OUTPUT>` | 目录路径 | **必需 (位置参数)** | 转换输出 FASTQ 文件的目标目录（不存在时自动创建） |
| `--threads` | 整数 | `8` | 用于并行解码与写出的 CPU 线程数 |
| `--locus` | 字符串 | 无 | 仅提取特定基因组区域的读段（格式为 `chr1:1000-2000`） |
| `--reads-per-fastq` | 整数 | 全部单文件 | 每个输出 FASTQ 文件的最大读段数量，超过则自动分卷 |
| `--max-memory` | 整数 (MB) | 自动判断 | 工具允许使用的最大内存预算 |
| `--no-compress` | 标志开关 | 关闭 | 禁用 gzip 压缩（直接输出 `.fastq` 以获得最高写出速度） |

### 常用示例

```shell
# 基础转换
bam2fastq anno_decon_sorted.bam ./fastq_out

# 提取指定染色体区域并多线程压缩
bam2fastq --threads 16 --locus chr1:1000000-5000000 anno_decon_sorted.bam ./fastq_out

# 按每千万条 reads 分卷输出
bam2fastq --reads-per-fastq 10000000 anno_decon_sorted.bam ./fastq_out
```

---

## 染色体分割 (chromsplit) <a id="染色体分割-chromsplit"></a>

> **核心功能**
>
> 基因组长染色体序列切分工具。结合 GTF 注释在非编码或基因间区（N-stretch / intergenic）寻找安全断点，主要用于处理超过 Chromap 或下游软件上限（如 $2^{29}-1$ bp）的超长染色体。

### 用法

```shell
$ chromsplit --help
Split large genome sequences into smaller fragments at N-stretches or intergenic regions

Usage: chromsplit [OPTIONS] --fasta <FA> --prefix <PREFIX>

Options:
  --fasta <FA>               Input genome sequence file in FASTA format
  --gtf <GTF>                Optional GTF/GFF annotation file for the genome
  --prefix <PREFIX>          Prefix for output files (.fa and .cutsite.tsv will be appended)
  --min_length <MIN_LENGTH>  Minimum length of output scaffold fragments [default: 300000000]
  --max_length <MAX_LENGTH>  Maximum length of output scaffold fragments [default: 500000000]
  --cut_site <CUT_SITE>      Optional cut site file containing predefined split positions
  --help                     Print help
  --version                  Print version
```

### 参数速查表

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `--fasta` | 文件路径 | **必需** | 输入的大基因组 FASTA 序列文件 |
| `--prefix` | 字符串 | **必需** | 输出文件前缀（自动生成 `<prefix>.fa` 与 `<prefix>.cutsite.tsv`） |
| `--gtf` | 文件路径 | 无 | 可选的基因注释文件（确保分割点避开外显子并同步输出位移后的新注释） |
| `--min_length` | 整数 (bp) | `300000000` | 切分后输出 scaffold 片段的最小长度限制 |
| `--max_length` | 整数 (bp) | `500000000` | 切分后输出 scaffold 片段的最大长度限制 |
| `--cut_site` | 文件路径 | 无 | 包含预先指定切点坐标的文本文件 |

### 常用示例

```shell
# 结合 GTF 注释进行安全切分，保护基因结构完整性
chromsplit --fasta large_genome.fasta --gtf genes.gtf --prefix genome_split

# 指定自定义切分长度区间 (200Mb - 400Mb)
chromsplit --fasta large_genome.fasta --prefix custom_split --min_length 200000000 --max_length 400000000
```

---

## FASTQ 切割 (fqsubC4) <a id="fastq-切割-fqsubc4"></a>

> **核心功能**
>
> 高性能 FASTQ 序列区间提取与重构工具。支持按碱基坐标精准截取 Barcode、UMI 或 Insert 序列，用于多批次加测格式统一与非标文库重构。

### 用法

```shell
$ fqsubC4 --help
Extracts regions from FASTQ sequences

Usage: fqsubC4 [OPTIONS] --input <FILE> --output <FILE> --regions <REGIONS>

Options:
  --input <FILE>       Path to input FASTQ file (supports both uncompressed and gzipped formats)
  --output <FILE>      Path to output FASTQ file (automatically compressed if ending in .gz)
  --regions <REGIONS>  Comma-separated regions in format start:end (e.g., 7:16,23:32,38:47)
  --threads <THREADS>  Number of threads to use for parallel processing [default: 8]
  --help               Print help
  --version            Print version
```

### 参数速查表

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `--input` | 文件路径 | **必需** | 输入的 FASTQ 文件路径（支持 `.fq`、`.fastq`、`.fq.gz`、`.fastq.gz`） |
| `--output` | 文件路径 | **必需** | 输出截取后的 FASTQ 文件路径（若以 `.gz` 结尾则自动进行并行 gzip 压缩） |
| `--regions` | 字符串 | **必需** | 提取的碱基区间定义，格式为 `start:end`，多段用逗号分隔（1-based 坐标） |
| `--threads` | 整数 | `8` | 用于并行读取、提取和压缩写出的 CPU 线程数 |

### 常用示例

```shell
# 从包含暗反应或前导碱基的序列中截取两个条形码片段并输出为压缩文件
fqsubC4 \
  --input sample_raw_R1.fq.gz \
  --output extracted_R1.fq.gz \
  --regions "7:16,23:32" \
  --threads 8
```
