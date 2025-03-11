#!/usr/bin/env bash

set -xe

source ~/.bashrc
VERSION=$1
REQUIREMENTS=$2

cat >pythons.txt <<EOF
$VERSION
$VERSION-venv
$VERSION-dev
EOF
/setup.packages.sh pythons.txt

ln -sf /usr/bin/$VERSION /usr/bin/python3
ln -sf /usr/bin/$VERSION /usr/bin/python

if [[ ! -f "/usr/local/include/$VERSION" ]]; then
  ln -sf /usr/include/$VERSION /usr/local/include/$VERSION
fi

curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
python3 -m pip install --no-cache-dir --upgrade pip

python3 -m pip install --no-cache-dir -r $REQUIREMENTS -U