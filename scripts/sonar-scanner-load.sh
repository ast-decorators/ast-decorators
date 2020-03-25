#!/usr/bin/env bash
curl --create-dirs -sSLo ~/.sonar/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-"$SONAR_SCANNER_VERSION"-linux.zip
unzip ~/.sonar/sonar-scanner.zip -d ~/.sonar/

ls ~/.sonar

cd ~/
pwd
ls

rm ~/.sonar/sonar-scanner.zip
