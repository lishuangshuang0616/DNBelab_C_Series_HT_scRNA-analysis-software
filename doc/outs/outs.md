# 输出与报告

按模块查找输出目录、文件字段与网页报告指标。独立流程的结果位于 `<outdir>/<name>/outs/`；Multi 在该目录下按模态归档。

| 模块 | 主要交付内容 | 输出说明 |
| :--- | :--- | :--- |
| RNA | 基因表达矩阵、H5/H5AD、细胞表、聚类与 RNA 报告 | [RNA 输出](scRNA.md) |
| ATAC | peak 矩阵、片段文件、细胞质控与 ATAC 报告 | [ATAC 输出](scATAC.md) |
| V(D)J | contig 序列、注释、克隆型与 VDJ 报告 | [VDJ 输出](scVDJ.md) |
| 多组学 (Multi) | 组合报告、模态输出目录（RNA / ATAC / VDJ） | [多组学输出](multi.md) |
| C6 多样本 | 根目录全局合并矩阵、`singlecell.csv.gz`、逐样本矩阵与独立报告 | [C6 输出](c6.md) |

## 读取结果时注意

- C6 的完整细胞汇总为 `singlecell.csv.gz`，包含背景与零 UMI 行；按 `is_cell_barcode` 选择有效细胞。
- 普通 RNA/ATAC 默认仍交付 `singlecell.csv`。
- ATAC 矩阵默认统计 cutsite，不能用其列和替代 fragment 质控指标。
- `.xls` 指标汇总为制表符分隔文本，可在表格软件中按文本导入。
- BAM 依对应输出开关生成，索引可能为 BAI 或 CSI。

[在 R / Python 中读取结果](../io.md) · [升级前后的文件变化](../migration.md) · [运行与排错](../troubleshooting.md)
