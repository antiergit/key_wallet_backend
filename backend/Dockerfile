FROM node:18.18.2

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
RUN npm install -g ts-node

#RUN apt install sudo

# RUN apt-get update && apt-get install -y gconf-service libasound2 libatk1.0-0 libcairo2 libcups2 libfontconfig1 libgdk-pixbuf2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libxss1 fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils -y
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install
# RUN apt-get install -y chromium
# RUN npm install puppeteer
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "start" ]