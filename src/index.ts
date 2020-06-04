import mongoose from 'mongoose';
import { server } from './app';

mongoose
  .connect('mongodb://127.0.0.1:27017/wallet-exercise', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: 'approot',
    pass: 'approot',
  })
  .then(() => {
    console.log('successfully connected to the database');
  })
  .catch((err) => {
    console.log('error connecting to the database', err);
    process.exit();
  });

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
