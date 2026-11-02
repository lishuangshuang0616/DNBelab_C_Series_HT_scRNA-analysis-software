# Parameter reference

Choose a module to find commands, defaults and configuration rules. Each reference starts with examples; full help and advanced options can be expanded when needed.

| Module | Commands | Reference |
| :--- | :--- | :--- |
| RNA | `rna run`, `rna mkref`, `rna multi` | [RNA parameters](scRNA.md) |
| ATAC | `atac run`, `atac mkref`, `atac multi` | [ATAC parameters](scATAC.md) |
| V(D)J | `vdj run` | [VDJ parameters](scVDJ.md) |
| Multi / C6 | `multi run`, configured by CSV | [Multi parameters](multi.md) |
| GTF tools | `tools mkgtf` | [Tools](tools.md) |

## Choose an entry point

- Use a module's `run` for an independent library.
- `rna multi` / `atac multi` only generate sample scripts. Execute them after successful generation.
- `multi run` executes multi-omics or C6 analysis. C6 requires a real scRNAC6 library and `[samples]` configuration.

## Before configuring

Omitting an option normally uses its workflow default; not every option accepts the string `auto`. CLI boolean switches take no value; Multi CSV uses `true/false`. See each reference for global and sample-override rules.

[Workflows](../pipeline/pipeline.md) · [Outputs](../outs/outs.md) · [Quick Start](../quickstart.md)
