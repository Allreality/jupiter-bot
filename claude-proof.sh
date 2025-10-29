#!/bin/bash
ARCHIVE_DIR="./archive"
mkdir -p "$ARCHIVE_DIR"

if [ "$1" = "protect" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ARCHIVE_NAME="jupiter-bot_${TIMESTAMP}"
    DESCRIPTION="$2"
    
    echo "🔒 Protecting project..."
    
    # Create archive directory
    mkdir -p "$ARCHIVE_DIR/$ARCHIVE_NAME"
    
    # Copy files, excluding node_modules and archive
    rsync -av --exclude 'node_modules' --exclude 'archive' --exclude '.git' . "$ARCHIVE_DIR/$ARCHIVE_NAME/"
    
    # Log the protection
    echo "[$(date)] Protected: $ARCHIVE_NAME - $DESCRIPTION" >> "$ARCHIVE_DIR/protection.log"
    
    echo "✅ Protected: $ARCHIVE_NAME"
    echo "   Description: $DESCRIPTION"
    
elif [ "$1" = "list" ]; then
    echo "📋 Protected Versions:"
    if [ -f "$ARCHIVE_DIR/protection.log" ]; then
        cat "$ARCHIVE_DIR/protection.log"
    else
        echo "No protections yet."
    fi
else
    echo "Usage:"
    echo "  ./claude-proof.sh protect 'description'"
    echo "  ./claude-proof.sh list"
fi
