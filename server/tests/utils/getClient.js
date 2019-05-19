import ApolloBoost from 'apollo-boost';

export default jwt => {
  return new ApolloBoost({
    uri: process.env.DOMAIN_FULL + ':' + process.env.PORT || 4000, //'http://localhost:4000',
    request(operation) {
      if (jwt) {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        });
      }
    }
  });
};
