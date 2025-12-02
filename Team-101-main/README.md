# ReLink - Setup Guide

ReLink is a digital identity platform that helps unhoused individuals build trust and access housing, healthcare, and employment through secure, verifiable digital credentials.

## Prerequisites

- Python 3.9+
- Node.js 18+ and npm
- MySQL 8.0+
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone git@github.com:BigDataForSanDiego/Team-101.git
cd Team-101
```

### 2. Database Setup

#### Install MySQL (if not already installed)

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

#### Create Database and User

```bash
mysql -u root -p
```

Run the following SQL commands:

```sql
CREATE DATABASE relink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'relink'@'localhost' IDENTIFIED BY 'relinkpass';
GRANT ALL PRIVILEGES ON relink.* TO 'relink'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Backend Setup

#### Navigate to backend directory

```bash
cd backend
```

#### Create and activate virtual environment

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

#### Install dependencies

```bash
pip install -r requirements.txt
```

#### Configure environment variables

The `.env` file should already exist with:

```env
APP_NAME="ReLink Backend"
ENV="dev"
API_V1_PREFIX="/api/v1"
DATABASE_URL="mysql+mysqlconnector://relink:relinkpass@127.0.0.1:3306/relink"
```

If you changed the database credentials, update the `DATABASE_URL` accordingly.

#### Initialize database tables

The application will automatically create tables on first run. To manually run migrations:

```bash
python migrate_db.py
```

#### Seed database with sample data

Populate the database with sample organizations, admins, participants, employers, announcements, certifications, and training sessions:

```bash
python seed_db.py
```

This will create:
- 2 Organizations
- 3 Admin users
- 5 Participants
- 3 Employers
- 4 Announcements
- 5 Certifications
- 5 Training sessions
- 8 Training registrations

**Sample credentials after seeding:**

Admin Users:
- `admin@relink.com` / `admin123`
- `staff@relink.com` / `staff123`
- `admin2@relink.com` / `admin123`

Employers:
- `robert@techsolutions.com` / `employer123`
- `lisa@greenvalley.com` / `employer123`
- `james@cityconstruction.com` / `employer123`

> **Note:** Change passwords immediately after first login in production!
> **Note:** If you prefer to start with an empty database, skip the seed step and manually add data through the UI.

#### Start the backend server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### 4. Frontend Setup

Open a new terminal window/tab.

#### Navigate to frontend directory

```bash
cd fe
```

#### Install dependencies

```bash
npm install
```

#### Configure environment variables

The `.env.local` file should already exist. If not, create it:

```env
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Start the frontend development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### First Time Setup

1. **Login as Admin**
   - Navigate to `http://localhost:3000`
   - Click "Admin Login"
   - Use credentials: `admin@relink.com` / `admin123` (if you ran the seed script)

2. **Add Participants**
   - From admin dashboard, click "Add New Individual"
   - Fill in participant details
   - Upload face image for biometric verification
   - System generates unique ReLink ID and QR code

3. **Add Employers** (Optional)
   - Create employer accounts from admin panel
   - Employers can view participant profiles and add reviews

4. **Manage Documents, Certifications, and Trainings**
   - Upload documents for participants
   - Add skill certifications
   - Track training completions

### Running the Application

Always ensure both servers are running:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python seed_db.py  # Optional: Only needed once to populate sample data
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd fe
npm run dev
```

## Project Structure

```
Team-101/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── routers/     # API endpoints
│   │   ├── models.py    # Database models
│   │   ├── schemas.py   # Pydantic schemas
│   │   └── main.py      # Application entry point
│   ├── uploads/         # Uploaded files storage
│   └── requirements.txt # Python dependencies
├── fe/                  # Next.js frontend
│   ├── src/
│   │   └── app/        # Pages and components
│   └── package.json    # Node dependencies
└── README.md           # This file
```

## ER Diagram 

<img width="3994" height="3818" alt="ER_Diagram" src="https://github.com/user-attachments/assets/167268df-7202-4b8d-b79e-28b4cbb2e685" />



## Key Features

- **Digital Identity Management**: Secure participant profiles with biometric verification
- **Document Storage**: Upload and manage personal documents
- **Skill Tracking**: Record certifications and training completions
- **Employer Reviews**: Verified testimonials from employers
- **QR Code Access**: Quick profile verification via QR codes
- **Role-Based Access**: Separate interfaces for admins, employers, and participants

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running: `mysql -u relink -p`
- Check credentials in `backend/.env`
- Ensure database exists: `SHOW DATABASES;`

### Backend Won't Start

- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is not in use: `lsof -i :8000`

### Frontend Won't Start

- Clear cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check port 3000 is not in use: `lsof -i :3000`

### Face Recognition Issues

- Ensure OpenCV and DeepFace are properly installed
- Check uploaded images are clear and contain faces
- Verify TensorFlow installation: `python -c "import tensorflow; print(tensorflow.__version__)"`

## Development

### Adding New Features

1. Backend: Add routes in `backend/app/routers/`
2. Frontend: Add pages in `fe/src/app/`
3. Update models in `backend/app/models.py` if database changes needed

### Database Migrations

After modifying models, create and run migrations:

```bash
cd backend
python migrate_db.py
```

## Production Deployment

For production deployment:

1. Change default admin password
2. Use strong database credentials
3. Set `ENV=production` in backend `.env`
4. Use proper SSL certificates
5. Configure CORS settings appropriately
6. Use production-grade database (not localhost)
7. Set up proper backup strategies

## Support

For issues or questions, refer to:
- Project proposal: `README-2.md`
- API documentation: `http://localhost:8000/docs`

## License

Big Data Hackathon 2025 - Team 101
