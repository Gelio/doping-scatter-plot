require('bootstrap/dist/css/bootstrap.css');
require('./app/styles/main.scss');

if(process.env.NODE_ENV === 'development')
    require('./public/index.html');

require('./app/scripts/main.js');