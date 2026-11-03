# DNBelab C Series™ 软件安装指南

本指南介绍 DNBelab C Series™ HT 单细胞分析软件（dnbc4tools）的系统环境要求、安装包获取、解压部署与功能验证方法。

## 环境要求 <a id="system-requirements"></a>

运行 dnbc4tools 需要满足以下基础运行环境：

| 配置项 | 最低要求 | 推荐配置 | 说明 |
| :--- | :--- | :--- | :--- |
| **操作系统** | 64 位 Linux | CentOS 7.x+ / Ubuntu 20.04+ | 兼容主流 64 位 Linux 发行版 |
| **CPU / 架构** | 8 核（x86-64） | 16 核及以上 | 需支持 x86-64 架构处理器 |
| **内存 (RAM)** | 50 GB | 128 GB 及以上 | 实际资源消耗依据分析样本数与数据量而定 |
| **磁盘存储** | 保证项目数据空间 | 高速 NVMe / SSD | 用于存放 FASTQ、参考基因组与分析中间结果 |

---

## 软件下载 <a id="software-download"></a>

### dnbc4tools 3.2

*dnbc4tools* 以自包含的 `tar.gz` 软件包形式发布，内置全套预编译依赖，无需复杂配置即可在主流 Linux 系统中开箱即用。

* **软件包名称**：`dnbc4tools-3.2.tar.gz`（Linux x86-64）
* **发布状态**：待正式发布提供下载链接与校验值

```bash
# 使用 wget 下载（待正式发布提供链接）
wget -O dnbc4tools-3.2.tar.gz "<下载链接>"

# 使用 curl 下载
curl -o dnbc4tools-3.2.tar.gz "<下载链接>"
```

<div style="margin-top: 15px;">
  <strong>需要历史版本？</strong><br>
  3.1 完整文档可通过顶部版本菜单切换查阅；更早版本下载和安装说明请参考 <a href="./installation_previous.md">历史版本安装指南</a>。
</div>

---

## 安装流程 <a id="installation-process"></a>

### 第一步：解压安装包

将安装包解压到您的目标安装目录（示例为 `/opt/software`）：

```bash
# 进入目标安装目录
cd /opt/software

# 解压安装包
tar -xzvf dnbc4tools-3.2.tar.gz
```

### 第二步：确认目录结构

解压完成后，软件包目录结构如下：

```text
dnbc4tools3.2/
├── dnbc4tools          # 主程序可执行入口
├── external/           # 内置第三方工具依赖
├── lib/                # 动态链接库文件
├── misc/               # 配置文件与辅助资源
└── sourceC4.bash       # 环境变量配置脚本
```

---

## 安装验证 <a id="verification--testing"></a>

### 基础功能测试

进入解压目录，直接执行主程序验证安装状态：

```bash
# 进入程序目录
cd /opt/software/dnbc4tools3.2

# 运行主程序查看帮助信息
./dnbc4tools
```

命令成功输出如下版本与帮助信息即代表安装就绪：

```text
dnbc4tools 3.2

Single-cell analysis toolkit for RNA, ATAC, V(D)J, and multi-omics workflows

Usage: dnbc4tools <COMMAND>

Commands:
  
    rna          Single-cell RNA-seq analysis
    atac         Single-cell ATAC-seq analysis
    vdj          Single-cell V(D)J immune profiling
    tools        Utility commands and file processing
    multi        Integrated multi-omics analysis

Options:
  -h, --help     show this help message and exit
  -v, --version  show program's version number and exit
```

安装验证完成后，即可参考[快速开始](./quickstart.md)开始您的第一个单细胞分析任务。
