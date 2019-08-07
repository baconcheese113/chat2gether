const { Prisma } = require('prisma-binding');

const prisma = new Prisma({
  typeDefs: '../src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET
});

const setup = async () => {
  const genders = ['MALE', 'FEMALE', 'M2F', 'F2M'];
  const audioPrefs = ['NO_AUDIO', 'MOANS', 'CONVERSATION', 'ROLEPLAY'];

  genders.forEach(async gender => {
    await prisma.mutation.createGenderObject({ data: { name: gender } });
  });
  audioPrefs.forEach(async audioPref => {
    await prisma.mutation.createAudioPrefObject({ data: { name: audioPref } });
  });
};

// Remember to call setup method in the end
setup();
