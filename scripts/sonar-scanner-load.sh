#!/usr/bin/env bash
curl --create-dirs -sSLo "$HOME"/.sonar/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-"$SONAR_SCANNER_VERSION"-linux.zip
unzip "$HOME"/.sonar/sonar-scanner.zip -d "$HOME"/.sonar/

rm "$HOME"/.sonar/sonar-scanner.zip
