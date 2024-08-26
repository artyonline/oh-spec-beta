const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType} = require('discord.js')
const { SpecializationList } = require('../Assets/Specialization');
const UserProfile = require('../Schemas/UserSchema');

const data = {
    name: 'select-spec',
    description: 'Show All Specialization'
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

    var categorizedArray = categorizeArray(SpecializationList);
    var categoryArray = []
    Object.keys(categorizedArray).forEach((key, idx, arr) => {
        categoryArray.push(key)
    });

    const categoryMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Select Your Specialization!")
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
};

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
    let currentUser = await UserProfile.findOne({
        userId: interaction.user.id
    });

    //Check if User Exists, else create.
    var categorySpec = [];
    if(currentUser) {
        specializationList.forEach(item => {
            if (item.catergory === category && !(currentUser.specialization.includes(item.label))) {
                categorySpec.push(item)
            }
        })
    } else {
        specializationList.forEach(item => {
            if (item.catergory === category) {
                categorySpec.push(item)
            }
        })
    }
    const maxLimit = categorySpec.length > 10 ? 10-currentUser.specialization.length : categorySpec.length - currentUser.specialization.length
    const specMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Select Category to Begin!")
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
        content: `Select Your '${category}' Specializations`,
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
                interaction.reply(`Following Specializations are updated: ${interaction.values.join(', ')}`)
                await updateDB(interaction, interaction.values);
            }
        });

    } catch (e) {
        console.log(e)
    }
}

async function updateDB(interaction, selectedSpec) {
    let currentUser = await UserProfile.findOne({
        userId: interaction.user.id
    });

    //Check if User Exists, else create.
    if(!currentUser) {
        currentUser = new UserProfile({
            userId: interaction.user.id,
            username: interaction.user.username,
            globalName: interaction.user.globalName,
            guildId: interaction.guildId,
        })
    }

    if (selectedSpec.length > 0) {
        selectedSpec.forEach((spec, idx) => {
            console.log(`Saving Spec: ${spec} at ${idx} for user: ${interaction.user.globalName}`);
            var totalSpec = selectedSpec.length + currentUser.specialization.length;
            if (totalSpec>=10) {
                // interaction.reply("Your Current Specialization Amount plus newly selected Specialization amount exceeds the maximum allowed 10, please consider removing old specializations using /remove-spec before selecting new ones. ")
                console.log("Your Current Specialization Amount plus newly selected Specialization amount exceeds the maximum allowed 10, please consider removing old specializations using /remove-spec before selecting new ones. ")
                return;
            }
            if(!(currentUser.specialization.includes(spec))) {
                currentUser.specialization.push(spec)
            }
        });
    }

    await currentUser.save();
}

module.exports = {data, run};

