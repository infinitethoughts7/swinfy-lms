#!/bin/bash

echo "🔧 Environment Setup Script for Swinfy LMS"
echo "=========================================="

# Check if .env file exists
if [ -f "backend/.env" ]; then
    echo "✅ .env file already exists in backend/"
else
    echo "❌ .env file not found in backend/"
    echo "Creating from .env.example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env from .env.example"
        echo "⚠️  Please edit backend/.env with your actual values"
    else
        echo "❌ .env.example not found. Please create backend/.env manually"
    fi
fi

echo ""
echo "📋 Current Environment Variables:"
echo "================================="

# Show current .env contents (without sensitive data)
if [ -f "backend/.env" ]; then
    echo "🔍 .env file contents:"
    cat backend/.env | grep -v "PASSWORD\|SECRET\|KEY" | grep -v "^$"
    echo ""
    echo "🔒 Sensitive variables (PASSWORD, SECRET, KEY) are hidden"
else
    echo "No .env file found"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Edit backend/.env with your actual values"
echo "2. Run: npm run setup"
echo "3. Start development: npm run backend"
echo ""
echo "💡 Tip: Never commit .env files to version control!"
