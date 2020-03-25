#!/usr/bin/env bash
export PATH=~/.sonar/sonar-scanner-$SONAR_SCANNER_VERSION-linux/bin:$PATH
export SONAR_SCANNER_OPTS="-server"

cd ~/.sonar/sonar-scanner-$SONAR_SCANNER_VERSION-linux/bin
pwd

cd "$GITHUB_WORKSPACE"
sonar-scanner \
  -Dsonar.login="$SONAR_TOKEN" \
  -Dsonar.javascript.lcov.reportPaths=.coverage/lcov.info
