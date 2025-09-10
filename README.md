# Bubbly: Mapping out Australia's water fountains

**Bubbly** is an all-in-one app designed to help you locate your nearest water fountain. Open sourced.

This was my submission for the *2025 Premier Coding Comp* in Australia.

You can access **Bubbly** at https://bubbly.linuskang.au.

## Tech stack

- Next.js - App framework
- Auth.js - Authentication
- Resend - Emails
- MySQL Server w/ Prisma
- MapLibre GL - Map library
- Shadcn/ui - UI framework
- TileServer GL - Map tile server
- Any many more...

## Locally hosting the entire project

Bubbly has several hosted components that you need to self-host in order to get the entire app working. For me, that is:
* Main app (https://bubbly.linuskang.au)
* Database via. MySQL (http://192.168.10.87:3006)
* MapTilerGL via. Docker (https://tiles.linus.id.au)
* Seq via. Docker (https://seq.linus.id.au & https://seqlogging.linus.id.au)
* Ollama via. Windows/Linux - GPU RECOMMENDED! (https://ollama.linus.id.au)
* OllamaFunctionsAPI via. python (https://agent.linus.id.au)

Each section below will guide you on how to self-host the services via. docker containers with **Portainer**

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
* Portainer (optional)
* Python3.x

You can install these dependencies like so:

```shell
sudo apt update
sudo apt install -y nodejs npm git python3 python3-venv
```

Additionally, please ensure you have both **Docker** and **``docker-compose`` installed. You can follow those setup instructions [here](https://docs.docker.com/desktop/setup/install/linux/ubuntu/)

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

## License

**Bubbly** is under **CC BY-NC 4.0**. See [LICENSE](LICENSE) for more details.

## Credit

**Bubbly** is a project by **Linus Kang**. For any enquiries, please reach out at **email@linus.id.au**

