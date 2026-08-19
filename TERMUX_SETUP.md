# Running this on Termux

## 1. Install prerequisites
```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts git python -y
pip install kagglehub pandas
```

## 2. Get the project onto your phone
Easiest path: put these files in a GitHub repo (or a zip you AirDrop/transfer over), then:
```bash
git clone <your-repo-url> efootball-app
cd efootball-app
```
Or just recreate the folder structure below manually with `nano`/`vi`.

## 3. Install app dependencies
```bash
npm install
```

## 4. (Optional but recommended) Pull real player data
```bash
cd scripts
python fetch_players.py
cd ..
```
This downloads the Kaggle eFootball dataset and writes `public/players.json`,
which the app auto-loads as your starting roster instead of the single sample player.

Kaggle requires an API token the first time:
```bash
mkdir -p ~/.kaggle
nano ~/.kaggle/kaggle.json   # paste {"username":"...","key":"..."} from kaggle.com/settings
chmod 600 ~/.kaggle/kaggle.json
```

## 5. Run the app
```bash
npm run dev -- --host
```
Open the printed `http://<phone-ip>:5173` in a browser (works on the phone itself or
any device on the same wifi).

## 6. Run the tournament room server (separate terminal / Termux session)
```bash
cd server
npm install
node server.js
```
Runs on `http://<phone-ip>:3001`. The app's Tournaments tab talks to this by default
at `http://localhost:3001` — change `SERVER_URL` in `src/TournamentRoom.jsx` if you're
hosting the server on a different device.

To let friends off your wifi join the tournament room, tunnel it, e.g.:
```bash
pkg install cloudflared -y
cloudflared tunnel --url http://localhost:3001
```
then update `SERVER_URL` to the `https://*.trycloudflare.com` link it gives you.

## Two Termux sessions
Keep the frontend (`npm run dev`) and the tournament server (`node server.js`)
running in separate Termux sessions — swipe from the left edge to open a new one,
or use `tmux`.
