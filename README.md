# tuktuk-tracker

Student ID: COBSCCOMP4Y241P-035

This is my coursework project for NB6007CEM - Web API Development. 
Built a REST API for Sri Lanka Police to track tuk-tuks across provinces and districts.

## Live Links
- API: https://tuktuk-tracker-production.up.railway.app
- Swagger: https://tuktuk-tracker-production.up.railway.app/api-docs

## What it does
- Police officers can log in and track tuk-tuks in their area
- Tuk-tuk devices submit GPS pings every 30 mins
- Admin can see all vehicles across Sri Lanka
- You can filter by province or district
- Full movement history with date filtering

## Built with
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT for auth
- Swagger for docs
- Deployed on Railway

## How to run locally

```bash
npm install
npm run seed
npm run dev
```

Need a `.env` file with:

MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
PORT=3000

## Test logins
- admin / admin123
- officer1 / officer123  
- device1 / device1

## Database has
- 9 provinces, 24 districts, 25 police stations
- 200 registered tuk-tuks
- 67,400 location pings (1 week of data)
