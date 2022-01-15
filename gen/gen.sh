#!/bin/sh
tsn="node -r ts-node/register/transpile-only"

$tsn ./gen/env.ts
echo "🚀 Generated environment variable types.."

$tsn ./gen/sharedTypes.ts
echo "🚀 Shared types with client.."
