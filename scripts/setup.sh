#!/bin/bash

echo "🚀 Setting up Swinfy LMS Project..."

# Check if PostgreSQL 16 is running
echo "📊 Checking PostgreSQL 16 status..."
if ! pg_isready -q; then
    echo "❌ PostgreSQL 16 is not running. Please start PostgreSQL 16 first."
    echo "   On macOS: brew services start postgresql@16"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

# Create database
echo "🗄️ Creating PostgreSQL 16 database..."
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb -U postgres swinfy_lms 2>/dev/null || echo "Database already exists or could not be created"

# Setup frontend
echo "⚛️ Setting up React frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"

# Setup backend
echo "🐍 Setting up Django backend..."
cd ..
source .venv/bin/activate
pip install -r backend/requirements.txt
echo "✅ Backend dependencies installed"

# Run Django migrations
echo "🔄 Running Django migrations..."
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
cd backend
python manage.py makemigrations
python manage.py migrate
echo "✅ Database migrations completed"

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
python manage.py createsuperuser --noinput --username admin --email admin@swinfy.com || echo "Superuser already exists"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the frontend: cd frontend && npm run dev"
echo "2. Start the backend: source .venv/bin/activate && export PATH='/opt/homebrew/opt/postgresql@16/bin:\$PATH' && cd backend && python manage.py runserver"
echo "3. Open http://localhost:3000 for frontend"
echo "4. Open http://localhost:8000 for backend"
echo ""
echo "🔑 Default admin credentials:"
echo "   Username: admin"
echo "   Email: admin@swinfy.com"
echo "   Password: (you'll be prompted to set this)"
echo ""
echo "📊 PostgreSQL 16 is running and configured!"
echo "🐍 Virtual environment is in the root directory: ./.venv/"
echo "Happy coding! 🚀"
