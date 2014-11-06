var domain;
//@if ENV='dev'
domain = 'http://localhost:3000';
//@endif

//@if ENV='prod'
domain = 'http://imba-app.herokuapp.com';
//@endif
var ClientConfig = {
    domain: domain
}