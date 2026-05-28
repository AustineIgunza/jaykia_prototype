#!/bin/sh

npm run migrations

exec npx tsx Server.ts