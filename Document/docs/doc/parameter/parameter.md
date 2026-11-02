# 参数总览

按分析类型查找命令、默认值与配置说明。参数页先给运行示例，完整帮助与高级设置可按需展开。

| 模块 | 命令 | 参数文档 |
| :--- | :--- | :--- |
| RNA | `rna run`、`rna mkref`、`rna multi` | [RNA 参数](scRNA.md) |
| ATAC | `atac run`、`atac mkref`、`atac multi` | [ATAC 参数](scATAC.md) |
| V(D)J | `vdj run` | [VDJ 参数](scVDJ.md) |
| Multi / C6 | `multi run`，通过 CSV 配置 | [Multi 参数](multi.md) |
| GTF 工具 | `tools mkgtf` | [工具参数](tools.md) |

## 选择正确的入口

- 单份独立文库使用对应模块的 `run`。
- `rna multi` / `atac multi` 只生成多份样本脚本；成功后再执行脚本。
- `multi run` 实际执行多组学或 C6 流程。C6 需要真实的 scRNAC6 文库与 `[samples]` 配置。

## 配置前需要了解

省略参数通常采用流程默认值，不等同于所有参数都接受字符串 `auto`。CLI 的布尔开关不带值；Multi CSV 的布尔值使用 `true/false`。样本级覆盖值与全局设置的规则以各参数页为准。

[分析流程](../pipeline/pipeline.md) · [输出说明](../outs/outs.md) · [快速开始](../quickstart.md)
