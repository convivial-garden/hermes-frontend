# build environment
# pull official base image
FROM node:18.12.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile
# add app
COPY . ./
ENV ASSET_URL https://frontend.hermes/
RUN npm run build


# production environment
FROM nginx:stable-alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

