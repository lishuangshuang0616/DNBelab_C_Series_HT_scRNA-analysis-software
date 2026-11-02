# Multi 分析参数

`dnbc4tools multi run` 通过一份 CSV 配置执行分析。普通多组学组合与 C6 多样本 RNA 使用同一入口，输入与输出有所区别。

| 任务 | 配置方式 | 结果组织 |
| :--- | :--- | :--- |
| 普通 RNA / ATAC / VDJ 组合 | 填写模态分段与 `[libraries]` | 每个模态一个结果目录 |
| C6 多样本 RNA | 在 RNA 配置中增加 `[samples]` | 同一文库按 probe barcode 拆分样本 |

## 运行命令 <a id="多组学整合流程-run"></a>

```bash
dnbc4tools multi run \
  --name demo \
  --csv config.csv \
  --outdir ./results \
  --threads 16
```

| 参数 | 是否必需 | 说明 |
| :--- | :--- | :--- |
| `--name` | 是 | 任务名称；结果写入 `<outdir>/<name>/` |
| `--csv` | 是 | 分段式 CSV 配置文件 |
| `--outdir` | 否 | 分析输出根目录，默认当前目录 |
| `--threads` | 否 | 总 CPU 线程预算 |

<details markdown="block" class="cli-help">
<summary>查看完整命令行帮助</summary>

```shell
$ dnbc4tools multi run --help
dnbc4tools 3.2

Process an integrated multi-omics sample.
Coordinate RNA, ATAC, and V(D)J workflows within a single run.
Generate a unified multi-omics report.

Usage: dnbc4tools multi run [OPTIONS]

options:
  --help           show this help message and exit

Basic Settings:
  --name <STR>     Unique identifier for the sample.
  --csv <FILE>     CSV file containing pipeline configuration settings. With [samples], RNA chemistry is scRNAC6.
  --outdir <DIR>   Output directory path for analysis results.
  --threads <INT>  Number of CPU threads to use.
```

</details>

`rna multi` 和 `atac multi` 只生成逐样本脚本；这里的 `multi run` 会实际执行分析。

## CSV 配置规则 <a id="csv-配置规范"></a>

模态分段使用 `参数名,值`；`[libraries]` 和 `[samples]` 使用带表头的行表。

| 分段 | 用途 |
| :--- | :--- |
| `[rna]` | RNA 参考、试剂和细胞识别等设置 |
| `[atac]` | ATAC 参考、叫峰和过滤设置 |
| `[vdj-t]` / `[vdj-b]` | TCR / BCR 参考及组装设置 |
| `[libraries]` | FASTQ 目录与模态对应关系，必填 |
| `[samples]` | C6 样本与 probe barcode 对应关系；普通文库不填写 |

布尔值推荐 `true/false`。值含逗号时加双引号，例如 `darkreaction,"R1,R1R2"`。`[rna] expectcells` 和 `[atac] jaccard_cutoff` 可填 `auto`。输入目录建议使用绝对路径。

RNA FASTQ 根目录须含 `cDNA/`、`oligo/`；ATAC 和 VDJ 目录直接放对应文库的配对 FASTQ。文件名的 R1/R2 规则见[快速开始](../quickstart.md#file-naming-conventions)。

## 普通多组学配置 <a id="配置示例"></a>

以下为 5′ RNA + TCR 的最小示例，保存为 `config.csv` 后使用上方命令运行。

```csv
[rna]
genomeDir,/database/scRNA/Human
end5,true
no_bam,true

[vdj-t]
ref,human

[libraries]
fastqs,feature_types
/rawdata/rna,rna
/rawdata/tcr,vdj-t
```

使用 BCR 时将 `[vdj-t]` / `vdj-t` 改为 `[vdj-b]` / `vdj-b`。添加 ATAC 时增加 `[atac]` 及对应的 libraries 行。只运行 RNA 时移除 VDJ 分段及该输入行。

VDJ 默认复用 RNA 的细胞信息；可用 `beadstrans` 指定另一份细胞表。普通 RNA + VDJ 联合分析需设置 `end5,true`。

## C6 多样本 RNA 配置 <a id="c6-samples"></a>

适用于多个生物学样本共享一份 **scRNAC6** 文库的实验。probe barcode 应与实验设计一致；`[samples]` 不用于将普通 RNA 文库转换为 C6。

### 最小配置

```csv
[rna]
genomeDir,/database/scRNA/Human
chemistry,scRNAC6
darkreaction,auto
no_bam,true

[libraries]
fastqs,feature_types
/rawdata/c6_run,rna

[samples]
sample_id,probe_barcode_ids
S1,BC01
S2,BC02;BC03
```

保存为 `c6.csv`，运行：

```bash
dnbc4tools multi run --name c6_run --csv c6.csv --outdir ./results --threads 16
```

上例的 S2 使用两个 probe。C6 的 chemistry 固定为 `scRNAC6`，省略或旧值 `auto` 会归一化为该名称；`darkreaction=auto` 仅检测暗反应。

### 样本表与覆盖值

| 列 | 填写规则 |
| :--- | :--- |
| `sample_id` | 必填且唯一；以字母/数字开头，后续仅含字母、数字、`.`、`_`、`-`；不得使用 `unassigned`、`non_multiplexed` |
| `probe_barcode_ids` | 必填；有效的内置 BC 编号或自定义 DNA 序列；同一样本多个 probe 用 `;` 或 `\|` 分隔；禁止重复分配 |
| `expectcells` / `forcecells` / `minumi` | 可选覆盖列，填写正整数；空值继承 `[rna]`；覆盖列不接受 `auto` |

需要逐样本设置时，扩展为：

```csv
[samples]
sample_id,probe_barcode_ids,expectcells,forcecells,minumi
S1,BC01,3000,,1000
S2,BC02;BC03,3000,,1000
```

### 实验级设置

| `[rna]` 参数 | 默认行为 |
| :--- | :--- |
| `high_occupancy_filter` | `true`，在整个实验统一应用高占用过滤；设 `false` 时常规 cell calling 仍执行；不能作为 samples 列 |
| `sample_failure_policy` | `skip`，记录失败样本并继续；`fail` 在样本失败时停止 |
| `darkreaction` | `auto`；手工 cDNA 支持 `R1/unset`，oligo 支持 `R1/R2/R1R2/unset`；不能混用自动与手工值 |

输出目录、样本报告和指标分母见 [C6 输出](../outs/multi.md#c6-outputs)。

## 模块参数映射 <a id="模块参数映射"></a>

| 分段 | 常用设置 | 完整参数说明 |
| :--- | :--- | :--- |
| `[rna]` | `genomeDir`, `chemistry`, `darkreaction`, `expectcells`, `forcecells`, `minumi`, `consistent_cells`, `calling_method`, `no_introns`, `end5`, `no_bam`, `star_parameters`, `sample_read_pairs` | [RNA](scRNA.md) |
| `[atac]` | `genomeDir`, `darkreaction`, `forcecells`, `frags_cutoff`, `tss_cutoff`, `jaccard_cutoff`, `merge_cutoff`, `peak_signal`, `need_bam`, `sample_read_pairs` | [ATAC](scATAC.md) |
| `[vdj-t]` / `[vdj-b]` | `ref`, `beadstrans`, `darkreaction`, `customize`, `keep_all_cells`, `r2_only`, `enrichment_primers`, `sample_read_pairs` | [VDJ](scVDJ.md) |

普通 RNA 显式 chemistry 与暗反应须成对设置；C6 固定 chemistry，可独立检测暗反应。`customize` 可按对应文库规则填写多条，其余单值参数保留一份定义。

### BAM 资源 <a id="bam-resources"></a>

默认自动调度，日常只需设置总线程预算。只有需要覆盖自动值时才展开以下高级设置。

<details markdown="block">
<summary>高级设置：BAM 资源调度</summary>

日常只需设置流程总线程数。BAM 按 CPU、文件句柄和估算可用内存自动规划并发。只有需要覆盖自动值时，才在 `[rna]` 中填写：

| 参数 | 含义 |
| :--- | :--- |
| `bam_workers` | 并发 chunk worker 的正整数上限 |
| `bam_compression_threads` | 每个 chunk 的压缩线程数；与 worker 共同受总线程预算约束 |
| `bam_queue_depth` | 每个 sample writer 的队列深度，默认是实际压缩线程数的两倍 |
| `bam_max_memory_gb` | 内存估算预算，单位 GiB；不会限制实际 RSS |
| `bam_compression_level` | 0–9；省略保留 HTSlib 默认值 |
| `bam_limit_memory` | 默认 `false`；设 `true` 时连一个 worker 都无法满足估算预算便报错 |

自动模式会降低并发；如果单个 worker 的估算仍超预算，使用一个 worker 并记录警告。内存检测不可用时沿用 CPU/文件句柄调度。`no_bam=true` 时不生成相关 BAM，以上参数不生效。输出布局和统计口径见 [Multi 输出](../outs/multi.md#c6-outputs)。

</details>

## 相关文档

[分析流程](../pipeline/multi.md) · [输出与报告](../outs/multi.md) · [升级指南](../migration.md) · [运行与排错](../troubleshooting.md)
