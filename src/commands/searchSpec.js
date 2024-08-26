const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType} = require('discord.js')
const { SpecializationList } = require('../Assets/Specialization');
const UserProfile = require('../Schemas/UserSchema');

const data = {
    name: 'search-spec',
    description: 'Select Specialization to search for players with matching specializations'
}

/**
 * 
 * @param {Object} param0
 * @param {import('discord.js').ChatInputCommandInteraction} param0.interaction 
 */
async function run({ interaction }) {
    // Commands can only be executed in a discord server
    if (!interaction.inGuild()) {
        interaction.reply({
            content: "This command can only be executed in a server.",
            ephemeral: true
        });
        return;
    }

    // Build Category Menu
    var categorizedArray = categorizeArray(SpecializationList);
    var categoryArray = []
    Object.keys(categorizedArray).forEach((key, idx, arr) => {
        categoryArray.push(key)
    });
    const categoryMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Select Category to Begin!")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(categoryArray.map( (key) => 
            new StringSelectMenuOptionBuilder()
            .setLabel(key)
            .setDescription(`${key} Related Specialization`)
            .setValue(key)
    ));

    const actionRow = new ActionRowBuilder().addComponents(categoryMenu);

    const reply = await interaction.reply({
        content: "Choose Specialization Category",
        components: [actionRow],
        fetchReply: true,
    })

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 60_000
    })

    collector.on('collect', async (interaction) => {
        await showCategorySpec(interaction, SpecializationList, interaction.values[0]);
    });
}

function categorizeArray(arr) {
    var newArr = {};
    arr.forEach(item => {
        if(!newArr.hasOwnProperty(item.catergory)) {
            newArr[item.catergory] = []
        } 
        newArr[item.catergory].push(item);
    });
    return newArr;
}

async function showCategorySpec(interaction, specializationList, category) {

    //Check if User Exists, else create.
    var categorySpec = [];
    specializationList.forEach(item => {
        if (item.catergory === category) {
            categorySpec.push(item)
        }
    })
    const maxLimit = categorySpec.length > 10 ? 10 : categorySpec.length
    const specMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Select Specialization to Search!")
    .setMinValues(0)
    .setMaxValues(maxLimit)
    .addOptions(categorySpec.map((item) => 
            new StringSelectMenuOptionBuilder()
            .setLabel(item.label)
            .setDescription(item.description.substring(0,100))
            .setValue(item.label)
    ));

    const row2 = new ActionRowBuilder().addComponents(specMenu);

    const reply2 = await interaction.reply({
        content: `Select Specialization to Search!`,
        components: [row2],
        fetchReply: true
    })

    try {
        const collector2 = reply2.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
            time: 60_000
        })

        collector2.on('collect', async (interaction) => {
            if(interaction.values.length > 0) {
                var userList = await searchUsers(interaction, interaction.values);
                if (userList.length > 0) {
                    var replyMessage = `Here are the Metas with the Selected Specialization`;
                    userList.map(user => {
                        var appendMessage = `\n${user.globalName}: Has the Selected Specializations.`
                        replyMessage = replyMessage.concat(appendMessage)
                    });
                    interaction.reply(replyMessage)
                } else {
                    interaction.reply("There are No Metas that have the selected Specialization!")
                }
            }
            return;
        });

    } catch (e) {
        console.log(e)
    }
}

async function searchUsers(interaction, specList) {
    let users = await UserProfile.find(
        {
            specialization: { $gt : 0 },
            specialization: {$all: specList},
            guildId: interaction.guildId
        }
    )
    return users;

}

module.exports = {data, run};