# 从 3.1 升级到 3.2

本文档总结了 DNBelab C Series™ HT 单细胞分析软件（dnbc4tools）从 3.1 升级至 3.2 的主要新功能、算法优化与输出文件变更。顶部版本切换菜单可随时查阅 3.1 归档文档。

---

## 核心新特性：C6 多样本 RNA 分析

3.2 版本正式支持 **C6 多样本 RNA 分析**，支持在单个物理文库中混合测序并在分析时精准拆分多个样本：

- **一键自动化运行**：在 `multi run` 配置文件中使用 `[samples]` 区块声明样本名称与对应的 Sample Barcode 序列，软件会自动识别并启用 C6 多样本分析流程，无需手动指定化学体系参数。
- **全面交付总矩阵与分样本矩阵**：
    - 针对总文库（输出根目录）以及每个拆分后的样本（`per_sample_outs/<sample>/` 目录下），均分别生成完整的基因表达矩阵信息，同时提供 MEX 文本目录、标准 H5 格式与 H5AD 格式；
    - 各样本拥有专属的交互式 HTML 质控与聚类分析报告（`per_sample_outs/<sample>/<sample>_scRNA_report.html`）。
- **按样本拆分输出比对 BAM 文件**：
    - 默认会为每个样本单独输出专属的比对 BAM 文件（`per_sample_outs/<sample>/<sample>_alignments.bam` 及索引文件），方便针对特定样本进行 IGV 可视化或突变分析；
    - 未能明确分配给任何样本 Sample Barcode 的 reads 则归集输出为 `unassigned_alignments.bam`。
- **双 UMI 独立校正**：针对 C6 双 UMI 文库结构，分别对两段 UMI 进行独立纠错与去重，保证样本拆分与表达定量的准确性。

---

## 算法更新与指标说明

### 1. 单细胞 RNA (scRNA)
- **细胞内跨基因同 UMI 冲突过滤优化**：
    - 3.1 版本已支持该机制，但存在边界判定缺陷；3.2 修复了相关缺陷并优化了冲突裁决逻辑：当同一细胞内同一个 UMI 比对到多个不同基因时，择优保留 read 数最高的主基因；若多个基因 read 数相同无法唯一判定，则完全剔除该歧义分子，避免基因间虚假共表达，使分子定量更准确。
- **Cell Calling 自动预测增加上下限保护**：
    - 3.1 的自动细胞预测没有设置数量上下限；3.2 增加了自动预测细胞数目的上下限保护，有效防止在高游离 RNA 干扰或低质量样本中出现异常过量召回或过度低估。
- **优化 Read 2 的 Cell Barcode 过滤**：
    - 优化了对 Read 2 中 cell barcode 的质控与过滤策略，能够更有效地识别和纠正条形码，保留更多的有效 reads。

### 2. 单细胞 ATAC (scATAC)
- **Peak 与矩阵计数口径采用 cutsite**：
    - **什么是 cutsite？** 在 ATAC-seq 实验中，Tn5 转座酶结合开放染色质并在 DNA 双链上切割插入测序接头，切割时会在双链两端产生 9 bp 的交错错位。**cutsite 模式即统计经 9 bp 偏移修正后的 Tn5 实际插入切割位点端点**。相比统计整条测序片段（fragment），cutsite 能更真实、高灵敏地反映局部染色质的可及性开放事件。
    - **指标说明**：Peak 召回与表达矩阵计数默认采用 cutsite 统计；而 FRIP（Fraction of Reads in Peaks）、TSS 富集比例以及 Cell Calling 仍严格基于去重后的唯一 fragment 统计。

### 3. 单细胞 V(D)J (scVDJ)
- 优化链配对算法与全长重叠群（Full-length Contigs）拼接，提升克隆型召回率。
- 增强多线程抽样确定性，保证多次运行结果完全一致。

---

## 输出目录与格式变更

| 变更项 | 3.1 旧版 | 3.2 新版 | 适配说明 |
| :--- | :--- | :--- | :--- |
| **C6 交付架构** | 仅输出全局汇总分析 | **逐样本独立交付**完整报告、表达矩阵与专属 BAM，同时提供全局合并矩阵（MEX / H5 / H5AD） | 逐样本分析查看 `per_sample_outs/<sample>/`；全局矩阵位于根目录。 |
| **C6 明细表** | 未压缩 CSV | `outs/rna/singlecell.csv.gz` | 支持 gzip 读取；下游分析可基于 `is_cell_barcode` 提取有效细胞。 |
| **RNA 矩阵目录** | `raw_matrix/`<br>`filter_matrix/` | `raw_feature_bc_matrix/`<br>`filtered_feature_bc_matrix/` | 目录结构与标准格式保持一致；同级新增压缩 `.h5` 矩阵，加载更快。 |
| **ATAC 矩阵目录** | `raw_peak_matrix/`<br>`filter_peak_matrix/` | `raw_peak_bc_matrix/`<br>`filtered_peak_bc_matrix/` | 目录命名规范化；同级新增压缩 `.h5` 矩阵。 |
| **ATAC 文本矩阵** | `matrix.mtx.gz` 用 `\t` 分隔 | `matrix.mtx.gz` 用**单空格**分隔 | 自定义解析脚本改用 `line.split()`（匹配任意空白字符）或标准 MatrixMarket 库。 |
| **批量分析脚本** | 写入分析输出目录 | **仅在当前终端工作目录**生成 `.sh` | 在当前目录执行生成的脚本；`--outdir` 仅指定结果交付目录；同名脚本不覆盖。 |
