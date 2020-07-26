#!/bin/bash -e

mkdir -p build
stylus -o build src
coffee -o build src
