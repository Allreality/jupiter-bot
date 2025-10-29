#!/bin/bash
ARCHIVE_DIR="./archive"
mkdir -p "$ARCHIVE_DIR"

if [ "$1" = "protect" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ARCHIVE_NAME="jupiter-bot_${TIMESTAMP}"
    echo "🔒 Protecting project..."
    cp -r . "$ARCHIVE_DIR/$ARCHIVE_NAME" --exclude=node_modules --exclude=archive
    echo "✅ Protected: $ARCHIVE_NAME - $2"
elif [ "$1" = "list" ]; then
    echo "📋 Protected Versions:"
    ls -lt "$ARCHIVE_DIR"
else
    echo "Usage: ./claude-proof.sh protect 'description'"
    echo "       ./claude-proof.sh list"
fi
