#!/usr/bin/env bash

output=$(ember build 2>&1)
outputExitCode=$?

if [ $outputExitCode -eq 0 ]; then
  echo "Expected build command to fail but it succeeded; test failed"
  exit 1
else
  echo "Build command failed as expected"
fi

if [[ "$output" == *"cannot be nested"* ]]; then
  echo "Error log included expected message"
  exit 0
else
  echo "Error log did not include expected message, was:"
  echo $output
  exit 1
fi
