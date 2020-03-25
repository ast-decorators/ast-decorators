#!/usr/bin/env bash
export SONAR_SCANNER_HOME=~/.sonar/sonar-scanner-$SONAR_SCANNER_VERSION-linux

export PATH=$SONAR_SCANNER_HOME/bin:$PATH
export SONAR_SCANNER_OPTS="-server"

cd "$GITHUB_WORKSPACE"
sonar-scanner \
  -Dsonar.login="$SONAR_TOKEN" \
  -Dsonar.javascript.lcov.reportPaths=.coverage/lcov.info
