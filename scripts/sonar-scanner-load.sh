#!/usr/bin/env bash
curl --create-dirs -sSLo ~/.sonar/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-"$SONAR_SCANNER_VERSION"-linux.zip
unzip ~/.sonar/sonar-scanner.zip -d ~/.sonar/

echo 'ls ~/.sonar'
ls ~/.sonar

cd ~/
echo 'pwd'
pwd
echo 'ls -a'
ls -a

rm ~/.sonar/sonar-scanner.zip
