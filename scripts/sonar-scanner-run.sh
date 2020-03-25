#!/usr/bin/env bash
export PATH=$HOME/.sonar/sonar-scanner-$SONAR_VERSION-linux/bin:$PATH
export SONAR_SCANNER_OPTS="-server"

cd "$GITHUB_WORKSPACE"
sonar-scanner \
  -Dsonar.login="$SONAR_TOKEN" \
  -Dsonar.javascript.lcov.reportPaths=.coverage/lcov.info
