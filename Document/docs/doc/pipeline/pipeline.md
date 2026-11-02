# 分析流程

从输入准备、参考库构建到结果交付，按实验类型选择流程。

| 实验类型 | 主要步骤 | 流程文档 |
| :--- | :--- | :--- |
| RNA | cDNA/oligo 质控 → 比对与计数 → 细胞识别 → 聚类与报告 | [RNA 流程](scRNA.md) |
| ATAC | 片段处理 → 微球合并 → 叫峰与矩阵 → 细胞质控与聚类 | [ATAC 流程](scATAC.md) |
| V(D)J | 质控 → 组装 → 注释与过滤 → 克隆型与报告 | [VDJ 流程](scVDJ.md) |
| 普通多组学 | CSV 配置 → 模态调度 → 结果归档 → 组合报告 | [Multi 流程](multi.md) |
| C6 多样本 RNA | 共享文库 → probe barcode 分配 → 逐样本细胞识别与分析 | [C6 工作流](multi.md#c6-workflow) |

## 开始分析

1. 按[安装指南](../installation.md)准备匹配的软件与原生工具。
2. 确认 FASTQ 配对、试剂和参考，按[快速开始](../quickstart.md)运行一份样本。
3. 在[参数文档](../parameter/parameter.md)中查找需要覆盖的设置。
4. 使用[输出文档](../outs/outs.md)核对矩阵、指标和报告。

升级旧版结果时，先查看[升级指南](../migration.md)；运行失败时查看[排错说明](../troubleshooting.md)。
