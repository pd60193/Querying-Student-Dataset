cd client
ng build --configuration production
cd ..
cp -R /Users/priyamdhanuka/raindrop-express-app/client/dist/client/browser/* ./public/ 
node app.js
