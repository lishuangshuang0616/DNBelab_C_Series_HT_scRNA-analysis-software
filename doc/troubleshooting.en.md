# Running & Troubleshooting

## Before running

Confirm `dnbc4tools --version` is `3.2`, validate paired FASTQs, reference and chemistry, and deploy native tools matched to Python. Logs are under `<outdir>/<name>/logs/`. RNA, ATAC and VDJ write compact startup information to `preflight.json`. Existing processing/output trees are recorded there; choose a new sample name for a fresh analysis.

`rna multi` / `atac multi` only generate `.sh` files in the working directory and do not initialize analysis logs. `multi run` executes analysis with logs. Batch lists use TAB-separated columns, `;` between R1/R2 and `,` between same-end lane files. Execute scripts only after generation succeeds. Malformed lists, duplicate samples, colliding script names and existing scripts fail explicitly. Move old scripts before regenerating them.

## Error messages

`Error ID` identifies one error occurrence; `Error code` identifies a broad category. Retain terminal output, command, configuration CSV and `logs/errors.jsonl`.

| Error code | First checks |
| :--- | :--- |
| `CLI-CONFIG` | Option names/types, required values and configuration sections |
| `INPUT` | FASTQ/barcode/matrix paths, permissions, pairing and completeness |
| `REFERENCE` | FASTA, GTF, STAR/Chromap indexes and reference configuration |
| `TOOL` | Stage log, external command, matched native/Python interfaces |
| `OUTPUT` | Output path, free space, permissions and artifact integrity |
| `INTERRUPTED` | Interruption cause and recoverable stages |
| `INTERNAL` | Retain Error ID, traceback and structured logs for investigation |

## Existing artifact checks (advanced)

This internal diagnostic is omitted from normal top-level help but can be called directly:

```bash
dnbc4tools validate-artifacts --sample-dir /path/to/sample --level shallow
dnbc4tools validate-artifacts --sample-dir /path/to/sample --level deep   --json /path/to/artifact-validation.json
```

`shallow` performs lightweight checks; `deep` scans full file contents. An empty directory can report success after checking zero files, which does not prove analysis completeness. This is not real-data acceptance testing.

## Interruption, recovery and empty results

A run lock prevents simultaneous analysis in the same directory. Check the original job before handling a lock conflict; forced unlocking is not a normal retry procedure. Advanced `--resume` reuses checkpoints only when input, configuration, tool identity and output validation permit it. File existence alone does not prove completion. Recovery switches `--keep-empty` and `--force-unlock` are recorded in run state.

Zero cells, sample failure and analysis not run are distinct states. C6 records failures and continues other samples by default; review `sample_failure_policy` and per-sample status. Regenerating HTML cannot restore missing matrices or H5AD files. See the [Upgrade Guide](migration.md) for BAM and output-name changes.
