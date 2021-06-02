const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_DEV, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('mongodb connected...')
}).catch((e) => {
    console.log(e)
});