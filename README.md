# Bubbly: Mapping out Australia's water fountains

<img width="2556" height="1274" alt="image" src="https://github.com/user-attachments/assets/5f732818-b3c7-4ec8-aa6b-c344a211f938" />

**Bubbly** is an all-in-one app designed to help you locate your nearest water fountain, with our code open sourced. This was my submission for the *2025 Premier Coding Comp* in Australia.

You can access **Bubbly** at https://bubbly.linuskang.au.

> [!TIP]
> Have you noticed anything broken on the site? I'm here to help! Please reach out at email@linus.id.au for anything you find!
> 
> Additionally, check my [status page](https://status.linuskang.au) for any outage updates on my site.

## About the platform

### The problem

I first realised the challenge of accessing clean water at this year’s Ekka, when I struggled to find a water bubbler to refill my bottle. This experience made me wonder why there wasn’t a simple, reliable way to locate water fountains in public spaces.

After researching, I discovered two major problems with existing solutions:

- Most platforms rely on static or community-generated databases that are rarely maintained, leading to inaccurate locations.

- Many existing tools have clunky interfaces or lack mobile optimisation, making them difficult to use in the moment.

- While there may be site maps of fountains for locations like malls, they are very limited in range, normally just detailing a specific area.

These issues make it unnecessarily hard for everyday people to find nearby water bubblers quickly and confidently.

----

### My proposed solution

To address these problems, I developed a platform called Bubbly, which aims to centralise and simplify access to clean drinking water across Australia. Through my app, users can:

- Search for nearby bubblers using an intuitive, map-based interface.

- Check reviews and condition reports of existing bubblers to know if they are functional and clean.

- Contribute by adding new bubblers or updating the status of existing ones, ensuring the database stays accurate and up to date.

These are also the other features:

- Bookmarking fountians.
  
- AI Chatbot for questions.
  
- Viewing (guest) and posting reviews.
  
- Viewing contribution logs.
  
- Amenities viewer.
  
- Logging using Discord and Seq.
  
- User profile systems.
  
- XP tiering systems for accounts.

- Report abuse system for reviews, waypoints, and users.

Below are some videos of my app features:

The overview of each water fountain. Shows essential information.

<img width="2000" height="1500" alt="image" src="https://github.com/user-attachments/assets/839c6cac-2a0c-4aee-a7ef-c0957fd1a107" />

<img width="399" height="754" alt="image" src="https://github.com/user-attachments/assets/2b6cb4a3-f880-435b-85bc-9e761d119e5b" />

This tab shows user reviews.

<img width="412" height="746" alt="image" src="https://github.com/user-attachments/assets/f167da5b-4534-46ed-b19a-d7c7c9297cf9" />

This tab lists all the changes that users have made/contributed to the database. Basically a commits log.

<img width="410" height="946" alt="image" src="https://github.com/user-attachments/assets/13c1adac-9cda-4beb-9c24-6f2fcc645df1" />

This is the star of all of Bubbly's features: an AI assistant. You can ask it for details about the bubbler, summarise user reviews, and ask it questions like "Can my dog drink water here, is it dog friendly". We use Ollama + our own custom agent functions to call the Bubbly API for data.

<img width="405" height="742" alt="image" src="https://github.com/user-attachments/assets/63fffd7f-5601-4496-80be-9660c35c5951" />

## Self-hosting Bubbly

You can easily get started hosting the production ready version of Bubbly by editing this ``docker-compose.yml`` file:

```yaml
version: "3.9"

services:
  bubbly:
    image: ghcr.io/linuskang/bubbly/bubbly:latest
    container_name: bubbly
    ports:
      - "3400:3400"
    environment:
      DATABASE_URL: "mysql://user:password@localhost:3306/bubbly" # change to your database creds
      NEXTAUTH_SECRET: "0KprtXWjpbLzXAnNR+BUREhglOjCUvnjIMki5Uq+JAs=" # change to whatever you want.
      NEXTAUTH_URL: "https://your_app_url_to_access_bubbly"
      RESEND_API_KEY: "your_resend_api_key" # https://resend.com
      API_KEY: "change_this_to_whatever_you_want"
      OLLAMA_API_URL: "https://agent.linus.id.au" # use my prebuilt agent ai server
      DISCORD_WEBHOOK_URL: "https://your_discord_webhook" # https://discord.com/developers
      SEQ_URL: "https://your_seq_logging_server" # https://datalust.co
    restart: unless-stopped
```

Edit the compose file in ``bubbly/App/docker-compose.yml`` and run the following to finish setting up:

```bash
sudo docker-compose up -d
```

## Docs for developers

API documentation is available at https://bubbly.linuskang.au/docs or your own self hosted instance /docs.

## Tech stack

Below contains basically every technical detail about my app, including the softaere and hardware maps.

- Next.js - App framework
- Auth.js - Authentication
- Resend - Emails
- MySQL Server w/ Prisma
- MapLibre GL - Map library
- Shadcn/ui - UI framework
- TileServer GL - Map tile server

Below are detailed diagrams of how Bubbly is set up and maintained, including our software and hardware layouts.

<img width="714" height="647" alt="image" src="https://github.com/user-attachments/assets/dcc43d4c-3c6b-45ef-9a0f-ca255781069c" />
<img width="717" height="661" alt="image" src="https://github.com/user-attachments/assets/c159365b-c243-4ff3-b304-4f8e88c25ddb" />
<img width="992" height="663" alt="image" src="https://github.com/user-attachments/assets/e90b6e29-1c9d-474c-bcb6-008d7d558495" />

----

### What's different about my platform from others?

Bubbly is different from other water fountain locator tools because it is a user-driven platform where people contribute and edit the database, with a trust system that ensures only reliable users can make changes, keeping the information accurate and up to date. This means that Bubbly doesn't rely on a single endpoint for recieving waypoint data. It uses multiple verified sources mixed together to create our huge dataset. We've changed up the Bubbler Map space by allowing verified users with enough XP from reviews to start contributing to the platform, allowing them to edit and add water bubblers. This helps us keep our information heavily updated so we can get reliable data. I personally source and import accurate datasets from across the internet, then manually verify their location and details. Verified entries are marked as admin verified, giving users confidence that they can rely on the data.

But accuracy doesn’t stop there. Because things are constantly changing, I cant update everything quickly as it happens, so Bubbly is designed to be community-driven:

- Any user can add new bubblers, edit incorrect details, or leave reviews about water quality, accessibility, and condition.

- Contributions earn XP. As users gain XP, their edits are trusted more and require less review, gradually unlocking new editing privileges.

- All contributions are scanned for spam, abuse, or inaccurate info before they go live. Suspicious submissions are flagged for manual review.

- Each contribution is linked to the user who made it, building a public contribution history to encourage responsibility and transparency.

- Edits are versioned so incorrect data can be rolled back if necessary, ensuring long-term accuracy.

In the long term, I'm heavily aiming to become the world’s most detailed, updated, community driven repository of drinking water locations. Beyond simply mapping bubblers, the platform will provide open data access for governments, event organizers, and developers to integrate into their services, helping cities plan maintenance and improve accessibility. My included gamification elements like badges, leaderboards, and community ranks will encourage sustained contributions, while analytics dashboards will give insights into water quality, usage trends, and infrastructure gaps. Ultimately, Bubbly envisions a future where everyone has easy access to safe, reliable drinking water while reducing single-use plastic consumption and supporting sustainable communities globally.

----

### Early beta user feedback

I invited 50 randomly selected students from Calamvale Community College to test the platform. The response was overwhelmingly positive with 90% of users said the platform was a smart idea. Some participants raised concerns that a user-contribution system could be abused by bad actors. To address this, I implemented:

- An XP tiering system that gradually unlocks editing permissions as users contribute accurate information over time.

- AI-powered moderation to detect and filter out inappropriate or misleading reviews before they are published.

----

### Sustainability towards the future

Looking forward, Bubbly has the potential to scale into an enterprise platform by partnering with:

- Local councils and governments

- Schools and universities

- Event organisers

- Public venue and transport management groups

These partnerships could ensure an accurate, nationwide database of water bubblers is maintained. Furthermore, the platform is designed to be extensible: future updates are planned to include locating public toilets, as well as other essential amenities.

----

## Developing on Bubbly

> [!NOTE]
> If you are just wanting to deploy the production ready version of bubbly, you can follow the ``docker-compose`` above and just host the app standalone.
>
> I only recommend you self host every service for Bubbly if your developing and contributing to the repository.

Bubbly comprises of several parts:

* Main app (https://bubbly.linuskang.au)
* Database via. MySQL (http://192.168.10.87:3006)
* MapTilerGL via. Docker (https://tiles.linus.id.au)
* Seq via. Docker (https://seq.linus.id.au & https://seqlogging.linus.id.au)
* Ollama via. Windows/Linux - GPU RECOMMENDED! (https://ollama.linus.id.au)
* OllamaFunctionsAPI via. python (https://agent.linus.id.au)

Each section below will guide you on how to self-host the services via. docker containers.

### Hardware and OS specs

To get the best experience, we recommend you self-host Bubbly with the following minimum OS and hardware specs:
* Ubuntu
* 16gb DDR4
* 64gb NVME
* AMD Ryzen 5 5500U
* RTX 3060 or above (for AI inferencing)

### Prerequisites 

To fully host Bubbly, you will need the following:
* Node.js
* Npm
* Git
* Python3.x

You can install these dependencies like so:

```shell
sudo apt update
sudo apt install -y nodejs npm git python3 python3-venv
```

Additionally, please ensure you have both **Docker** and ``docker-compose`` installed. You can follow those setup instructions [here](https://docs.docker.com/desktop/setup/install/linux/ubuntu/)

> [!TIP]
> If your wanting to use Portainer to manage all of Bubbly's services, you can create the docker container for it using:
> ```shell
> docker volume create portainer_data
> docker run -d -p 9000:9000 -p 9443:9443 --name portainer \
> --restart=always \
> -v /var/run/docker.sock:/var/run/docker.sock \
> -v portainer_data:/data \
> portainer/portainer-ce:latest
> ```
>Access it's WebUI at http://YOUR_SERVER_IP:9000

Next, clone the Bubbly repository for its source:

```shell
git clone https://github.com/linuskang/bubbly
cd bubbly
```

----

### Installing TileServerGL (Map server)

> [!NOTE]
> This docker container is completely optional, as you can use the existing one at ``https://tiles.linus.id.au``.

Enter the TileServer directory:
```shell
cd TileServer
```

Next, go to [this site](https://data.maptiler.com/downloads/tileset/osm/australia-oceania/australia/) to download the Australia ``.mbtiles`` file. This file contains all the map data for TileServer GL to render as tiles. Place this file inside ``bubbly/TileServer/data`` and rename it to ``australia.mbtiles``.

After, run the docker compose script in ``bubbly/TileServer``

```shell
sudo docker compose up -d
```

All set up! You can access your map tile server at http://YOUR_SERVER_IP:8080.

----

### Installing Seq (logging server)

> [!NOTE]
> This docker container is completely optional, as it justs gives you a logging server to track the HTTP requests coming into your Bubbly app instance.

Enter ``/Seq``.

```shell
cd Seq
```

Next, run the docker compose script:

```shell
sudo docker compose up -d
```

You can access the Seq web UI at http://YOUR_SERVER_IP:2000 and the logging server listens at http://YOUR_SERVER_IP:5341.

----

### Installing Ollama (AI Model Server)

> [!NOTE]
> This docker container is completely optional, as you can use the existing one at https://ollama.linus.id.au

Install Ollama for your operating system [here](https://ollama.com/download).

> [!TIP]
> If you want fast AI responses, we highly recommend you to run Ollama on a GPU. This will significantly boost response times.

> [!NOTE]
> If you are running ollama on a different server from your Bubbly App, please ensure you have exposed Ollama to the network. By default, this is turned off, only listening to requets in ``locahost``.

Ollama will run at http://YOUR_SERVER_IP:11434

Next, install the ``GPT-OSS:7B`` using this command in terminal:

```shell
ollama pull gpt-oss:7b
```

Your done! You can test the model using ``ollama run``:

```shell
ollama run gpt-oss:7b
```

----

### Installing OllamaFunctionsAPI

> [!NOTE]
> This docker container is completely optional, as you can use the existing one at https://agent.linus.id.au

Run the following commands below to install the Agent Functions API:

```shell
cd OllamaFunctionsAPI
python3 -m venv venv
source venv/bin/activate
pip install requests fastapi pydantic ollama uvicorn
```

> [!NOTE]
> Please change the ``origins`` URL's to your own inside of ``OllamaFunctionsAPI/app/app.py`` to your own to avoid CORS related issues, and also change the Ollama API URL if needed - default to http://localhost:11434.

> [!NOTE]
> Please change the ``BASE_URL`` for the API inside of ``OllamaFunctionsAPI/app/utils/tools.py`` to your own Bubbly App Instance.

Run the FastAPI server using:

```shell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The AI Functions API will be listening at http://YOUR_SERVER_IP:8000

----

### Running the Bubbly app & database

#### Database Configurations
Download ``mariadb``:

```shell
sudo apt update
sudo apt install mariadb # or mysql-server
```

Setup the database.

```shell
sudo mysql
create database Bubbly;

# Create user account for APIs
CREATE USER 'your_database_username'@'localhost' IDENTIFIED BY 'your_username_password';
GRANT ALL PRIVILEGES ON *.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL terminal
exit;
```

----

#### Running the Bubbly App

> [!TIP]
> You can host Bubbly in production using it's docker image if your not developing on it.
> 
> Below are the commands to get your container running:
> ```shell
> cd App
> nano docker-compose.yml # EDIT THE ENV VALUES TO YOUR OWN
> sudo docker compose up -d # INSTALL AND RUN THE IMAGE
> ```
> 
> Access Bubbly at http://your_server_ip:3400

Install dependencies:

```bash
cd App
npm install
```

Copy and edit the ``.env`` values to your own:

```shell
cp .env.example .env # edit values to your own
```

> [!NOTE]
> If you are not self-hosting the microservices, you can use this sample ``.env`` file and change the App Configs to your own. Please note that ratelimits apply when using ``.linus.id.au`` services.
> ```shell
> # General
> DATABASE_URL="mysql://your_database_user:your_database_password@localhost:3306/your_database_name"
> NEXTAUTH_SECRET=0KprtXWjpbLzIAnNR+BUREhglOjCUvnjIMki5Uq+JMs= # generate your own using ``openssl rand -hex 32``
> NEXTAUTH_URL=http://localhost:3400 # change to your Bubbly app url
> 
> # Map settings
> NEXT_PUBLIC_MAP_STYLE=openstreetmap
> NEXT_PUBLIC_TILESERVER_URL=https://tiles.linus.id.au # existing map server
> 
> # Email server
> RESEND_API_KEY=re_your_mail_api_key # get your own api key at https://resend.com. Please note that having a Resend API key is required for all account features on the platform.
> 
> # API
> API_KEY=change_this_to_anything_secure
> NEXT_PUBLIC_OLLAMA_API_URL=https://agent.linus.id.au # existing public instance
> DISCORD_WEBHOOK_URL=your_discord_webhook_url # go to discord.com and create a discord server with a webhook. This webhook will recieve all user requests like when creating/editing reviews, etc..
> SEQ_URL=your_seq_url # http://ip:5341
>
> # Debug (DO NOT CHANGE)
> NEXT_PUBLIC_VERSION=1.6.0
> ```

Next, deploy the database migrations to your database:

```shell
npx prisma migrate deploy
npx prisma generate
```

Now, you can run the Bubbly app using:

```shell
npm run dev
```

## Terms

### 1. Eligibility

You must be at least 13 years old to use Bubbly. By using the App, you confirm that you meet this age requirement and have the legal capacity to enter into this agreement.

### 2. Accounts

To access certain features, you must create an account. You agree to:

- Provide accurate and up-to-date information.

- Keep your login credentials secure.

- Be responsible for all activity under your account.

- We may suspend or terminate your account if you violate these Terms.

### 3. User Content

Bubbly allows users to submit and share content, including bubbler locations, reviews, photos, and other information (“User Content”).

By submitting User Content, you:

- Grant us a worldwide, non-exclusive, royalty-free licence to use, display, and distribute your content on the App.

- Confirm you own or have the right to share the content.

- Agree not to post anything unlawful, misleading, or offensive.

- We may remove any User Content at our discretion.

### 4. Location Data

The App may collect and use your device’s GPS location to show nearby water bubblers. You can disable location access at any time in your device settings, but certain features may not function without it.

### 5. Paid Features and Advertising

Bubbly may offer paid features, subscriptions, or display third-party advertisements.

Payments are handled through your device’s app store and are non-refundable except as required by law.

We are not responsible for the content or actions of third-party advertisers or links.

### 6. Privacy

Your privacy is important to us. By using Bubbly, you agree that we may collect and process personal data (including name, email, and location data) in accordance with our **Privacy Policy**.

### 7. Acceptable Use

You agree not to:

- Use the App for unlawful purposes.

- Attempt to hack, disrupt, or interfere with the App.

- Impersonate others or misrepresent your identity.

- Add false information onto the databases.

### 8. Termination

We may suspend or terminate your access to Bubbly at any time without notice if you violate these Terms. Upon termination, your right to use the App ends immediately.

### 9. Disclaimers and Liability

Bubbly is provided “as is” and “as available” without warranties of any kind.

We do not guarantee the accuracy or availability of any bubbler locations or information provided by users.

To the maximum extent permitted by law in Australia, we are not liable for any loss, damage, or injury resulting from your use of the App.

### 10. Governing Law

These Terms are governed by the laws of Australia. Any disputes will be subject to the exclusive jurisdiction of the courts located in Australia.

### 11. Changes to These Terms

We may update these Terms from time to time. We will notify users of significant changes, and continued use of the App means you accept the updated Terms.

### Contact Us
If you have any questions about these Terms, please contact us at: email@linus.id.au

## Privacy

I collect the following from all users accessing the platform:

- IP Addresses
- Emails
- Name
- Profile picture (if any)
- Detailed logs of your actions on the platform
- Location (if enabled, will only store on your local device)

This is to ensure security on my platform. If you would like to dispute or remove any of your data, you can either delete your account with security logs still being accessable by me, or contact me directly at email@linus.id.au to remove your data.

View the full policy at https://lkang.au/privacy

## License

**Bubbly** is under **CC BY-NC 4.0**. See [LICENSE](LICENSE) for more details.

## Credit

**Bubbly** is a project by **Linus Kang**. For any enquiries, please reach out at **email@linus.id.au**





















