# WaterNearMe: Mapping out Australia's water fountains

**WaterNearMe** is an all-in-one app designed to help you locate your nearest water fountain, and contribute to the largest database of water fountains in Australia - completely for free! This was my app attempt for the Premiers Coding Competition QLD 2025.

You can access **WaterNearMe** at https://waternearme.au

## Tech stack

- Next.js - App framework
- Auth.js - Authentication
- Resend - Emails
- MySQL Server w/ Prisma
- MapLibre GL - Map library
- Shadcn/ui - UI framework
- TileServer GL - Map tile server

## Self hosting

**WaterNearMe** is broken up into 2 parts: The tile server and main Next.js app.

For the Tile Server, you can use the existing one at https://tiles.linus.id.au or self host TileServer GL using docker. All the tile server info is in ``WaterNearMe/TileServer``. Please note that you will need to add your own ``.mbtiles`` file for the map data inside ``/data``.

### Cloning repo

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

Access **WaterNearMe** at https://localhost:3000.

## License

**WaterNearMe** is under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)**. See [LICENSE](LICENSE) file for more details.

## Credit

**WaterNearMe** is a project by **Linus Kang**.
