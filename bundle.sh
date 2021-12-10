#!/usr/bin/bash
rollup setup.js --file setup_bundle.js --format cjs
rollup cleanup.js --file cleanup_bundle.js --format cjs

