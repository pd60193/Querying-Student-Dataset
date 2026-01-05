cd client
ng build --configuration production
cd ..
rmdir ./public
mkdir ./public
cp -R ./client/dist/client/browser/* ./public/ 
node app.js
