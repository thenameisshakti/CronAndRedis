## How to Run the Project

### Prerequisites
- Node.js (v18+)
- MongoDB
- Redis 

### Steps
1. Clone the repository
   git clone <repo-url>

2. Install dependencies
   npm install

3. Setup environment variables
   Create a .env file with:
   PORT=4000
   MONGO_URI=<your_mongo_url>
   REDIS_URL=redis://localhost:6379
   ...................................look for the envsample to get the correct env

4. Start the server
   npm run dev

Server will run at:
http://localhost:4000

NOTE:
schema is visible in src/module/  folder - User,Team,Task
