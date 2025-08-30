## Getting started

> Please ensure you have completed the steps to getting a Tile Server! **WaterNearMe** will not run without one.

```bash
git clone https://github.com/linuskang/waternearme
cd waternearme
cd App
cp .env.example .env # edit values
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```