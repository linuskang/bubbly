# Bubbly: Mapping out Australia's water fountains

**Bubbly** is an all-in-one app designed to help you locate your nearest water fountain. Open sourced.

You can access **Bubbly** at https://bubbly.linuskang.au.

## Tech stack

- Next.js - App framework
- Auth.js - Authentication
- Resend - Emails
- MySQL Server w/ Prisma
- MapLibre GL - Map library
- Shadcn/ui - UI framework
- TileServer GL - Map tile server

## Self hosting

To self host **Bubbly**, clone the repository and follow the steps below.

```bash
git clone https://github.com/linuskang/bubbly
```

### Tile server

If you already have a map tile server, you can skip this step and move onto app hosting.

```bash
cd TileServer
cd data # add your .mbtiles and styling here
cd ..
sudo docker compose up # access at 0.0.0.0:8080
```

### App

Setup your MySQL database:

```bash
sudo mysql
create database Bubbly;
```

After, install the app dependencies.

```bash
cd App
cp .env.example .env # edit values to your own
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Access **Bubbly** at https://localhost:3400.

## License

**Bubbly** is under **CC BY-NC 4.0**. See [LICENSE](LICENSE) for more details.

## Credit

**Bubbly** is a project by **Linus Kang**. For any enquiries, please reach out at **email@linus.id.au**
