# 从 3.1 升级到 3.2

本文对应 2026 年 10 月 23 日的 3.2 源码。正式安装包、下载地址和校验值尚待发布确认。顶部版本菜单可切换到完整的 3.1 文档；默认入口为 3.2。

## 主要变化

| 项目 | 3.2 的行为 | 升级时需要调整 |
| :--- | :--- | :--- |
| 多样本 RNA | `multi run` 的 `[samples]` 启用 C6 probe barcode 拆分 | RNA chemistry 使用 `scRNAC6`，每个 probe 只分配给一个样本 |
| RNA 矩阵命名 | `raw_feature_bc_matrix`、`filtered_feature_bc_matrix`，同时输出 H5 | 更新依赖旧 `raw_matrix`、`filter_matrix`、`filter_feature.h5ad` 的脚本 |
| C6 汇总 | `outs/rna/singlecell.csv.gz`，完整保留六列、背景与零 UMI 行 | 读取方支持 gzip；普通 RNA/ATAC 仍默认 CSV |
| C6 分析 | 每个样本独立分析和报告 | 全局 H5AD 是稀疏计数，不含联合 PCA/UMAP/聚类；联合分析需自行执行 |
| C6 报告 | 根目录 Multi 报告与逐样本 RNA 报告 | 改用 `per_sample_outs/<sample>/<sample>_scRNA_report.html` |
| ATAC 默认设置 | calling=`ordmag`；`frags_cutoff=0`；peak signal 与矩阵默认 `cutsite` | 计数矩阵值可能改变；cell calling 和 FRIP 仍基于 fragment，见下文 |
| ATAC 矩阵命名 | `raw_peak_bc_matrix`、`filtered_peak_bc_matrix`，同时输出 H5 | 更新旧 `raw_peak_matrix`、`filter_peak_matrix` 路径 |
| 批量脚本 | `rna multi` / `atac multi` 只在当前目录生成脚本 | 成功生成后执行 `.sh`；`--outdir` 只控制分析输出；同名脚本不覆盖 |
| 运行诊断 | 预检、运行状态、阶段日志和结构化错误 | 排错优先查看样本的 `logs/`，参见[运行与排错](troubleshooting.md) |

## C6 的输入与输出

见 [Multi 参数](parameter/multi.md#c6-samples)、[Multi 流程](pipeline/multi.md#c6-workflow) 和 [Multi 输出](outs/multi.md#c6-outputs)。`[samples]` 不用于把任意普通 RNA 文库变为 C6 文库。

C6 正 UMI 行按 UMI 降序输出，零 UMI 行保持原组序并接在末尾。下游关联应使用 cell/barcode 标识。`is_cell_barcode` 区分有效细胞与背景，不能把整张表的每一行都当作有效细胞。报告及约束输入兼容完整旧 CSV 和新 `.csv.gz`。

`high_occupancy_filter` 是 `[rna]` 中的实验级开关，默认开启。不要将它放进 `[samples]` 列。未分配 BAM 使用 `unassigned_alignments.bam`，报告标签为 Unassigned。

## ATAC 的统计口径

`peak_signal=cutsite` 将已做 Tn5 调整的片段端点用于 MACS2；`fragment` 使用完整片段。默认 peak caller 输入来自全部合并去重后的片段，而不只来自进入 bead 合并候选集的片段。

矩阵默认对 peak 内左右端点分别计数。cell calling、FRIP、TSS 区域片段比例仍用唯一 fragment 统计，不以 cutsite 矩阵列和替代。`frags_cutoff=0` 只关闭附加的最终 fragment 数量阈值，其他过滤仍适用；`tss_cutoff=0` 关闭该比例过滤。TSS 比例与 TSS enrichment 是不同指标。默认应用 low-targeting 过滤。

## 运行包与原生工具必须配套

3.2 的 Python 层与 `dnbc4rust` 原生工具需要同步。C6 gzip 汇总需要支持 `--gzip` 的 `c4_summary`，压缩 RNA 表参与 VDJ 时也需配套的 `vdj_pre_asm`；BAM 内存调度及新的矩阵接口依赖对应新版工具。不能只替换 Python 文件便假定原生功能已经部署。

安装方法见[安装指南](installation.md)。新版本的矩阵、统计或合并策略变化可能改变结果；对照分析请使用新的样本名或输出目录，保留 3.1 结果。
