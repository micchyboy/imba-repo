var mongoUrl;

//@if ENV='dev'
mongoUrl = "mongodb://localhost/re_db";
//@endif

//@if ENV='prod'
mongoUrl = "mongodb://jethro:michyboy237@linus.mongohq.com:10037/imba_db";
//@endif

module.exports = {
    mongoUrl: mongoUrl
}