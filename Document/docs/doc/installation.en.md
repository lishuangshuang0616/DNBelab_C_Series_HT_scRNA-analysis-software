# Installation

[Requirements](#system-requirements) · [Release status](#software-download) · [Installation and checks](#installation-process)

## Requirements <a id="system-requirements"></a>

| Area | Requirement |
| :--- | :--- |
| Production platform | Linux x86-64; native executables must match the deployment platform |
| Memory and CPUs | Plan for dataset, reference and sample count. Retain the 3.1 starting guidance of 50 GB RAM and 8 cores; 128 GB and 16+ cores for larger tasks |
| Storage | Space for FASTQs, references, matrices, BAM and intermediate files; SSD recommended |
| Python | Source and lightweight CLI support Python 3.8+; use a validated, locked scientific environment |
| ATAC dependencies | MACS2, bgzip and tabix must be available; a full directory release may bundle these tools |

## 3.2 release status <a id="software-download"></a>

This manual follows the 3.2 source, whose change log still marks changes as unreleased. The formal package, download URL, size, release date and checksums await confirmation. Renaming a 3.1 archive does not install 3.2.

Use the launcher provided by your complete 3.2 release directory. For the 3.1 download and instructions, select 3.1 in the header. See [Previous Installation](installation_previous.md) for earlier versions.

## Installation and checks <a id="installation-process"></a>

### Complete directory releases

Keep the Python package, configuration, report templates, native executables under `software/`, and their manifest together. The source builder creates `bin/dnbc4tools`; deployment layouts may also provide an outer `dnbc4tools` launcher. Use the entry point actually supplied.

```bash
/path/to/dnbc4tools-release/bin/dnbc4tools --version
/path/to/dnbc4tools-release/bin/dnbc4tools --help
/path/to/dnbc4tools-release/bin/dnbc4tools multi run --help
```

The version should be `3.2`. Successful help output checks the entry point, not a complete analysis.

### Assemble a directory release (maintainers)

Run in the `dnbc4tools_py` source root using a validated analysis environment:

```bash
python -m pip install -r requirements-runtime.txt
python scripts/build_release.py . /path/to/dnbc4tools-release
python scripts/check_release.py /path/to/dnbc4tools-release   --launcher /path/to/dnbc4tools-release/bin/dnbc4tools   --require-clean-source --require-runtime-tools
```

The destination must not exist. The builder copies configuration, templates and software and generates a launcher. Build native executables for the target Linux platform first, synchronize them, and update their sizes, SHA-256 values and source identities in the manifest.

Additional C6 interface checks:

```bash
python scripts/check_release.py /path/to/dnbc4tools-release   --require-c6-optimizations
```

These checks validate bundle contents and interfaces, not real-data equivalence. Compressed summaries also require `c4_summary --gzip`. BAM scheduling, matrix and VDJ input changes need matched native tools; Python updates alone are insufficient.

## Start an analysis <a id="verification--testing"></a>

See [Quick Start](quickstart.md), [Upgrade Guide](migration.md) and [Running & Troubleshooting](troubleshooting.md). Use new output directories or sample names for version comparisons.
