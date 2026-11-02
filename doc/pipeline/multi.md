# DNBelab C Series HT 多组学分析流程

单细胞多组学整合分析说明

## 概述 <a id="概述"></a>

多组学流程用于统一编排 RNA / ATAC / VDJ 子流程，通过一份配置文件完成多组学联合运行，并生成组合报告用于跨组学联看。

**工作流程**：配置准备 → 模块调度 → 并行分析 → 状态汇总 → 组合报告

> **使用说明**：`$dnbc4tools` 代表可执行程序路径，需替换为您的实际安装路径。本文示例使用换行符 `\` 分隔命令以提高可读性，实际分析时可写为单行。

**核心特点**：

<table>
  <thead>
    <tr>
      <th>特性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>统一编排</b></td>
      <td>一个入口命令统一调度 RNA / ATAC / VDJ 多个组学模块</td>
    </tr>
    <tr>
      <td><b>状态跟踪</b></td>
      <td>模块级状态管理（成功 / 失败 / 跳过 / 复用）</td>
    </tr>
    <tr>
      <td><b>组合报告</b></td>
      <td>生成整合 HTML 报告，支持跨组学浏览和对比</td>
    </tr>
    <tr>
      <td><b>灵活配置</b></td>
      <td>支持任意模块组合（单模块 / 双模块 / 全模块）</td>
    </tr>
  </tbody>
</table>

## 输入配置 <a id="输入配置"></a>

### 配置文件结构

`multi run` 使用 CSV 配置文件定义各模块参数和输入数据，通常包含以下分段：

<table>
  <thead>
    <tr>
      <th>分段名</th>
      <th>用途</th>
      <th>关键参数</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>[rna]</code></td>
      <td>RNA 分析模块配置</td>
      <td><code>genomeDir</code>, <code>expectcells</code>, <code>no_bam</code>...</td>
    </tr>
    <tr>
      <td><code>[atac]</code></td>
      <td>ATAC 分析模块配置</td>
      <td><code>genomeDir</code>, <code>frags_cutoff</code>, <code>need_bam</code>...</td>
    </tr>
    <tr>
      <td><code>[vdj-t]</code></td>
      <td>T 细胞 VDJ 分析配置</td>
      <td><code>ref</code>, <code>beadstrans</code>...</td>
    </tr>
    <tr>
      <td><code>[vdj-b]</code></td>
      <td>B 细胞 VDJ 分析配置</td>
      <td><code>ref</code>, <code>beadstrans</code>...</td>
    </tr>
    <tr>
      <td><code>[libraries]</code></td>
      <td>输入数据映射（必填）</td>
      <td><code>fastqs</code>, <code>feature_types</code></td>
    </tr>
  </tbody>
</table>

> **详细配置说明**：请参考 [多组学参数文档](../parameter/multi.md) 了解完整的 CSV 配置规范和参数映射关系。

**`[libraries]` 输入目录要求：**
- `rna`：`fastqs` 指向 RNA FASTQ 根目录，该目录下应包含 `cDNA/` 和 `oligo/` 子目录。
- `atac`：`fastqs` 指向当前 ATAC 文库 FASTQ 目录，R1/R2 文件直接放在该目录下。
- `vdj-t` / `vdj-b`：`fastqs` 指向当前 VDJ 文库 FASTQ 目录，TCR 与 BCR 数据应分别配置。
- 自动识别依赖文件名中的 R1/R2 标识，建议使用 `_R1`/`_R2` 或 `_R1_`/`_R2_` 命名。

### 最小配置示例

<details markdown="block" open>
<summary> 配置示例</summary>

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

### 运行命令

```shell
$dnbc4tools multi run \
  --csv sample.csv \
  --name demo \
  --outdir /data/result \
  --threads 20
```

**参数说明**：

<table>
  <thead>
    <tr>
      <th>参数</th>
      <th>必需</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>--csv</code></td>
      <td><b>是</b></td>
      <td>CSV 配置文件路径</td>
    </tr>
    <tr>
      <td><code>--name</code></td>
      <td><b>是</b></td>
      <td>样本名称，用于输出目录命名</td>
    </tr>
    <tr>
      <td><code>--outdir</code></td>
      <td>否</td>
      <td>输出目录，默认为当前目录 <code>./</code></td>
    </tr>
    <tr>
      <td><code>--threads</code></td>
      <td>否</td>
      <td>CPU 线程数，默认使用软件默认策略</td>
    </tr>
  </tbody>
</table>

### 运行前检查清单

> **建议运行前确认以下事项**：
> 1. `--csv` 与 `--name` 参数已正确提供
> 2. CSV 文件中至少启用了一个组学模块（包含对应分段）
> 3. `[libraries]` 中的输入路径存在且与 `feature_types` 正确对应
> 4. 各模块所需参考数据库参数（如 `genomeDir`、`ref`）完整且路径有效

## 主流程分析 <a id="主流程分析"></a>

### 执行流程

<table>
  <thead>
    <tr>
      <th>阶段</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>1. 配置解析</b></td>
      <td>读取 CSV 文件，校验分段完整性和参数合法性</td>
    </tr>
    <tr>
      <td><b>2. 任务拆分</b></td>
      <td>按启用的模块构建 RNA / ATAC / VDJ 子任务队列</td>
    </tr>
    <tr>
      <td><b>3. 子流程执行</b></td>
      <td>串行调用对应模块命令，实时记录运行状态</td>
    </tr>
    <tr>
      <td><b>4. 状态汇总</b></td>
      <td>整合各模块返回码、运行耗时、是否跳过或复用</td>
    </tr>
    <tr>
      <td><b>5. 报告生成</b></td>
      <td>生成多组学 HTML 组合报告，整合各模块核心结果</td>
    </tr>
  </tbody>
</table>

### 执行要点

<strong>核心原则</strong>：
<ul>
  <li>Multi 负责"<b>编排和汇总</b>"，模块算法仍由各单组学子流程执行</li>
  <li>某模块失败<b>不会</b>改变其他模块已完成结果，但会反映到最终状态汇总</li>
</ul>

### 典型运行日志

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

## C6 多样本 RNA 工作流 <a id="c6-workflow"></a>

配置含 `[samples]` 时，3.2 进入 `scRNAC6` 工作流。多个样本共享 cDNA/oligo FASTQ 和参考，通过 probe barcode 区分。最小可用配置见 [C6 参数](../parameter/multi.md#c6-samples)。

1. 读取文库及样本配置，校验 probe 唯一性，识别暗反应，执行 FASTQ 质控与 barcode 纠错。
2. RNA 比对和 UMI 计数；汇总每个 30 bp bead 前缀跨 probe 的 RNA UMI，UMI 总数至少 100 的 bead 作为合并 target。Oligo 提供连接证据，不用于该 target 阈值。
3. 使用 robust 微球相似性评分生成合并关系，保留 probe 后缀；按样本执行 cell calling，再应用实验级高占用过滤（默认开启）。
4. 生成合并的 raw/filtered 矩阵和完整 `singlecell.csv.gz`；拆分各样本矩阵，分别做降维、聚类、marker 及可用的注释。
5. 交付根目录 Multi 报告、各样本 RNA 报告和矩阵；启用 BAM 时按样本拆分 BAM，并保留 Unassigned 和共享 oligo BAM。

全局 `filtered_feature_bc_matrix.h5ad` 保存全部 called cells 的稀疏计数和基因/barcode 元数据，不执行联合 PCA、UMAP、聚类或 marker 分析。联合分析可从该矩阵另行开始。全局不再交付 `<run>_scRNA_report.html`，完整 RNA 报告位于逐样本目录。

C6 的 RNA 在当前进程内编排；同时配置的其他模态继续运行各自的子流程。普通 Multi 的原有文库分段和 RNA/ATAC/VDJ 结果归档继续适用，见下文。

### 细胞表、报告与恢复

C6 的完整六列汇总表包括背景和零 UMI 行，以 gzip 流式交付。正 UMI 行降序、零 UMI 行保持原组序；有效细胞通过 `is_cell_barcode` 判断。报告使用可校验的小表缓存或有界分块读取，避免根据压缩文件体积整表加载。

空样本与失败样本有独立状态，不能把零细胞误当成成功聚类。默认 `sample_failure_policy=skip` 允许保留其他成功样本的输出；要求失败即停止时设置 `fail`。日志、检查点及完整性诊断见[运行与排错](../troubleshooting.md)。

详细文件位置与 QC 分母见 [C6 输出](../outs/multi.md#c6-outputs)。

## 结果解析 <a id="结果解析"></a>

### 输出目录结构

运行完成后，结果集中在 `<outdir>/<name>/` 目录下：

```text
<outdir>/<name>/
├── outs/                                    # 整理后的输出结果
│   ├── <sample>_multi_report.html           # 多组学组合报告
│   ├── rna/                                 # RNA 结果目录（若启用）
│   ├── atac/                                # ATAC 结果目录（若启用）
│   ├── vdj-t/                               # VDJ-T 结果目录（若启用）
│   └── vdj-b/                               # VDJ-B 结果目录（若启用）
├── logs/                                    # 日志与运行状态
│   ├── run_manifest.json                    # 模块运行状态汇总
│   └── *.log                                # 各模块运行日志
├── RNA_ANALYSIS_WORKFLOW_PROCESSING/        # 各模块流程目录（若启用）
├── ATAC_ANALYSIS_WORKFLOW_PROCESSING/
├── VDJ-T_ANALYSIS_WORKFLOW_PROCESSING/
└── VDJ-B_ANALYSIS_WORKFLOW_PROCESSING/
```

### 重点输出文件

<table>
  <thead>
    <tr>
      <th>文件/目录</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>outs/&lt;sample&gt;_multi_report.html</code></td>
      <td>多组学组合报告，整合展示各模块核心 QC 与分析图表</td>
    </tr>
    <tr>
      <td><code>outs/rna/</code></td>
      <td>RNA 模块标准输出（矩阵、统计表、模块报告等）</td>
    </tr>
    <tr>
      <td><code>outs/atac/</code></td>
      <td>ATAC 模块标准输出（片段文件、峰值、模块报告等）</td>
    </tr>
    <tr>
      <td><code>outs/vdj-t/</code> / <code>outs/vdj-b/</code></td>
      <td>VDJ 模块标准输出（克隆型、注释、模块报告等）</td>
    </tr>
    <tr>
      <td><code>logs/run_manifest.json</code></td>
      <td>模块运行状态汇总，包含返回码、耗时、复用状态</td>
    </tr>
  </tbody>
</table>

> **详细输出说明**：请参考 [多组学输出文档](../outs/multi.md) 了解组合报告的详细解读方法。

## 相关文档

| 资源 | 描述 |
| :--- | :--- |
| [分析参数设置](../parameter/multi.md) | 查看完整参数选项和说明 |
| [输出文件解释](../outs/multi.md) | 详细解读分析结果文件 |
| [scRNA 流程文档](./scRNA.md) | 单细胞 RNA 分析流程指南 |
| [scATAC 流程文档](./scATAC.md) | 单细胞 ATAC 分析流程指南 |
| [scVDJ 流程文档](./scVDJ.md) | 单细胞 VDJ 分析流程指南 |

## 常见问题

本节将根据常见使用问题持续补充。当前版本请优先参考运行日志、参数说明和输出文件说明进行排查。
