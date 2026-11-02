# DNBelab C Series™ 软件安装指南

[环境要求](#system-requirements) · [发行状态](#software-download) · [安装与验证](#installation-process)

## 环境要求 <a id="system-requirements"></a>

| 类别 | 要求 |
| :--- | :--- |
| 生产分析平台 | Linux x86-64；原生工具必须与部署平台匹配 |
| 内存和线程 | 依据数据量、参考基因组和样本数规划；沿用 3.1 的起始建议：至少 50 GB RAM、8 核，较大任务建议 128 GB、16 核及以上 |
| 磁盘 | 同时容纳 FASTQ、参考、矩阵、BAM 与处理中间文件；建议 SSD |
| Python | 源码与轻量 CLI 支持 Python 3.8+；科学计算依赖使用经过验证的锁定环境 |
| ATAC 依赖 | 部署环境提供 MACS2、bgzip、tabix；完整目录发行包可附带这些工具 |

## 3.2 发行状态 <a id="software-download"></a>

当前文档根据 3.2 源码更新，源码变更记录仍标为未发布。正式安装包、下载地址、文件大小、发布日期与校验值待确认。请勿将 3.1 安装包重命名后当作 3.2 使用。

已有完整 3.2 安装目录时，使用该发行包指定的启动入口。需要 3.1 下载和安装说明时，可在顶部切换到 3.1 文档。更早版本见[历史安装指南](installation_previous.md)。

## 安装与验证 <a id="installation-process"></a>

### 使用完整发行目录

保留完整目录结构，包括 Python 包、配置、报告模板、`software/` 中的原生可执行文件和清单。当前源码构建器的目录入口为 `bin/dnbc4tools`；部署包也兼容外层 `dnbc4tools` 启动程序。请使用实际提供的入口路径。

```bash
/path/to/dnbc4tools-release/bin/dnbc4tools --version
/path/to/dnbc4tools-release/bin/dnbc4tools --help
/path/to/dnbc4tools-release/bin/dnbc4tools multi run --help
```

版本应为 `3.2`。帮助命令成功仅验证入口，不代表完整分析通过。

### 从源码组装目录包（维护者）

在 `dnbc4tools_py` 源码根目录和已验证的分析环境运行：

```bash
python -m pip install -r requirements-runtime.txt
python scripts/build_release.py . /path/to/dnbc4tools-release
python scripts/check_release.py /path/to/dnbc4tools-release   --launcher /path/to/dnbc4tools-release/bin/dnbc4tools   --require-clean-source --require-runtime-tools
```

目标目录须不存在。构建器复制当前配置、模板和软件，并生成启动程序。原生工具必须先在目标 Linux 平台构建并同步，清单中的大小、SHA-256 和源码身份也应同步更新。

C6 的附加接口检查：

```bash
python scripts/check_release.py /path/to/dnbc4tools-release   --require-c6-optimizations
```

这些检查验证安装内容与接口，不能替代真实数据分析回归。新的 gzip 汇总还需支持 `--gzip` 的 `c4_summary`。BAM 调度、矩阵和 VDJ 输入的变化需要配套原生工具，不能只更新 Python。

## 开始分析 <a id="verification--testing"></a>

参考[快速开始](quickstart.md)、[升级指南](migration.md)和[运行与排错](troubleshooting.md)。对照旧版本结果时使用新的输出目录或样本名。
