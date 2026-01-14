#!/bin/bash
# Load .env and start the application
set -a
source .env
set +a
./mvnw spring-boot:run
