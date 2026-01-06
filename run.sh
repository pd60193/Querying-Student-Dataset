rm -rf ./node_modules
npm install
npm install -g @angular/cli
cd client
ng build --configuration production
cd ..
rm -rf ./public
mkdir ./public
cp -R ./client/dist/client/browser/* ./public/ 
node app.js
