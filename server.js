import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

/**
 * @typedef {object} User
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * @typedef {object} Tweet
 * @property {string} id
 * @property {string} text
 * @property {string} userId
 */

/**
 * @type {Tweet[]}
 */
let tweets = [
  {
    id: "1",
    text: "Hello World",
    userId: "5",
  },
  {
    id: "2",
    text: "Hello World",
    userId: "2",
  },
  {
    id: "3",
    text: "Hello World",
    userId: "3",
  },
];

/**
 * @type {User[]}
 */
let users = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Doe",
  },
  {
    id: "3",
    firstName: "John",
    lastName: "Smith",
  },
];

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
  }
  """
  A tweet object created by a user
  """
  type Tweet {
    id: ID!
    text: String!
    author: User!
  }
  type Movie {
    id: Int!
    url: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Int!
    genres: [String!]!
    summary: String
    description_full: String!
    synopsis: String
    language: String!
    background_image: String!
  }
  type Query {
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    allUsers: [User!]!
    allMovies: [Movie!]!
    movie(id: String!): Movie
  }
  type Mutation {
    postTweet(text: String, userId: ID): Tweet
    deleteTweet(id: ID): Boolean
  }
`;

const resolvers = {
  Query: {
    allTweets() {
      return tweets;
    },
    /**
     * @param {any} parent
     * @param {{id: string}} args
     */
    tweet(_, args) {
      console.log(args);
      return tweets.find((tweet) => tweet.id === args.id);
    },
    allUsers() {
      console.log("all users called");
      return users;
    },
    allMovies() {
      return fetch("https://yts.mx/api/v2/list_movies.json")
        .then((res) => res.json())
        .then((data) => {
          console.log(data.data.movies);
          return data.data.movies;
        })
        .catch((err) => {
          throw new Error(err);
        });
    },
    movie(_, { id }) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((res) => res.json())
        .then((json) => json.data.movie)
        .catch((err) => {
          throw new Error(err);
        });
    },
  },
  Mutation: {
    /**
     * @param {any} parent
     * @param {{text: string, userId: string}} args
     * @returns {Tweet}
     * */
    postTweet(_, args) {
      const newTweet = {
        id: new Date().getTime().toString(),
        text: args.text,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    /**
     * @param {any} parent
     * @param {{id: string}} args
     * @returns {Boolean}
     * */
    deleteTweet(_, args) {
      const targetTweet = tweets.find((tweet) => tweet.id === args.id);
      if (!targetTweet) {
        return false;
      }
      tweets = tweets.filter((tweet) => tweet.id !== args.id);
      return true;
    },
  },
  User: {
    fullName(parent) {
      return `${parent.firstName} ${parent.lastName}`;
    },
  },
  Tweet: {
    author(parent) {
      const user = users.find((user) => user.id === parent.userId);
      if (!!user) {
        return user;
      } else {
        throw new Error("User not found");
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`runnnig on ${url}`);
});
