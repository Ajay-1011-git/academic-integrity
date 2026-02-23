const express = require('express');
const app = express();
const professorRoutes = require('./src/routes/professorRoutes');

app.use('/api/professor', professorRoutes);

const routes = [];
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        routes.push(middleware.route.path);
    } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
            let route = handler.route;
            if (route) {
                routes.push(route.path);
            }
        });
    }
});

console.log('Registered Professor Routes:');
console.log(routes);
