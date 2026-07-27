#!/bin/bash
mkdir -p apps/api/dist
echo "=== Build Environment Diagnostics ===" > apps/api/dist/build-info.txt
date >> apps/api/dist/build-info.txt
echo "Current directory: $(pwd)" >> apps/api/dist/build-info.txt
echo "Python3 path: $(which python3)" >> apps/api/dist/build-info.txt
echo "Python3 version: $(python3 --version 2>&1)" >> apps/api/dist/build-info.txt
echo "Pip3 path: $(which pip3)" >> apps/api/dist/build-info.txt

# Create venv
python3 -m venv .venv 2>&1 >> apps/api/dist/build-info.txt
if [ -d ".venv" ]; then
  echo "Virtual env created successfully at .venv" >> apps/api/dist/build-info.txt
  .venv/bin/pip install --upgrade pip >> apps/api/dist/build-info.txt 2>&1
  .venv/bin/pip install -r requirements.txt >> apps/api/dist/build-info.txt 2>&1
  
  # Test import
  .venv/bin/python -c "import PIL; print('PIL imported successfully')" >> apps/api/dist/build-info.txt 2>&1
else
  echo "Failed to create virtual env, attempting global/user pip install..." >> apps/api/dist/build-info.txt
  pip3 install -r requirements.txt --user >> apps/api/dist/build-info.txt 2>&1
fi

echo "=== System Binaries ===" >> apps/api/dist/build-info.txt
echo "Tesseract path: $(which tesseract 2>&1)" >> apps/api/dist/build-info.txt
echo "Pdftoppm path: $(which pdftoppm 2>&1)" >> apps/api/dist/build-info.txt
