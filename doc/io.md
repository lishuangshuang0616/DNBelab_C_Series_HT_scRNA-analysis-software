# 输出结果分析指南

**在 R 与 Python 中读取 dnbc4tools 输出数据**

[scRNA](#scrna-analysis) • [scATAC](#scatac-analysis)

## scRNA 分析 <a id="scrna-analysis"></a>

**R (Seurat)**

使用 `Read10X` 加载过滤后的基因表达矩阵。

```r
library(Seurat)
counts.data <- Read10X(data.dir = "/outs/filtered_feature_bc_matrix")
```

**Python (Scanpy)**

可使用 `h5ad` 文件或 MEX 矩阵目录读取数据。

**1. 读取 h5ad 格式（推荐）：**
```python
import scanpy as sc
adata = sc.read_h5ad('/outs/filtered_feature_bc_matrix.h5ad')
```

**2. 读取矩阵格式：**
```python
import scanpy as sc
adata = sc.read_10x_mtx('/outs/filtered_feature_bc_matrix')
```

## C6 多样本结果读取 <a id="c6-import"></a>

使用各样本目录进行独立分析；全局 filtered H5AD 只包含合并计数，不带联合 UMAP/聚类。原始计数保留用于下游归一化。

```python
import scanpy as sc
import pandas as pd

sample_dir = "/results/c6_run/outs/rna/per_sample_outs/S1"
adata = sc.read_10x_h5(f"{sample_dir}/filtered_feature_bc_matrix.h5")
# 全局完整表含背景，按有效标记选择；大表分块读取。
called_parts = []
for chunk in pd.read_csv("/results/c6_run/outs/rna/singlecell.csv.gz", chunksize=100_000):
    called = chunk["is_cell_barcode"].astype(str).str.lower().isin(["1", "true"])
    called_parts.append(chunk.loc[called])
called_cells = pd.concat(called_parts, ignore_index=True)
```

只需稀疏计数和基因/barcode 元数据时，可用 `sc.read_h5ad("/results/c6_run/outs/rna/filtered_feature_bc_matrix.h5ad")`。跨样本关联使用完整 barcode/probe 后缀，避免只用 bead 前缀混淆样本。

## scATAC 分析 <a id="scatac-analysis"></a>

ATAC 默认矩阵计数是 cutsite；元数据中的 `peak_region_fragments` 和 `peak_region_cutsites` 是不同统计。将 metadata 与过滤矩阵关联时按 barcode 索引重排，不依赖行序。BAM 索引可为 BAI 或 CSI。

**R (Signac)**

加载过滤后的 peak 矩阵并创建 Seurat 对象。

```r
require(magrittr)
require(readr)
require(Matrix)
require(tidyr)
require(dplyr)
library(Signac)
library(Seurat)

# 读取 dnbc4tools ATAC 输出的函数
read_signac_C4 <- function(mex_dir_path, fragments, singlecellmetadata){
    mtx_path <- paste(mex_dir_path, "matrix.mtx.gz", sep = '/')
    feature_path <- paste(mex_dir_path, "peaks.bed.gz", sep = '/')
    barcode_path <- paste(mex_dir_path, "barcodes.tsv.gz", sep = '/')

    features <- readr::read_tsv(feature_path, col_names = F) %>% tidyr::unite(feature)
    barcodes <- readr::read_tsv(barcode_path, col_names = F) %>% tidyr::unite(barcode)

    mtx <- Matrix::readMM(mtx_path) %>%
    magrittr::set_rownames(features$feature) %>%
    magrittr::set_colnames(barcodes$barcode)

    metadata <- read.csv(
        file = singlecellmetadata,
        header = TRUE,
        row.names = 1
    )

    chrom_assay <- CreateChromatinAssay(
        counts = mtx,
        sep = c("_", "_"),
        fragments = fragments,
        min.cells = 10,
        min.features = 200
    )

    scATAC <- CreateSeuratObject(
        counts = chrom_assay,
        assay = "peaks",
        meta.data = metadata
    )
    return(scATAC)
}
```

**R (ArchR)**

使用 `fragments.tsv.gz`（原始片段）或 `filtered.fragments.tsv.gz`（细胞过滤后片段）创建 Arrow 文件。

**说明：**

- 仅使用 ArchR 过滤： 指向原始 `fragments.tsv.gz`，并使用 `filterTSS`/`filterFrags` 阈值控制过滤。
- 联合过滤： 指向 dnbc4tools 细胞过滤后的 `filtered.fragments.tsv.gz`，再叠加 ArchR 阈值过滤。

```r
# 方案 A：仅使用 ArchR 过滤（原始 fragments）
library(ArchR)
ArrowFiles <- createArrowFiles(
  inputFiles = "/outs/fragments.tsv.gz",
  sampleNames = "MySample",
  filterTSS = 4,
  filterFrags = 1000,
  addTileMat = TRUE,
  addGeneScoreMat = TRUE
)
```

```r
# 方案 B：先用 dnbc4tools 细胞过滤 fragments，再用 ArchR 过滤
library(ArchR)
ArrowFiles <- createArrowFiles(
  inputFiles = "/outs/filtered.fragments.tsv.gz",
  sampleNames = "MySample",
  filterTSS = 4,
  filterFrags = 1000,
  addTileMat = TRUE,
  addGeneScoreMat = TRUE
)
```

**Python (AnnData)**

将过滤后的 peak 矩阵加载为 AnnData 对象。

```python
import os
from scipy.sparse import csr_matrix
import anndata
import pandas as pd
import scipy.io
import scipy.sparse

def read_atac_C4(path):
    mtx_path = os.path.join(path, "matrix.mtx.gz")
    barcode_path = os.path.join(path, "barcodes.tsv.gz")
    feature_path = os.path.join(path, "peaks.bed.gz")

    obs = pd.read_csv(barcode_path, header=None, index_col=0, sep="\t")
    obs.index.name = "barcode"

    var = pd.read_csv(feature_path, header=None, sep="\t")
    var.columns = ['chrom', 'chromStart', 'chromEnd']
    var.index = var['chrom'].astype(str) + ':' + var['chromStart'].astype(str) + '-' + var['chromEnd'].astype(str)
    var.index.name = "peak"

    mtx = csr_matrix(scipy.io.mmread(mtx_path).T)

    adata = anndata.AnnData(mtx, obs=obs, var=var)
    adata.var_names_make_unique()
    return adata
```

## 常见输出文件 <a id="common-output-files"></a>

| 文件 / 目录 | 说明 | 分析类型 |
| :--- | :--- | :--- |
| `filtered_feature_bc_matrix/` | 过滤后的基因表达矩阵（MEX 格式）。 | scRNA-seq |
| `filtered_peak_bc_matrix/` | 过滤后的 peak 可及性矩阵（MEX 格式）。 | scATAC-seq |
| `filtered_feature_bc_matrix.h5ad` | AnnData 格式过滤矩阵（适用于 Python）。 | scRNA-seq |
| `fragments.tsv.gz` | ATAC 分析片段文件。 | scATAC-seq |
| `singlecell.csv` | 细胞元信息与质控指标。 | 全部 |

*详细输出说明见 [输出文件文档](./outs/outs.md)*
