#!/bin/bash

if [[ ! `which koyeb` ]]; then
  echo "Installing latest CLI"
  if [[ `uname` == "Darwin" ]]; then
    # Fetch latest release URL for macOS from GitHub
    LATEST_RELEASE_URL=$(curl -s https://api.github.com/repos/koyeb/koyeb-cli/releases/latest | grep 'http.*koyeb-cli-darwin-x86_64' | awk '{print $2}' | sed 's|[\"\,]*||g')
  else
    # Fetch latest release URL for Linux from GitHub
    LATEST_RELEASE_URL=$(curl -s https://api.github.com/repos/koyeb/koyeb-cli/releases/latest | grep 'http.*koyeb-cli-linux-x86_64' | awk '{print $2}' | sed 's|[\"\,]*||g')
  fi
  # Install latest version as /usr/local/bin/koyeb
  curl -sL $LATEST_RELEASE_URL -o /usr/local/bin/koyeb
  chmod +x /usr/local/bin/koyeb
fi

for i in deps/*; do
  type=`basename ${i} | awk -F. '{ print $1 }'`
  koyeb create $type -f $i 
done
