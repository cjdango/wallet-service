import koa from 'koa'; // koa@2
import koaRouter from 'koa-router';
import { ApolloServer } from 'apollo-server-koa';

import typeDefs from './typedefs';
import resolvers from './resolvers';

export const app = new koa();

const router = new koaRouter();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

app.use(router.routes());
app.use(router.allowedMethods());
