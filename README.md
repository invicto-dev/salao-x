# Salão X 💇‍♀️✨

_A complete, containerized full-stack development environment with Docker._

This project contains the frontend and backend for the Salão X platform. The development environment is fully managed by Docker, ensuring consistency and ease of setup on any machine.

---

## 📚 Table of Contents

- [Tech Stack](https://www.google.com/search?q=%23-tech-stack)
- [Prerequisites](https://www.google.com/search?q=%23-prerequisites)
- [Getting Started](https://www.google.com/search?q=%23-getting-started)
- [Available Scripts](https://www.google.com/search?q=%23-available-scripts)
- [Working with the Database](https://www.google.com/search?q=%23-working-with-the-database)
- [Troubleshooting](https://www.google.com/search?q=%23-troubleshooting)

---

## 🚀 Tech Stack

The main project stack includes:

- **Frontend:** Vite.js, TypeScript
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Database:** PostgreSQL
- **Environment:** Docker, Docker Compose

---

## ✅ Prerequisites

Before you begin, ensure you have the following tools installed on your machine:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

> **Note:** You do not need to install Node.js or PostgreSQL locally. Docker will handle creating and managing the correct versions for you\!

---

## 🏁 Getting Started

Follow these steps to get the complete environment running on your machine.

**1. Clone the Repository**

```bash
git clone https://github.com/invicto-dev/salao-x.git
cd salao-x
```

**2. Set Up Environment Variables**

The project requires a `.env` file to configure passwords and API keys. We provide an example file to make this easier.

Copy the example file to create your local `.env` file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in any missing variables, such as `JWT_SECRET` and other API keys. The default values for the database should already work.

**3. Make Scripts Executable**

This step is only necessary on Linux and macOS systems.

```bash
chmod +x scripts/*.sh
```

**4. Start the Docker Environment**

Use our script to build the images and start all containers.

```bash
./scripts/start.sh
```

The first time you run this command, it may take a few minutes as Docker will need to download the base images and install all dependencies.

**Done\!** 🎉 Your environment is now live:

- **Frontend:** [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
- **Backend API:** [http://localhost:3000/api](https://www.google.com/search?q=http://localhost:3000)

---

## 🛠️ Available Scripts

To simplify day-to-day tasks, we have created a few scripts in the `/scripts` folder:

| Command                       | Description                                                                        |
| :---------------------------- | :--------------------------------------------------------------------------------- |
| `./scripts/start.sh`          | Builds (if necessary) and starts all containers in the background.                 |
| `./scripts/stop.sh`           | Stops and removes the application's containers, networks, and volumes.             |
| `./scripts/logs.sh [service]` | Displays real-time logs. E.g., `./scripts/logs.sh backend` or `./scripts/logs.sh`. |
| `./scripts/db-migrate.sh`     | Executes a new Prisma migration.                                                   |
| `./scripts/db-generate.sh`    | Runs `prisma generate` to update the Prisma Client.                                |
| `./scripts/db-seed.sh`        | Populates the database with data from the seed file.                               |

---

## 🐘 Working with the Database

All changes to the database structure are managed by Prisma through migrations.

**Workflow for creating a new migration:**

1.  Change the `/backend/prisma/schema.prisma` file (e.g., add a new field to a model).

2.  Run the migration script in your terminal, giving a name to your change:

    ```bash
    ./scripts/db-migrate.sh "descriptive-migration-name"
    ```

    Example: `./scripts/db-migrate.sh "add-phone-to-user"`

This will generate a new migration file and apply the changes to your Docker database.

---

## 🤔 Troubleshooting

- **"Port is already in use" error**: Check if you have another service (like a local PostgreSQL instance) running on ports `5432`, `3000`, or `5173`.
- **Strange behavior or persistent errors**: Sometimes, Docker can maintain a stale state (cache or volumes). To force a complete cleanup, run:
  ```bash
  docker compose down -v
  ```
  The `-v` flag removes the volumes, including the database data. Afterward, run `./scripts/start.sh` again to rebuild everything from scratch.
