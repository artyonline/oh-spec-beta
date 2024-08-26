const {Schema, model } = require('mongoose');

const userProfileSchema = new Schema(
    {
        userId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        globalName: {
            type: String,
            required: true
        },
        specialization: {
            type: [String],
            required: true,
            default: []
        },
        spec1: {
            type: String,
            required: false
        },
        spec2: {
            type: String,
            required: false
        },
        spec3: {
            type: String,
            required: false
        },
        spec4: {
            type: String,
            required: false
        },
        spec5: {
            type: String,
            required: false
        },
        spec6: {
            type: String,
            required: false
        },
        spec7: {
            type: String,
            required: false
        },
        spec8: {
            type: String,
            required: false
        },
        spec9: {
            type: String,
            required: false
        },
        spec10: {
            type: String,
            required: false
        },
        guildId: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = model('UserProfile', userProfileSchema);