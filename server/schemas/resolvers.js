const { User } = require('../models');
const { AuthenticationError } = require("apollo-server-express")
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findOne({ _id: context.user._id }).select("-__v -password")

                return user;
            }
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);

            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { content }, context) => {
            if (context.user) {
                const userBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: content } },
                    { new: true }
                )

                return userBook;
            }
            throw new AuthenticationError("No user found");
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const deleteBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: bookId } },
                    { new: true }
                )

                return deleteBook
            }

            throw new AuthenticationError("No user found");
        },
    }
};



module.exports = resolvers;
