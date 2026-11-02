# 运行与排错

## 运行前

确认 `dnbc4tools --version` 为 `3.2`，输入 FASTQ 配对、参考和试剂配置正确，并使用与 Python 配套的原生工具。日志位于 `<outdir>/<name>/logs/`；RNA、ATAC、VDJ 启动后在 `preflight.json` 记录紧凑预检信息。已有处理目录或 `outs` 会记录在预检中；需要全新分析时使用新的样本名。

`rna multi` / `atac multi` 仅生成当前目录中的 `.sh`，不创建分析日志；`multi run` 会真正执行分析并记录日志。批量列表必须用 TAB 分列、`;` 分隔 R1/R2、`,` 分隔同端多 lane。生成命令成功后再运行脚本。格式错误、重复样本、重复脚本名或已有同名脚本均报错；需要重新生成时先移动旧脚本。

## 错误信息

命令失败时，`Error ID` 用于定位这一次错误，`Error code` 用于判断问题类别。保留终端错误、命令、配置 CSV 和 `logs/errors.jsonl`。

| Error code | 优先检查 |
| :--- | :--- |
| `CLI-CONFIG` | 参数名、类型、必需值及分段配置 |
| `INPUT` | FASTQ / barcode / 矩阵路径、权限、文件配对及完整性 |
| `REFERENCE` | FASTA、GTF、STAR/Chromap 索引与对应参考配置 |
| `TOOL` | 对应阶段日志、外部命令、原生工具与 Python 接口是否匹配 |
| `OUTPUT` | 输出路径、剩余空间、写权限与产物完整性 |
| `INTERRUPTED` | 任务中断原因及可恢复的阶段 |
| `INTERNAL` | 保存 Error ID、traceback 和结构化错误日志供排查 |

## 现有产物检查（高级诊断）

内部诊断命令不在普通顶层帮助中列出，可显式调用：

```bash
dnbc4tools validate-artifacts --sample-dir /path/to/sample --level shallow
dnbc4tools validate-artifacts --sample-dir /path/to/sample --level deep   --json /path/to/artifact-validation.json
```

`shallow` 做轻量检查；`deep` 扫描完整文件内容。检查空目录可能报告检查 0 个文件并通过，这不代表分析产物齐全。此工具不能替代真实数据分析验收。

## 中断、恢复与空结果

运行锁防止同一目录同时分析。锁冲突应先确认原作业状态；不应把强制解锁作为正常重试方式。高级 `--resume` 仅在阶段输入、配置、工具身份和输出校验允许时复用检查点；仅存在文件不能证明阶段完成。`--keep-empty` 和 `--force-unlock` 属于恢复开关，使用会记录到运行状态中。

零细胞、样本失败、未运行分析是不同状态。C6 默认保留失败状态并继续其他样本；查看 `sample_failure_policy` 与逐样本报告状态。只重生成 HTML 不会补出缺失的矩阵或 H5AD。BAM 开关和输出命名的升级说明见[升级指南](migration.md)。
