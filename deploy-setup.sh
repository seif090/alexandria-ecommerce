#!/bin/bash

# Alexandria Ecommerce - Vercel Deployment Script
# This script helps prepare your project for Vercel deployment

set -e

echo "🚀 Alexandria Ecommerce - Vercel Deployment Setup"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Git
echo -e "${BLUE}✓ Checking Git setup...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git not installed. Please install Git first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git is installed${NC}"

# Check Node
echo -e "${BLUE}✓ Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not installed. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"

# Check npm
echo -e "${BLUE}✓ Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd backend
echo -e "${BLUE}Installing backend dependencies...${NC}"
npm install
cd ../frontend
echo -e "${BLUE}Installing frontend dependencies...${NC}"
npm install
cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Check environment files
echo -e "${BLUE}✓ Checking environment files...${NC}"
if [ ! -f "backend/.env.production.template" ]; then
    echo -e "${YELLOW}⚠ backend/.env.production.template not found${NC}"
fi
if [ ! -f "frontend/.env.production.template" ]; then
    echo -e "${YELLOW}⚠ frontend/.env.production.template not found${NC}"
fi
echo ""

# Check Vercel config
echo -e "${BLUE}✓ Checking Vercel configuration...${NC}"
if [ ! -f "backend/vercel.json" ]; then
    echo -e "${RED}✗ backend/vercel.json not found${NC}"
else
    echo -e "${GREEN}✓ backend/vercel.json found${NC}"
fi
if [ ! -f "frontend/vercel.json" ]; then
    echo -e "${RED}✗ frontend/vercel.json not found${NC}"
else
    echo -e "${GREEN}✓ frontend/vercel.json found${NC}"
fi
echo ""

# Initialize git if needed
echo -e "${BLUE}✓ Checking git repository...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠ Not a git repository. Initializing...${NC}"
    git init
    echo -e "${GREEN}✓ Git repository initialized${NC}"
else
    echo -e "${GREEN}✓ Git repository already exists${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Create/Setup MongoDB Atlas account"
echo "2. Get MongoDB connection string"
echo "3. Copy environment templates:"
echo "   - backend/.env.production.template → Add to Vercel"
echo "   - frontend/.env.production.template → Add to Vercel"
echo "4. Push code to GitHub:"
echo "   ${YELLOW}git add .${NC}"
echo "   ${YELLOW}git commit -m 'Initial commit'${NC}"
echo "   ${YELLOW}git push -u origin main${NC}"
echo "5. Read VERCEL_DEPLOYMENT_GUIDE.md for detailed steps"
echo ""
echo -e "${GREEN}Happy Deploying! 🚀${NC}"
